import { createClient } from "npm:@supabase/supabase-js@2.112.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_MODEL = "gemini-2.5-flash-lite";

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Missing auth header" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const body = await req.json();
    const { questionText, questionCategory, audio, audioMimeType, durationSeconds } = body;

    if (!audio || !Array.isArray(audio) || audio.length === 0) {
      return jsonResponse({ error: "No audio data provided" }, 400);
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return jsonResponse({ error: "AI service not configured" }, 500);
    }

    // Pre-check Gemini quota (estimate ~3000 tokens for transcription + analysis with audio)
    const { data: preCheck, error: preCheckError } = await supabase.rpc("check_gemini_quota", {
      p_user_id: user.id,
      p_estimated_tokens: 3000,
    });

    if (preCheckError || !preCheck) {
      return jsonResponse({ error: "Failed to check usage quota" }, 500);
    }

    if (preCheck.allowed === false) {
      return jsonResponse({
        error: "Monthly AI token limit reached. Your quota resets in 30 days.",
        quota_exceeded: true,
        quota_used: preCheck.used,
        quota_limit: preCheck.limit,
        quota_period_start: preCheck.quota_period_start,
      }, 429);
    }

    // Convert audio byte array to base64
    const uint8 = new Uint8Array(audio);
    let binary = "";
    for (let i = 0; i < uint8.length; i++) {
      binary += String.fromCharCode(uint8[i]);
    }
    const audioBase64 = btoa(binary);

    // Step 1: Transcribe audio using Gemini
    const transcribeResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inline_data: {
                  mime_type: audioMimeType || "audio/webm",
                  data: audioBase64,
                },
              },
              {
                text: "Transcribe this audio recording exactly as spoken. Return only the transcript text, nothing else.",
              },
            ],
          }],
        }),
      },
    );

    if (!transcribeResponse.ok) {
      const errText = await transcribeResponse.text();
      console.error("Transcription failed:", errText);
      return jsonResponse({ error: "Transcription failed" }, 502);
    }

    const transcribeData = await transcribeResponse.json();
    const transcript = transcribeData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    const transcribeTokens = transcribeData?.usageMetadata?.totalTokenCount ?? 0;

    if (!transcript) {
      // Still count the tokens used for the failed transcription
      if (transcribeTokens > 0) {
        await supabase.rpc("increment_gemini_usage", {
          p_user_id: user.id,
          p_token_count: transcribeTokens,
        });
      }
      return jsonResponse({ error: "Could not transcribe audio" }, 422);
    }

    // Step 2: Analyze the transcript
    const wordCount = transcript.split(/\s+/).filter(Boolean).length;
    const wpm = durationSeconds > 0 ? Math.round((wordCount / durationSeconds) * 60) : 0;

    const fillerWords = ["um", "uh", "like", "you know", "basically", "actually", "literally", "sort of", "kind of"];
    const fillerCounts: Record<string, number> = {};
    let totalFillers = 0;
    const lowerTranscript = transcript.toLowerCase();
    for (const word of fillerWords) {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      const matches = lowerTranscript.match(regex);
      if (matches) {
        fillerCounts[word] = matches.length;
        totalFillers += matches.length;
      }
    }

    const analysisPrompt = `You are an interview coach. Analyze this spoken answer to the interview question: "${questionText}" (Category: ${questionCategory})

Transcript: "${transcript}"

Duration: ${durationSeconds} seconds
Words per minute: ${wpm}
Filler words detected: ${totalFillers} (${Object.entries(fillerCounts).map(([k, v]) => `"${k}" x${v}`).join(", ") || "none"})

Return a JSON object with exactly these fields:
{
  "clarity_score": <1-10 integer, how structured and understandable>,
  "structure_assessment": "<one sentence: did the answer have a clear beginning, middle, end?>",
  "corrections": ["<specific actionable suggestion>", "<another suggestion>"],
  "rewritten_example": "<a stronger, more concise version of the same answer, 2-4 sentences>",
  "confidence_estimate": "<one phrase describing estimated confidence based on word choice and structure>"
}

Return ONLY the JSON, no other text.`;

    const analysisResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: analysisPrompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 800 },
        }),
      },
    );

    const analysisData = analysisResponse.ok ? await analysisResponse.json() : null;
    const analysisTokens = analysisData?.usageMetadata?.totalTokenCount ?? 0;

    // Increment Gemini usage with combined token count from both calls
    const totalTokens = transcribeTokens + analysisTokens;
    if (totalTokens > 0) {
      await supabase.rpc("increment_gemini_usage", {
        p_user_id: user.id,
        p_token_count: totalTokens,
      });
    }

    let analysisResult = {
      clarity_score: 5,
      structure_assessment: "Unable to determine structure.",
      corrections: [] as string[],
      rewritten_example: "",
      confidence_estimate: "Unknown",
    };

    if (analysisData) {
      const rawText = analysisData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      try {
        const cleaned = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(cleaned);
        analysisResult = {
          clarity_score: typeof parsed.clarity_score === "number" ? Math.max(1, Math.min(10, parsed.clarity_score)) : 5,
          structure_assessment: parsed.structure_assessment ?? "Unable to determine structure.",
          corrections: Array.isArray(parsed.corrections) ? parsed.corrections.slice(0, 5) : [],
          rewritten_example: parsed.rewritten_example ?? "",
          confidence_estimate: parsed.confidence_estimate ?? "Unknown",
        };
      } catch {
        // If JSON parsing fails, use default values
      }
    }

    const result = {
      transcript,
      clarity_score: analysisResult.clarity_score,
      filler_word_count: totalFillers,
      filler_words: fillerCounts,
      pace_wpm: wpm,
      structure_assessment: analysisResult.structure_assessment,
      corrections: analysisResult.corrections,
      rewritten_example: analysisResult.rewritten_example,
      confidence_estimate: analysisResult.confidence_estimate,
    };

    return jsonResponse(result);
  } catch (err) {
    console.error("Clarity analysis error:", err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : "Analysis failed" },
      500,
    );
  }
});
