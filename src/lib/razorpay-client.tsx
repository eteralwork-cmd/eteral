import { supabase } from './supabase';
import type { NavigateFunction } from 'react-router-dom';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

type RazorpayOptions = {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  prefill: { email: string };
  theme: { color: string };
  handler: () => void;
  modal: { ondismiss: () => void };
};

type RazorpayInstance = {
  open: () => void;
};

async function getAuthHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('You must be signed in to manage your subscription');

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  };
}

let scriptLoadPromise: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout script'));
    document.body.appendChild(script);
  });

  return scriptLoadPromise;
}

// Creates a Razorpay subscription, opens the embedded Checkout widget,
// and navigates to /payment/success or /payment/cancelled depending on
// what the user does. The membership row itself is only ever written by
// the razorpay-webhook Edge Function once Razorpay confirms payment —
// this is just the UI trigger for that flow.
export async function startCheckout(navigate: NavigateFunction, planId?: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${SUPABASE_URL}/functions/v1/razorpay-create-subscription`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ planId }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Checkout failed (${res.status})`);
  }

  const { subscriptionId, keyId } = await res.json();
  if (!subscriptionId || !keyId) throw new Error('No subscription returned');

  await loadRazorpayScript();

  const { data: userData } = await supabase.auth.getUser();

  const razorpay = new window.Razorpay({
    key: keyId,
    subscription_id: subscriptionId,
    name: 'Eteral',
    description: 'Eteral Standard Membership',
    prefill: { email: userData.user?.email ?? '' },
    theme: { color: '#111111' },
    handler: () => {
      // Payment succeeded client-side; the webhook confirms it server-side
      // and PaymentSuccess polls membership status until it lands.
      navigate('/payment/success');
    },
    modal: {
      ondismiss: () => {
        navigate('/payment/cancelled');
      },
    },
  });

  razorpay.open();
}

// Cancels the current user's subscription at the end of the billing cycle.
export async function cancelSubscription(): Promise<{ success: boolean }> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${SUPABASE_URL}/functions/v1/razorpay-cancel-subscription`, {
    method: 'POST',
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Cancellation failed (${res.status})`);
  }

  return res.json();
}