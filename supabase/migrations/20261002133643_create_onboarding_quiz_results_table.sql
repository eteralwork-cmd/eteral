/*
# Create onboarding_quiz_results table

1. Purpose
- Stores the results of the new 7-question onboarding quiz that replaces the old 24-question career readiness assessment
- Captures the user's career direction, skill level, starting point, time commitment, and timeline
- Feeds into the dashboard onboarding flow (target_track, recommended starting point, weekly pace)

2. New Tables
- `onboarding_quiz_results`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to authenticated user, references auth.users, cascading delete)
  - `target_track` (text, not null) — career direction selected (frontend, backend, fullstack, data, design, product, undecided)
  - `skill_level` (integer, not null) — 0=just starting, 1=some basics, 2=intermediate, 3=advanced
  - `project_evidence` (integer, not null) — 0=none, 1=started, 2=one-two basic, 3=multiple proud of
  - `starting_point` (text, not null) — where they want to start (learn, practice, projects, interviews, resume)
  - `weekly_hours` (text, not null) — time commitment bucket (few_hours, 5_10_hours, 10_20_hours, 20_plus_hours)
  - `timeline` (text, not null) — urgency (no_rush, 3_6_months, 1_3_months, already_applying)
  - `overall_score` (integer, not null) — 0-100 skill/knowledge level score
  - `readiness_stage` (text, not null) — stage label (Getting Started, Building Foundation, Developing, Job-Ready)
  - `recommended_start` (text, not null) — recommended Eteral feature to use first
  - `weekly_pace` (text, not null) — pace label (Casual, Steady, Intensive, Full-speed)
  - `answers` (jsonb, not null) — full answer map for reference
  - `created_at` (timestamptz, default now())

3. Security
- Enable RLS on `onboarding_quiz_results`.
- Owner-scoped CRUD: each authenticated user can only access their own rows.
- No anon access — results require a signed-in user (matches the sign-up gate UX).
*/

CREATE TABLE IF NOT EXISTS onboarding_quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  target_track text NOT NULL,
  skill_level integer NOT NULL,
  project_evidence integer NOT NULL,
  starting_point text NOT NULL,
  weekly_hours text NOT NULL,
  timeline text NOT NULL,
  overall_score integer NOT NULL,
  readiness_stage text NOT NULL,
  recommended_start text NOT NULL,
  weekly_pace text NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE onboarding_quiz_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_onboarding_results" ON onboarding_quiz_results;
CREATE POLICY "select_own_onboarding_results" ON onboarding_quiz_results
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_onboarding_results" ON onboarding_quiz_results;
CREATE POLICY "insert_own_onboarding_results" ON onboarding_quiz_results
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_onboarding_results" ON onboarding_quiz_results;
CREATE POLICY "update_own_onboarding_results" ON onboarding_quiz_results
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_onboarding_results" ON onboarding_quiz_results;
CREATE POLICY "delete_own_onboarding_results" ON onboarding_quiz_results
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
