/*
# Create legacy dashboard tables (connections, tracker, interview, daily questions, readiness scores, quiz attempts)

## New tables
1. `connections` — company/network connections tracker
2. `tracker_entries` — project/skill/experience timeline entries
3. `interview_questions` — curated interview practice questions (shared, read-only)
4. `interview_answers` — user's saved answers to interview questions
5. `daily_questions` — question of the day catalog (shared, read-only)
6. `readiness_scores` — career readiness quiz scores per category
7. `quiz_attempts` — full quiz attempt records

## Security
- RLS enabled on every table
- Owner-scoped tables use user_id = auth.uid() with 4 CRUD policies
- `interview_questions` and `daily_questions` are shared read-only reference data (anon+authenticated SELECT)
*/

-- ============================================================
-- 1. connections
-- ============================================================
CREATE TABLE IF NOT EXISTS connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  contact_name text,
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_connections" ON connections;
CREATE POLICY "select_own_connections" ON connections FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_connections" ON connections;
CREATE POLICY "insert_own_connections" ON connections FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_connections" ON connections;
CREATE POLICY "update_own_connections" ON connections FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_connections" ON connections;
CREATE POLICY "delete_own_connections" ON connections FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_connections_user_id ON connections(user_id);

-- ============================================================
-- 2. tracker_entries
-- ============================================================
CREATE TABLE IF NOT EXISTS tracker_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('project','skill','experience')),
  title text NOT NULL,
  description text,
  month text NOT NULL,
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tracker_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_tracker_entries" ON tracker_entries;
CREATE POLICY "select_own_tracker_entries" ON tracker_entries FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_tracker_entries" ON tracker_entries;
CREATE POLICY "insert_own_tracker_entries" ON tracker_entries FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_tracker_entries" ON tracker_entries;
CREATE POLICY "update_own_tracker_entries" ON tracker_entries FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_tracker_entries" ON tracker_entries;
CREATE POLICY "delete_own_tracker_entries" ON tracker_entries FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tracker_entries_user_id ON tracker_entries(user_id);

-- ============================================================
-- 3. interview_questions (shared reference data — read-only)
-- ============================================================
CREATE TABLE IF NOT EXISTS interview_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt text NOT NULL,
  category text NOT NULL,
  display_order integer NOT NULL DEFAULT 0
);

ALTER TABLE interview_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_interview_questions" ON interview_questions;
CREATE POLICY "read_interview_questions" ON interview_questions FOR SELECT
  TO anon, authenticated USING (true);

-- ============================================================
-- 4. interview_answers
-- ============================================================
CREATE TABLE IF NOT EXISTS interview_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES interview_questions(id) ON DELETE CASCADE,
  answer_text text NOT NULL DEFAULT '',
  ai_feedback jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, question_id)
);

ALTER TABLE interview_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_interview_answers" ON interview_answers;
CREATE POLICY "select_own_interview_answers" ON interview_answers FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_interview_answers" ON interview_answers;
CREATE POLICY "insert_own_interview_answers" ON interview_answers FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_interview_answers" ON interview_answers;
CREATE POLICY "update_own_interview_answers" ON interview_answers FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_interview_answers" ON interview_answers;
CREATE POLICY "delete_own_interview_answers" ON interview_answers FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_interview_answers_user_id ON interview_answers(user_id);

-- ============================================================
-- 5. daily_questions (shared reference data — read-only)
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text text NOT NULL,
  category text NOT NULL,
  display_order integer NOT NULL DEFAULT 0
);

ALTER TABLE daily_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_daily_questions" ON daily_questions;
CREATE POLICY "read_daily_questions" ON daily_questions FOR SELECT
  TO anon, authenticated USING (true);

-- ============================================================
-- 6. readiness_scores
-- ============================================================
CREATE TABLE IF NOT EXISTS readiness_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  score integer NOT NULL DEFAULT 0,
  last_updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, category)
);

ALTER TABLE readiness_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_readiness_scores" ON readiness_scores;
CREATE POLICY "select_own_readiness_scores" ON readiness_scores FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_readiness_scores" ON readiness_scores;
CREATE POLICY "insert_own_readiness_scores" ON readiness_scores FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_readiness_scores" ON readiness_scores;
CREATE POLICY "update_own_readiness_scores" ON readiness_scores FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_readiness_scores" ON readiness_scores;
CREATE POLICY "delete_own_readiness_scores" ON readiness_scores FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_readiness_scores_user_id ON readiness_scores(user_id);

-- ============================================================
-- 7. quiz_attempts
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '{}',
  resulting_scores jsonb NOT NULL DEFAULT '{}',
  overall_score integer NOT NULL DEFAULT 0,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_quiz_attempts" ON quiz_attempts;
CREATE POLICY "select_own_quiz_attempts" ON quiz_attempts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_quiz_attempts" ON quiz_attempts;
CREATE POLICY "insert_own_quiz_attempts" ON quiz_attempts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_quiz_attempts" ON quiz_attempts;
CREATE POLICY "update_own_quiz_attempts" ON quiz_attempts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_quiz_attempts" ON quiz_attempts;
CREATE POLICY "delete_own_quiz_attempts" ON quiz_attempts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);

-- ============================================================
-- Seed: interview_questions
-- ============================================================
INSERT INTO interview_questions (prompt, category, display_order) VALUES
('Tell me about a project you''re proud of.', 'portfolioReadiness', 1),
('Describe a time you faced a technical challenge and how you solved it.', 'interviewReadiness', 2),
('Why are you interested in this role?', 'careerClarity', 3),
('Walk me through your resume.', 'resumeReadiness', 4),
('Tell me about a time you worked on a team.', 'professionalGrowth', 5)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seed: daily_questions
-- ============================================================
INSERT INTO daily_questions (question_text, category, display_order) VALUES
('What''s one small thing you can do today to move your career forward?', 'organization', 1),
('What skill do you want to build this week, and why?', 'skillReadiness', 2),
('Who could you reach out to this week to expand your network?', 'professionalGrowth', 3),
('What''s a project you could start to showcase your skills?', 'portfolioReadiness', 4),
('How would you describe your target role in one sentence?', 'careerClarity', 5),
('What''s one thing on your resume you could improve today?', 'resumeReadiness', 6),
('How would you answer "Tell me about yourself" right now?', 'interviewReadiness', 7),
('What''s one job posting that excites you? What makes it a fit?', 'jobSearchReadiness', 8),
('What''s your biggest career obstacle right now?', 'careerClarity', 9),
('How visible is your work online? What''s one thing you could share?', 'professionalPresence', 10)
ON CONFLICT DO NOTHING;