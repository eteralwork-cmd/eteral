/*
# Create quiz_results table for Eteral

1. Purpose
- Stores each user's quiz outcome so recommendations persist across sessions
- Enables email-gated freebie / quiz result access

2. New Tables
- `quiz_results`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to authenticated user, references auth.users, cascading delete)
  - `segment` (text, not null) — e.g. 'student' | 'hustler' | 'habit'
  - `recommendation` (text, not null) — recommended product/freebie title
  - `created_at` (timestamptz, default now())

3. Security
- Enable RLS on `quiz_results`.
- Owner-scoped CRUD: each authenticated user can only access their own rows.
- No anon access — quiz results require a signed-in user (matches the email-gate UX).
*/

CREATE TABLE IF NOT EXISTS quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  segment text NOT NULL,
  recommendation text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_quiz_results" ON quiz_results;
CREATE POLICY "select_own_quiz_results" ON quiz_results
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_quiz_results" ON quiz_results;
CREATE POLICY "insert_own_quiz_results" ON quiz_results
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_quiz_results" ON quiz_results;
CREATE POLICY "update_own_quiz_results" ON quiz_results
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_quiz_results" ON quiz_results;
CREATE POLICY "delete_own_quiz_results" ON quiz_results
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
