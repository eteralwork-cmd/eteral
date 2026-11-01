import { createClient } from "npm:@supabase/supabase-js@2.112.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_MODEL = "gemini-1.5-flash";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { questionText, questionCategory, audio, audioMimeType, durationSeconds } = body;

    if (!audio || !Array.isArray(audio) || audio.length === 0) {
      return new Response(JSON.stringify({ error: "No audio data provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
      return new Response(JSON.stringify({ error: "Transcription failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const transcribeData = await transcribeResponse.json();
    const transcript = transcribeData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    if (!transcript) {
      return new Response(JSON.stringify({ error: "Could not transcribe audio" }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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

    let analysisResult = {
      clarity_score: 5,
      structure_assessment: "Unable to determine structure.",
      corrections: [] as string[],
      rewritten_example: "",
      confidence_estimate: "Unknown",
    };

    if (analysisResponse.ok) {
      const analysisData = await analysisResponse.json();
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

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Clarity analysis error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
