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
    const { skills, track } = body as { skills: { label: string; level: string }[]; track: string };

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return jsonResponse({ error: "No skills provided" }, 400);
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return jsonResponse({ error: "AI service not configured" }, 500);
    }

    // Pre-check Gemini quota
    const { data: preCheck, error: preCheckError } = await supabase.rpc("check_gemini_quota", {
      p_user_id: user.id,
      p_estimated_tokens: 1500,
    });

    if (preCheckError || !preCheck) {
      return jsonResponse({ error: "Failed to check usage quota" }, 500);
    }

    if (preCheck.allowed === false) {
      return jsonResponse({
        error: "Monthly AI token limit reached. Your quota resets in 30 days.",
        quota_exceeded: true,
      }, 429);
    }

    const skillList = skills.map((s) => `${s.label} (${s.level})`).join(", ");

    const prompt = `You are a career project advisor for a career growth platform. A user on the "${track}" track has these verified skills:
${skillList}

Generate a single project idea that would help them build tangible proof of these skills. The project should be realistic for someone at their skill level, portfolio-worthy, and something that can be completed in 1-4 weeks.

Return a JSON object with EXACTLY these fields:
{
  "title": "<short catchy project name, 3-8 words>",
  "description": "<2-3 sentence description of what to build>",
  "problem_solved": "<1-2 sentences on what real-world problem or gap this addresses>",
  "skills_used": ["<skill name from their list>", "<another skill>"],
  "approach": "<3-5 bullet points on how to approach building this, as a single string with \\n between points>",
  "difficulty": "<beginner, intermediate, or advanced>",
  "estimated_time": "<e.g. '1-2 weeks'>"
}

Rules:
- Use only skills from the user's verified skill list in skills_used.
- Make the project specific, not generic (e.g. "Recipe Finder with Search Filters" not "A web app").
- Return ONLY the JSON, no markdown, no code fences, no extra text.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1500 },
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini project idea generation failed:", errText);
      return jsonResponse({ error: "Failed to generate project idea" }, 502);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const actualTokens = data?.usageMetadata?.totalTokenCount ?? 0;

    if (actualTokens > 0) {
      await supabase.rpc("increment_gemini_usage", {
        p_user_id: user.id,
        p_token_count: actualTokens,
      });
    }

    let idea;
    try {
      const cleaned = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      idea = JSON.parse(cleaned);
    } catch {
      return jsonResponse({ error: "Failed to parse AI-generated project idea" }, 502);
    }

    if (!idea.title || !idea.description) {
      return jsonResponse({ error: "Project idea missing required fields" }, 502);
    }

    const result = {
      title: String(idea.title),
      description: String(idea.description),
      problem_solved: String(idea.problem_solved ?? ""),
      skills_used: Array.isArray(idea.skills_used) ? idea.skills_used.map(String) : [],
      approach: String(idea.approach ?? ""),
      difficulty: String(idea.difficulty ?? "intermediate"),
      estimated_time: String(idea.estimated_time ?? "1-2 weeks"),
    };

    return jsonResponse(result);
  } catch (err) {
    console.error("project-idea-generate error:", err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : "Generation failed" },
      500,
    );
  }
});
