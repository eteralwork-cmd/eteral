/*
# Create AI usage quotas table and SECURITY DEFINER quota functions

## What this migration does

### 1. New Table: ai_usage_quotas
Tracks per-user monthly usage of AI services (Gemini tokens and Judge0 code executions).
- id (uuid, primary key)
- user_id (uuid, owner, defaults to auth.uid(), references auth.users ON DELETE CASCADE)
- judge0_executions (integer, default 0) — count of Judge0 code submissions this month
- gemini_tokens_used (integer, default 0) — combined input+output tokens used this month
- quota_period_start (date, defaults to CURRENT_DATE) — start of the current monthly quota period
- last_judge0_at (timestamptz, nullable) — timestamp of last Judge0 execution
- last_gemini_at (timestamptz, nullable) — timestamp of last Gemini API call
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())

A unique constraint on user_id ensures one quota row per user.

### 2. Constants
- JUDGE0_MAX_EXECUTIONS = 1000 (max code executions per user per month)
- GEMINI_MAX_TOKENS = 5000000 (5 million combined input+output tokens per user per month)
- QUOTA_PERIOD_DAYS = 30 (quota resets every 30 days from the period start)

### 3. Security
- RLS enabled on ai_usage_quotas.
- Users can SELECT their own quota row (auth.uid() = user_id).
- INSERT/UPDATE/DELETE are NOT exposed via RLS — only the SECURITY DEFINER functions below
  can mutate quota data, and those functions run with the service role (bypassing RLS).

### 4. SECURITY DEFINER Functions

#### check_and_reset_quota(p_user_id uuid)
- Called at the start of every AI edge function request.
- If the quota period is older than 30 days, resets the counters to 0 and sets
  quota_period_start to today. Returns the current (possibly reset) quota row as JSON.
- If no quota row exists yet, creates one.
- This function is SECURITY DEFINER so it can insert/update the quota table
  regardless of RLS. It is granted to authenticated users.

#### increment_judge0_usage(p_user_id uuid)
- Calls check_and_reset_quota first (so we're always working with a fresh period).
- Checks if judge0_executions >= JUDGE0_MAX_EXECUTIONS. If so, returns { allowed: false, remaining: 0 }.
- Otherwise increments judge0_executions by 1, sets last_judge0_at = now().
- Returns { allowed: true, remaining: <number>, limit: 1000 }.

#### increment_gemini_usage(p_user_id uuid, p_token_count integer)
- Calls check_and_reset_quota first.
- Checks if gemini_tokens_used + p_token_count > GEMINI_MAX_TOKENS. If so, returns { allowed: false, remaining: 0 }.
- Otherwise increments gemini_tokens_used by p_token_count, sets last_gemini_at = now().
- Returns { allowed: true, remaining: <number>, limit: 5000000, used: <number> }.

### 5. Indexes
- Unique index on user_id for fast lookups.
*/

-- ── Constants ─────────────────────────────────────────────────────────────────
-- Stored as function-local constants in the PL/pgSQL functions below.

-- ── Table ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ai_usage_quotas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  judge0_executions integer NOT NULL DEFAULT 0,
  gemini_tokens_used integer NOT NULL DEFAULT 0,
  quota_period_start date NOT NULL DEFAULT CURRENT_DATE,
  last_judge0_at timestamptz,
  last_gemini_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE ai_usage_quotas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_ai_usage_quotas" ON ai_usage_quotas;
CREATE POLICY "select_own_ai_usage_quotas"
  ON ai_usage_quotas FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies — only SECURITY DEFINER functions mutate this table.

CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_usage_quotas_user ON ai_usage_quotas (user_id);

-- ── SECURITY DEFINER Functions ────────────────────────────────────────────────

