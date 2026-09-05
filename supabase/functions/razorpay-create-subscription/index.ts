import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
const defaultPlanId = Deno.env.get('RAZORPAY_PLAN_ID');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function razorpayAuthHeader() {
  return `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  try {
    if (!razorpayKeyId || !razorpayKeySecret || !supabaseUrl || !serviceRoleKey) {
      console.error('Missing Razorpay or Supabase function secrets');
      return jsonResponse({ error: 'Payment service is not configured' }, 500);
    }

    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) return jsonResponse({ error: 'Missing authorization' }, 401);

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) return jsonResponse({ error: 'Invalid session' }, 401);

    const body = await req.json().catch(() => ({}));
    const planId = typeof body.planId === 'string' && body.planId.trim()
      ? body.planId.trim()
      : defaultPlanId;
    if (!planId) return jsonResponse({ error: 'No planId configured' }, 400);

    const res = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: razorpayAuthHeader(),
      },
      body: JSON.stringify({
        plan_id: planId,
        total_count: 120,
        quantity: 1,
        customer_notify: 1,
        notes: { supabase_user_id: user.id },
      }),
    });

    const subscription = await res.json();
    if (!res.ok) {
      console.error('Razorpay create subscription error:', subscription);
      return jsonResponse(
        { error: subscription.error?.description || 'Failed to create subscription' },
        502,
      );
    }

    return jsonResponse({ subscriptionId: subscription.id, keyId: razorpayKeyId });
  } catch (err) {
    console.error('razorpay-create-subscription error:', err);
    return jsonResponse({ error: err instanceof Error ? err.message : 'Unknown error' }, 500);
  }
});