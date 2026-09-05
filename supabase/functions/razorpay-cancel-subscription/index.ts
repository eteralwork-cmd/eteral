import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
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

    const { data: membership, error: membershipError } = await supabaseAdmin
      .from('memberships')
      .select('payment_subscription_id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (membershipError) {
      console.error('Membership lookup error:', membershipError);
      return jsonResponse({ error: 'Unable to find membership' }, 500);
    }
    if (!membership?.payment_subscription_id) {
      return jsonResponse({ error: 'No active subscription found' }, 400);
    }

    const res = await fetch(
      `https://api.razorpay.com/v1/subscriptions/${encodeURIComponent(membership.payment_subscription_id)}/cancel`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: razorpayAuthHeader(),
        },
        body: JSON.stringify({ cancel_at_cycle_end: 1 }),
      },
    );

    const result = await res.json();
    if (!res.ok) {
      console.error('Razorpay cancel error:', result);
      return jsonResponse(
        { error: result.error?.description || 'Failed to cancel subscription' },
        502,
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from('memberships')
      .update({ cancel_at_period_end: true })
      .eq('user_id', user.id);
    if (updateError) console.error('Membership update error:', updateError);

    return jsonResponse({ success: true });
  } catch (err) {
    console.error('razorpay-cancel-subscription error:', err);
    return jsonResponse({ error: err instanceof Error ? err.message : 'Unknown error' }, 500);
  }
});