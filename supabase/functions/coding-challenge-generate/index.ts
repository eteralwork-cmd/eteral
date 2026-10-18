// supabase/functions/coding-challenge-generate/index.ts
export {};

declare const Deno: {
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const JUDGE0_IDS: Record<string, number> = {
  python: 71,
  sql: 82,
  javascript: 63,
  typescript: 94,
};

const LANGUAGE_RULES: Record<string, string> = {
  python: `- The learner's program reads its input with input() and prints its result with print().
- Only the Python standard library, numpy and pandas may be used. No files, no network, no randomness.
- "input" in each test case is the exact text given to stdin (lines separated by \\n). "expectedOutput" is the exact stdout.
- starterCode should contain a short comment and a minimal skeleton that reads the input.`,
  javascript: `- The program runs on Node.js. It reads stdin with: const input = require('fs').readFileSync(0, 'utf8');
- It prints results with console.log.
- "input" in each test case is the exact stdin text. "expectedOutput" is the exact stdout.
- starterCode should include the stdin-reading line and an empty solution area.`,
  typescript: `- The program runs as TypeScript on Node.js. Because no Node typings are available, starterCode MUST begin with: declare const require: any;
- It reads stdin with: const input: string = require('fs').readFileSync(0, 'utf8');
- It prints results with console.log.
- "input" in each test case is the exact stdin text. "expectedOutput" is the exact stdout.`,
  sql: `- The database is SQLite. Put ALL CREATE TABLE and INSERT statements in "setupSql" (it is run before the learner's query).
- The learner writes ONE SELECT query that ends with a semicolon. starterCode should be a short comment plus "SELECT " as a starting point.
- The query MUST have an ORDER BY so the row order is deterministic.
- "testCases" must contain exactly ONE item, with "input": "" and "expectedOutput" in SQLite's default output format: one row per line, columns separated by | and NO header row.`,
};

const LEVEL_HINTS: Record<string, string> = {
  beginner: 'Beginner: one simple concept, such as basic loops, conditionals, strings or simple SELECT/WHERE.',
  intermediate: 'Intermediate: combine two or three concepts, such as data structures, sorting, or JOIN with GROUP BY.',
  pro: 'Pro: an interview-style problem that needs a well-chosen algorithm or data structure, or multi-table SQL with subqueries.',
  master: 'Master: a hard interview problem with tricky edge cases, or advanced SQL using window functions or CTEs.',
};

const MODE_HINTS: Record<string, string> = {
  quick: 'The problem must be solvable in about 5 minutes.',
  standard: 'The problem must be solvable in about 15 minutes.',
  deep: 'The problem must be solvable in about 30 minutes and may have several parts.',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { language, level, mode } = await req.json();

    if (!JUDGE0_IDS[language]) return jsonResponse({ error: `Unsupported language: ${language}` }, 400);
    if (!LEVEL_HINTS[level]) return jsonResponse({ error: `Unsupported level: ${level}` }, 400);
    if (!MODE_HINTS[mode]) return jsonResponse({ error: `Unsupported mode: ${mode}` }, 400);

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) return jsonResponse({ error: 'Server is missing GEMINI_API_KEY' }, 500);
    const model = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.5-flash';

    const prompt = `You create coding practice challenges for a career-readiness platform.

Create ONE ${language} challenge.
${LEVEL_HINTS[level]}
${MODE_HINTS[mode]}

Rules:
${LANGUAGE_RULES[language]}
- Provide 3 test cases (SQL: exactly 1). Outputs must be deterministic, and expectedOutput must be exactly what a correct solution prints, with no extra text.
- Make the problem relevant to real work, such as data tasks, business logic or web development.
- "solution" must be a complete correct solution that produces every expectedOutput.

Respond with ONLY a JSON object in this exact shape:
{
  "title": string,
  "description": string,
  "starterCode": string,
  "solution": string,
  "testCases": [{ "input": string, "expectedOutput": string }],
  "setupSql": string
}
Set "setupSql" to an empty string unless the language is sql.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.9 },
        }),
      },
    );

    if (!res.ok) {
      const detail = await res.text();
      console.error('Gemini error', res.status, detail);
      return jsonResponse({ error: `AI service error (${res.status}): ${detail.slice(0, 300)}` }, 502);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return jsonResponse({ error: 'AI returned an empty response. Please try again.' }, 502);

    let parsed: any;
    try {
      parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch {
      return jsonResponse({ error: 'AI returned invalid JSON. Please try again.' }, 502);
    }

    if (!parsed.title || !parsed.description || !Array.isArray(parsed.testCases) || parsed.testCases.length === 0) {
      return jsonResponse({ error: 'AI returned an incomplete challenge. Please try again.' }, 502);
    }

    const challenge = {
      title: String(parsed.title),
      description: String(parsed.description),
      starterCode: String(parsed.starterCode ?? ''),
      solution: String(parsed.solution ?? ''),
      testCases: parsed.testCases.map((t: any) => ({
        input: String(t.input ?? ''),
        expectedOutput: String(t.expectedOutput ?? ''),
      })),
      ...(language === 'sql' && parsed.setupSql ? { setupSql: String(parsed.setupSql) } : {}),
      language,
      judge0LanguageId: JUDGE0_IDS[language],
      level,
      mode,
    };

    return jsonResponse(challenge);
  } catch (e) {
    console.error(e);
    return jsonResponse({ error: String(e) }, 500);
  }
});