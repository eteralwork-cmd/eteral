import { createClient } from "npm:@supabase/supabase-js@2.112.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
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
    const { sourceCode, languageId, stdin } = body as {
      sourceCode: string;
      languageId: number;
      stdin?: string;
    };

    if (!sourceCode || !languageId) {
      return jsonResponse({ error: "Missing sourceCode or languageId" }, 400);
    }

    // Check and increment Judge0 execution quota BEFORE making the API call
    const { data: quotaResult, error: quotaError } = await supabase.rpc("increment_judge0_usage", {
      p_user_id: user.id,
    });

    if (quotaError || !quotaResult) {
      return jsonResponse({ error: "Failed to check execution quota" }, 500);
    }

    if (quotaResult.allowed === false) {
      return jsonResponse({
        error: "Monthly code execution limit reached (1000 executions). Your quota resets in 30 days.",
        quota_exceeded: true,
        quota_used: quotaResult.used,
        quota_limit: quotaResult.limit,
        quota_period_start: quotaResult.quota_period_start,
      }, 429);
    }

    const judge0Host = Deno.env.get("JUDGE0_HOST");
    const judge0ApiKey = Deno.env.get("JUDGE0_API_KEY");

    if (!judge0Host) {
      return jsonResponse({
        error: "Code execution service is not configured. Please contact support.",
      }, 503);
    }

    const submitUrl = judge0ApiKey
      ? `${judge0Host}/submissions?base64_encoded=false&wait=true&fields=stdout,stderr,status,compile_output,time,exit_code,message`
      : `${judge0Host}/submissions?base64_encoded=false&wait=true&fields=stdout,stderr,status,compile_output,time,exit_code,message`;

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (judge0ApiKey) {
      headers["X-RapidAPI-Key"] = judge0ApiKey;
      headers["X-RapidAPI-Host"] = judge0Host.replace("https://", "");
    }

    const submitResponse = await fetch(submitUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        language_id: languageId,
        source_code: sourceCode,
        stdin: stdin ?? "",
      }),
    });

    if (!submitResponse.ok) {
      const errText = await submitResponse.text();
      console.error("Judge0 submit error:", errText);
      return jsonResponse({ error: "Failed to submit code for execution" }, 502);
    }

    const submission = await submitResponse.json();

    const result = {
      stdout: submission.stdout ?? "",
      stderr: submission.stderr ?? "",
      compileOutput: submission.compile_output ?? "",
      status: submission.status ?? null,
      time: submission.time ?? null,
      exitCode: submission.exit_code ?? null,
      message: submission.message ?? null,
      quota_remaining: quotaResult.remaining,
      quota_limit: quotaResult.limit,
      quota_used: quotaResult.used,
    };

    return jsonResponse(result);
  } catch (err) {
    console.error("judge0-run error:", err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : "Execution failed" },
      500,
    );
  }
});
