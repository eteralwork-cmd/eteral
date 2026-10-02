// supabase/functions/razorpay-webhook/index.ts
//
// Receives Razorpay webhook events and syncs the `memberships` table.
// Must be deployed with --no-verify-jwt, since Razorpay calls this
// unauthenticated (its signature is verified via RAZORPAY_WEBHOOK_SECRET
// instead of a Supabase JWT):
//
//   supabase functions deploy razorpay-webhook --no-verify-jwt
//
// After deploying, register this function's URL in Razorpay Dashboard >
// Settings > Webhooks, subscribed to at least:
//   subscription.activated
//   subscription.charged
//   subscription.cancelled
//   subscription.completed
//   subscription.halted
//
// Required secrets:
//   RAZORPAY_WEBHOOK_SECRET   — the secret you set when creating the
//                               webhook in the Razorpay dashboard (this is
//                               NOT your API key/secret)
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — auto-provided

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

async function verifySignature(rawBody: string, signature: string): Promise<boolean> {
  if (!webhookSecret) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(webhookSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
  const expected = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // Constant-time-ish comparison
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

function toIso(unixSeconds: number | null | undefined): string | null {
  return unixSeconds ? new Date(unixSeconds * 1000).toISOString() : null;
}

type RazorpaySubscription = {
  id: string;
  customer_id?: string | null;
  current_start?: number | null;
  current_end?: number | null;
  notes?: { supabase_user_id?: string };
};

type RazorpayWebhookEvent = {
  event?: string;
  payload?: { subscription?: { entity?: RazorpaySubscription } };
};

async function upsertMembership(params: {
  userId: string;
  plan: string;
  status: string;
  subscriptionId: string;
  customerId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}) {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase function secrets are not configured');
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
  const { error } = await supabaseAdmin.from('memberships').upsert(
    {
      user_id: params.userId,
      plan: params.plan,
      status: params.status,
      payment_subscription_id: params.subscriptionId,
      payment_customer_id: params.customerId,
      current_period_start: params.currentPeriodStart,
      current_period_end: params.currentPeriodEnd,
      cancel_at_period_end: params.cancelAtPeriodEnd,
    },
    { onConflict: 'user_id' }
  );
  if (error) throw error;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  if (!webhookSecret || !supabaseUrl || !serviceRoleKey) {
    console.error('Missing Razorpay webhook or Supabase function secrets');
    return new Response('Webhook is not configured', { status: 500 });
  }

  const signature = req.headers.get('x-razorpay-signature');
  const rawBody = await req.text();

  if (!signature || !(await verifySignature(rawBody, signature))) {
    console.error('Invalid Razorpay webhook signature');
    return new Response('Invalid signature', { status: 400 });
  }

  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(rawBody) as RazorpayWebhookEvent;
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  try {
    const eventType = event.event;
    const entity = event.payload?.subscription?.entity;

    if (!entity || !eventType || !entity.id) {
      // Not a subscription event we care about (e.g. a payment event) — ack and skip.
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    const userId = entity.notes?.supabase_user_id;
    if (!userId) {
      console.error('Razorpay webhook: no supabase_user_id in notes', entity.id);
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    const shared = {
      userId,
      subscriptionId: entity.id,
      customerId: entity.customer_id ?? null,
      currentPeriodStart: toIso(entity.current_start),
      currentPeriodEnd: toIso(entity.current_end),
    };

    switch (eventType) {
      case 'subscription.activated':
      case 'subscription.charged':
        await upsertMembership({
          ...shared,
          plan: 'standard',
          status: 'active',
          cancelAtPeriodEnd: false,
        });
        break;

      case 'subscription.cancelled':
        await upsertMembership({
          ...shared,
          plan: 'standard',
          status: 'canceled',
          cancelAtPeriodEnd: true,
        });
        break;

      case 'subscription.completed':
        await upsertMembership({
          ...shared,
          plan: 'free',
          status: 'canceled',
          cancelAtPeriodEnd: false,
        });
        break;

      case 'subscription.halted':
        await upsertMembership({
          ...shared,
          plan: 'standard',
          status: 'past_due',
          cancelAtPeriodEnd: false,
        });
        break;

      default:
        // Unhandled event types are fine to ignore.
        break;
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error('razorpay-webhook processing error:', err);
    return new Response('Webhook handler error', { status: 500 });
  }
});