-- check_and_reset_quota: Ensures the quota row exists and resets if the period has elapsed.
CREATE OR REPLACE FUNCTION check_and_reset_quota(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row ai_usage_quotas%ROWTYPE;
  v_period_age integer;
BEGIN
  -- Try to get the existing row
  SELECT * INTO v_row FROM ai_usage_quotas WHERE user_id = p_user_id;

  -- If no row exists, create one
  IF NOT FOUND THEN
    INSERT INTO ai_usage_quotas (user_id, judge0_executions, gemini_tokens_used, quota_period_start)
    VALUES (p_user_id, 0, 0, CURRENT_DATE)
    ON CONFLICT (user_id) DO NOTHING
    RETURNING * INTO v_row;

    -- If INSERT returned nothing (race condition), fetch the existing row
    IF v_row.id IS NULL THEN
      SELECT * INTO v_row FROM ai_usage_quotas WHERE user_id = p_user_id;
    END IF;
  ELSE
    -- Check if the quota period (30 days) has elapsed
    v_period_age := CURRENT_DATE - v_row.quota_period_start;
    IF v_period_age >= 30 THEN
      UPDATE ai_usage_quotas
      SET judge0_executions = 0,
          gemini_tokens_used = 0,
          quota_period_start = CURRENT_DATE,
          updated_at = now()
      WHERE user_id = p_user_id
      RETURNING * INTO v_row;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'user_id', v_row.user_id,
    'judge0_executions', v_row.judge0_executions,
    'gemini_tokens_used', v_row.gemini_tokens_used,
    'quota_period_start', v_row.quota_period_start,
    'last_judge0_at', v_row.last_judge0_at,
    'last_gemini_at', v_row.last_gemini_at
  );
END;
$$;

-- increment_judge0_usage: Atomically check + increment Judge0 execution count.
CREATE OR REPLACE FUNCTION increment_judge0_usage(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row ai_usage_quotas%ROWTYPE;
  v_current integer;
  v_max integer := 1000;
BEGIN
  -- Ensure row exists and period is fresh
  PERFORM check_and_reset_quota(p_user_id);

  -- Lock the row for the duration of this transaction
  SELECT * INTO v_row FROM ai_usage_quotas WHERE user_id = p_user_id FOR UPDATE;
  v_current := v_row.judge0_executions;

  IF v_current >= v_max THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'limit', v_max,
      'used', v_current,
      'quota_period_start', v_row.quota_period_start
    );
  END IF;

  UPDATE ai_usage_quotas
  SET judge0_executions = v_current + 1,
      last_judge0_at = now(),
      updated_at = now()
  WHERE user_id = p_user_id
  RETURNING * INTO v_row;

  RETURN jsonb_build_object(
    'allowed', true,
    'remaining', v_max - (v_current + 1),
    'limit', v_max,
    'used', v_current + 1,
    'quota_period_start', v_row.quota_period_start
  );
END;
$$;

-- increment_gemini_usage: Atomically check + increment Gemini token usage.
CREATE OR REPLACE FUNCTION increment_gemini_usage(p_user_id uuid, p_token_count integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row ai_usage_quotas%ROWTYPE;
  v_current integer;
  v_max integer := 5000000;
  v_new_total integer;
BEGIN
  -- Ensure row exists and period is fresh
  PERFORM check_and_reset_quota(p_user_id);

  -- Lock the row
  SELECT * INTO v_row FROM ai_usage_quotas WHERE user_id = p_user_id FOR UPDATE;
  v_current := v_row.gemini_tokens_used;
  v_new_total := v_current + p_token_count;

  IF v_new_total > v_max THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'limit', v_max,
      'used', v_current,
      'quota_period_start', v_row.quota_period_start
    );
  END IF;

  UPDATE ai_usage_quotas
  SET gemini_tokens_used = v_new_total,
      last_gemini_at = now(),
      updated_at = now()
  WHERE user_id = p_user_id
  RETURNING * INTO v_row;

  RETURN jsonb_build_object(
    'allowed', true,
    'remaining', v_max - v_new_total,
    'limit', v_max,
    'used', v_new_total,
    'quota_period_start', v_row.quota_period_start
  );
END;
$$;

-- check_gemini_quota: Pre-check quota BEFORE calling Gemini (to avoid wasting tokens).
-- Does NOT increment — just checks if there's room for the estimated token count.
CREATE OR REPLACE FUNCTION check_gemini_quota(p_user_id uuid, p_estimated_tokens integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row ai_usage_quotas%ROWTYPE;
  v_current integer;
  v_max integer := 5000000;
BEGIN
  PERFORM check_and_reset_quota(p_user_id);

  SELECT * INTO v_row FROM ai_usage_quotas WHERE user_id = p_user_id FOR UPDATE;
  v_current := v_row.gemini_tokens_used;

  IF v_current + p_estimated_tokens > v_max THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'remaining', GREATEST(0, v_max - v_current),
      'limit', v_max,
      'used', v_current,
      'quota_period_start', v_row.quota_period_start
    );
  END IF;

  RETURN jsonb_build_object(
    'allowed', true,
    'remaining', v_max - v_current,
    'limit', v_max,
    'used', v_current,
    'quota_period_start', v_row.quota_period_start
  );
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION check_and_reset_quota(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_judge0_usage(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_gemini_usage(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION check_gemini_quota(uuid, integer) TO authenticated;
