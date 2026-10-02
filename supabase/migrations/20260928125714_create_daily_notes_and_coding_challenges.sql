/*
# Create daily_notes and coding_challenges tables

## What this migration does

### 1. New Table: daily_notes
Stores short "What I learned today" notes that users write on their dashboard.
- id (uuid, primary key)
- user_id (uuid, owner, defaults to auth.uid())
- note_text (text, the learning note, max ~500 chars enforced at app layer)
- note_date (date, the day the note is for — defaults to today)
- created_at (timestamptz)

### 2. New Table: coding_challenges
Stores coding challenge results from the Coding Space panel.
- id (uuid, primary key)
- user_id (uuid, owner, defaults to auth.uid())
- language (text, e.g. "javascript", "python")
- level (text, e.g. "beginner", "intermediate", "pro", "master")
- mode (text, e.g. "quick", "standard", "deep")
- problem_title (text)
- problem_description (text)
- starter_code (text)
- solution_code (text, nullable — AI-generated reference solution)
- test_cases (jsonb, array of {input, expectedOutput} objects)
- user_code (text, the code the user submitted)
- passed (boolean, whether all test cases passed)
- test_results (jsonb, nullable — detailed results per test case)
- time_taken_seconds (integer, nullable)
- created_at (timestamptz)

### 3. Security
- Both tables have RLS enabled.
- Both tables have 4 owner-scoped CRUD policies (SELECT/INSERT/UPDATE/DELETE)
  scoped to `TO authenticated` with `auth.uid() = user_id` checks.
- user_id columns default to auth.uid() so frontend inserts work without
  explicitly passing user_id.

### 4. Indexes
- daily_notes: index on (user_id, note_date) for fast "today's note" lookups
- coding_challenges: index on (user_id, created_at) for history listing
*/

-- ── daily_notes ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS daily_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  note_text text NOT NULL,
  note_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE daily_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_daily_notes" ON daily_notes;
CREATE POLICY "select_own_daily_notes"
  ON daily_notes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_daily_notes" ON daily_notes;
CREATE POLICY "insert_own_daily_notes"
  ON daily_notes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_daily_notes" ON daily_notes;
CREATE POLICY "update_own_daily_notes"
  ON daily_notes FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_daily_notes" ON daily_notes;
CREATE POLICY "delete_own_daily_notes"
  ON daily_notes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_daily_notes_user_date ON daily_notes (user_id, note_date DESC);

-- ── coding_challenges ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS coding_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  language text NOT NULL,
  level text NOT NULL,
  mode text NOT NULL,
  problem_title text NOT NULL,
  problem_description text NOT NULL,
  starter_code text,
  solution_code text,
  test_cases jsonb NOT NULL DEFAULT '[]'::jsonb,
  user_code text,
  passed boolean NOT NULL DEFAULT false,
  test_results jsonb,
  time_taken_seconds integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE coding_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_coding_challenges" ON coding_challenges;
CREATE POLICY "select_own_coding_challenges"
  ON coding_challenges FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_coding_challenges" ON coding_challenges;
CREATE POLICY "insert_own_coding_challenges"
  ON coding_challenges FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_coding_challenges" ON coding_challenges;
CREATE POLICY "update_own_coding_challenges"
  ON coding_challenges FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_coding_challenges" ON coding_challenges;
CREATE POLICY "delete_own_coding_challenges"
  ON coding_challenges FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_coding_challenges_user_created ON coding_challenges (user_id, created_at DESC);
