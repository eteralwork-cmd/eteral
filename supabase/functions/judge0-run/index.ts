// supabase/functions/judge0-run/index.ts
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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { sourceCode, languageId, stdin } = await req.json();

    if (typeof sourceCode !== 'string' || !sourceCode.trim()) return jsonResponse({ error: 'No code provided' }, 400);
    if (typeof languageId !== 'number') return jsonResponse({ error: 'Invalid languageId' }, 400);
    if (sourceCode.length > 50000) return jsonResponse({ error: 'Code is too long' }, 400);

    const apiKey = Deno.env.get('JUDGE0_API_KEY');
    if (!apiKey) return jsonResponse({ error: 'Server is missing JUDGE0_API_KEY' }, 500);

    // Defaults assume the RapidAPI-hosted Judge0 CE. Override with secrets if you use another host.
    const host = Deno.env.get('JUDGE0_HOST') ?? 'judge0-ce.p.rapidapi.com';
    const baseUrl = Deno.env.get('JUDGE0_URL') ?? `https://${host}`;

    const res = await fetch(`${baseUrl}/submissions?base64_encoded=false&wait=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': host,
      },
      body: JSON.stringify({
        source_code: sourceCode,
        language_id: languageId,
        stdin: stdin ?? '',
        cpu_time_limit: 5,
        memory_limit: 128000,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error('Judge0 error', res.status, detail);
      return jsonResponse({ error: `Code runner error (${res.status}): ${detail.slice(0, 300)}` }, 502);
    }

    const r = await res.json();

    return jsonResponse({
      stdout: r.stdout ?? '',
      stderr: r.stderr ?? '',
      compileOutput: r.compile_output ?? '',
      status: r.status?.description ?? '',
      time: r.time ?? null,
    });
  } catch (e) {
    console.error(e);
    return jsonResponse({ error: String(e) }, 500);
  }
});