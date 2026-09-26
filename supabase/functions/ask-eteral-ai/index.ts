import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

type OverviewContext = {
  overallScore?: number;
  currentStrength?: string;
  targetRole?: string;
};

function buildSystemPrompt(context?: OverviewContext) {
  let prompt =
    "You are Eteral's assistant. Eteral is a career-readiness platform for students and early-career " +
    'job seekers. Answer questions about career readiness, resumes, interview prep, and how to use ' +
    'Eteral, in a friendly, concise, encouraging tone. Keep answers short unless asked for detail. ' +
    'If asked something unrelated to careers or the platform, answer briefly and redirect gently.';

  if (context?.overallScore != null || context?.currentStrength || context?.targetRole) {
    prompt += '\n\nContext about this user, use only if relevant to their question:';
    if (context.overallScore != null) prompt += `\n- Overall career readiness score: ${context.overallScore}/100`;
    if (context.currentStrength) prompt += `\n- Current strongest area: ${context.currentStrength}`;
    if (context.targetRole) prompt += `\n- Target role: ${context.targetRole}`;
  }

  return prompt;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  try {
    if (!anthropicApiKey || !supabaseUrl || !serviceRoleKey) {
      console.error('Missing AI or Supabase function secrets');
      return jsonResponse({ error: 'Assistant is not configured' }, 500);
    }

    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) return jsonResponse({ error: 'Missing authorization' }, 401);

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) return jsonResponse({ error: 'Invalid session' }, 401);

    const body = await req.json().catch(() => ({}));
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const history = Array.isArray(body.history) ? body.history : [];
    const context: OverviewContext = body.context || {};

    if (!message) return jsonResponse({ error: 'Message is required' }, 400);

    const messages = [
      ...history
        .filter((m: unknown): m is { role: string; text: string } =>
          !!m && typeof m === 'object' && 'role' in m && 'text' in m,
        )
        .slice(-10)
        .map((m: { role: string; text: string }) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.text,
        })),
      { role: 'user', content: message },
    ];

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 500,
        system: buildSystemPrompt(context),
        messages,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Anthropic API error:', data);
      return jsonResponse({ error: 'Assistant failed to respond' }, 502);
    }

    const reply = data.content?.find((c: { type: string }) => c.type === 'text')?.text ?? '';
    return jsonResponse({ reply });
  } catch (err) {
    console.error('ask-eteral-ai error:', err);
    return jsonResponse({ error: err instanceof Error ? err.message : 'Unknown error' }, 500);
  }
});