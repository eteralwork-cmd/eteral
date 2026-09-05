/*
  # Create memberships table (Razorpay)

  1. New Tables
    - `memberships`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users, unique — one row per user)
      - `plan` (text — 'free' | 'standard' | 'premium')
      - `status` (text — Razorpay subscription status, or 'free' if never subscribed)
      - `payment_customer_id` (text, nullable — Razorpay customer id, if available)
      - `payment_subscription_id` (text, nullable — Razorpay subscription id, e.g. sub_xxx)
      - `current_period_start` (timestamptz, nullable)
      - `current_period_end` (timestamptz, nullable)
      - `cancel_at_period_end` (boolean, default false)
      - `created_at`, `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `memberships`
    - Users can SELECT their own row only
    - No client-side INSERT/UPDATE/DELETE — those only happen via the
      razorpay-webhook / razorpay-cancel-subscription Edge Functions using
      the service role key, which bypasses RLS entirely.
*/

CREATE TABLE IF NOT EXISTS memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'free',
  payment_customer_id text,
  payment_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own membership"
  ON memberships
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS memberships_set_updated_at ON memberships;
CREATE TRIGGER memberships_set_updated_at
  BEFORE UPDATE ON memberships
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();