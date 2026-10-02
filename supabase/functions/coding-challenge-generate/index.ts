import { createClient } from "npm:@supabase/supabase-js@2.112.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_MODEL = "gemini-2.5-flash-lite";

const LEVEL_DESCRIPTIONS: Record<string, string> = {
  beginner: "simple problems suitable for someone just starting out — basic syntax, loops, conditionals",
  intermediate: "moderate problems requiring data structures like arrays, maps, strings, basic algorithms",
  pro: "hard problems requiring efficient algorithms, dynamic programming, graphs, or clever optimizations",
  master: "expert-level problems that combine multiple advanced concepts, edge cases, and competitive-programming difficulty",
};

const MODE_DESCRIPTIONS: Record<string, string> = {
  quick: "should be solvable in about 5 minutes — short and focused",
  standard: "should take about 15 minutes to solve — moderate length",
  deep: "should take about 30 minutes — more complex problem with multiple steps",
};

const LANGUAGE_MAP: Record<string, { judge0Id: number; comment: string }> = {
  javascript: { judge0Id: 63, comment: "// JavaScript (Node.js 18.15.0)" },
  python: { judge0Id: 71, comment: "# Python 3.10" },
  java: { judge0Id: 62, comment: "// Java (OpenJDK 17.0.6)" },
  cpp: { judge0Id: 76, comment: "// C++ (GCC 12.2.0)" },
  c: { judge0Id: 50, comment: "// C (GCC 12.2.0)" },
  typescript: { judge0Id: 94, comment: "// TypeScript 5.0.3" },
  ruby: { judge0Id: 72, comment: "# Ruby 3.2.2" },
  go: { judge0Id: 60, comment: "// Go 1.21.5" },
  rust: { judge0Id: 91, comment: "// Rust 1.68.2" },
  php: { judge0Id: 68, comment: "<?php" },
};

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
    const { language, level, mode } = body as { language: string; level: string; mode: string };

    if (!language || !level || !mode) {
      return jsonResponse({ error: "Missing language, level, or mode" }, 400);
    }

    const langKey = language.toLowerCase();
    const langInfo = LANGUAGE_MAP[langKey];
    if (!langInfo) {
      return jsonResponse({ error: `Unsupported language: ${language}` }, 400);
    }

    const levelDesc = LEVEL_DESCRIPTIONS[level.toLowerCase()] ?? LEVEL_DESCRIPTIONS.beginner;
    const modeDesc = MODE_DESCRIPTIONS[mode.toLowerCase()] ?? MODE_DESCRIPTIONS.standard;

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return jsonResponse({ error: "AI service not configured" }, 500);
    }

    // Pre-check Gemini quota (estimate ~1500 tokens for prompt + response)
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
        quota_used: preCheck.used,
        quota_limit: preCheck.limit,
        quota_period_start: preCheck.quota_period_start,
      }, 429);
    }

    const prompt = `You are a coding challenge generator for a career growth platform. Generate a single coding challenge with the following constraints:

Language: ${language}
Difficulty level: ${level} — ${levelDesc}
Time mode: ${mode} — ${modeDesc}

Return a JSON object with EXACTLY these fields:
{
  "title": "<short catchy problem title, 3-6 words>",
  "description": "<problem description in 2-4 sentences explaining what to solve, with an example>",
  "starterCode": "<starter code template with a function signature and a ${langInfo.comment} comment on the first line. Include a placeholder/TODO comment where the user writes their solution. Do NOT solve it.>",
  "solution": "<a correct solution in ${language}>",
  "testCases": [
    {"input": "<stdin input as a string, or empty if no stdin>", "expectedOutput": "<expected stdout output as a string>"},
    {"input": "<second test input>", "expectedOutput": "<second expected output>"},
    {"input": "<third test input>", "expectedOutput": "<third expected output>"}
  ]
}

Rules:
- Generate exactly 3 test cases.
- Test cases should cover the basic case, an edge case, and a larger/random case.
- The solution code should read from stdin (if the problem requires input) and print to stdout.
- If the problem is algorithmic and needs input, the solution reads from stdin and prints to stdout.
- If the problem is a function-only problem (no stdin), make testCases have empty input strings and the expectedOutput should be what the program prints when run with the starter/solution code.
- Keep the description clear and concise.
- Return ONLY the JSON, no markdown, no code fences, no extra text.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2000 },
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini challenge generation failed:", errText);
      return jsonResponse({ error: "Failed to generate challenge" }, 502);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Extract actual token usage from Gemini response
    const actualTokens = data?.usageMetadata?.totalTokenCount ?? 0;

    // Increment Gemini usage with actual token count
    if (actualTokens > 0) {
      await supabase.rpc("increment_gemini_usage", {
        p_user_id: user.id,
        p_token_count: actualTokens,
      });
    }

    let challenge;
    try {
      const cleaned = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      challenge = JSON.parse(cleaned);
    } catch {
      return jsonResponse({ error: "Failed to parse AI-generated challenge" }, 502);
    }

    if (!challenge.title || !challenge.description || !challenge.testCases) {
      return jsonResponse({ error: "Challenge missing required fields" }, 502);
    }

    const result = {
      title: String(challenge.title),
      description: String(challenge.description),
      starterCode: String(challenge.starterCode ?? ""),
      solution: String(challenge.solution ?? ""),
      testCases: Array.isArray(challenge.testCases) ? challenge.testCases.slice(0, 5) : [],
      language: langKey,
      judge0LanguageId: langInfo.judge0Id,
      level: level.toLowerCase(),
      mode: mode.toLowerCase(),
    };

    return jsonResponse(result);
  } catch (err) {
    console.error("coding-challenge-generate error:", err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : "Generation failed" },
      500,
    );
  }
});
