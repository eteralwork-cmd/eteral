import { useState, useEffect, useCallback } from 'react';
import { Award, Plus, ChevronRight, Loader2, CheckCircle2, XCircle, Clock, ArrowLeft, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useDashboard } from '@/lib/useDashboard';
import {
  getSkillLevelFromScore,
  SKILL_LEVEL_LABELS,
  SKILL_LEVEL_COLORS,
  isQuizOnCooldown,
  getCooldownEnd,
  XP_REWARDS,
  type SkillLevel,
} from '@/lib/gamification';
import type { Skill, SkillQuestion, UserSkill } from '@/lib/useDashboard';

export function SkillTrackPage({ dashboard }: { dashboard: ReturnType<typeof useDashboard> }) {
  const { user } = useAuth();
  const { profile, trackSkills, userSkills, awardXp, completeDailyTask, refresh } = dashboard;
  const [showLibrary, setShowLibrary] = useState(false);
  const [activeQuizSkill, setActiveQuizSkill] = useState<Skill | null>(null);

  if (!profile) return null;

  const userSkillMap = new Map(userSkills.map((us) => [us.skill_id, us]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Skill Track</h1>
          <p className="mt-1 text-sm text-slatey">Add skills and prove them with quizzes. Don't just say it — show it.</p>
        </div>
        <button
          onClick={() => setShowLibrary(true)}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-accent px-5 py-2.5 text-sm font-medium text-white transition-all hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" />
          Add Skill
        </button>
      </div>

      {/* Gap analysis summary */}
      <div className="rounded-2xl border border-mist bg-gradient-to-br from-coral/5 via-white to-sky/5 p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-coral" />
          <h2 className="text-base font-semibold text-ink">Your Skill Map</h2>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBox label="Total Skills" value={trackSkills.length} />
          <StatBox label="Added" value={userSkills.length} />
          <StatBox label="Passed" value={userSkills.filter((s) => s.best_score !== null && s.best_score >= 70).length} />
          <StatBox label="Expert" value={userSkills.filter((s) => s.status === 'expert').length} />
        </div>
      </div>

      {/* User's skills list */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-ink">Your Skills</h2>
        {userSkills.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-mist bg-white/40 p-10 text-center">
            <Award className="h-8 w-8 text-slatey mx-auto" />
            <p className="mt-4 text-sm text-slatey">No skills added yet. Click "Add Skill" to browse the library and prove what you know.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {userSkills.map((us) => {
              const skill = trackSkills.find((s) => s.id === us.skill_id);
              if (!skill) return null;
              return (
                <SkillRow
                  key={us.id}
                  skill={skill}
                  userSkill={us}
                  onTakeQuiz={() => setActiveQuizSkill(skill)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Library modal */}
      {showLibrary && (
        <SkillLibrary
          skills={trackSkills}
          userSkills={userSkills}
          onClose={() => setShowLibrary(false)}
          onAdd={async (skill) => {
            if (!user) return;
            await supabase.from('user_skills').insert({
              user_id: user.id,
              skill_id: skill.id,
              status: 'unverified',
            });
            await refresh();
            setShowLibrary(false);
            setActiveQuizSkill(skill);
          }}
        />
      )}

      {/* Quiz modal */}
      {activeQuizSkill && (
        <QuizChallenge
          skill={activeQuizSkill}
          userSkill={userSkillMap.get(activeQuizSkill.id) ?? null}
          onClose={() => setActiveQuizSkill(null)}
          onComplete={async (scorePct, passed) => {
            if (!user) return;
            const level = getSkillLevelFromScore(scorePct) as SkillLevel;
            const existing = userSkillMap.get(activeQuizSkill.id);
            const improvedBest = existing ? Math.max(existing.best_score ?? 0, scorePct) : scorePct;

            if (existing) {
              await supabase.from('user_skills').update({
                status: level,
                best_score: improvedBest,
                last_score: scorePct,
                last_attempt_at: new Date().toISOString(),
                attempts: existing.attempts + 1,
                updated_at: new Date().toISOString(),
              }).eq('id', existing.id);
            }

            await awardXp('take_quiz', `Took ${activeQuizSkill.label} quiz`, XP_REWARDS.take_quiz, { skill_id: activeQuizSkill.id });
            if (passed) {
              await awardXp('pass_quiz', `Passed ${activeQuizSkill.label} quiz`, XP_REWARDS.pass_quiz, { skill_id: activeQuizSkill.id });
            }
            await completeDailyTask('take_quiz');
            setActiveQuizSkill(null);
          }}
        />
      )}
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-mist bg-white px-4 py-3 text-center">
      <div className="text-2xl font-semibold text-ink tabular-nums">{value}</div>
      <div className="mt-0.5 text-xs text-slatey">{label}</div>
    </div>
  );
}

function SkillRow({ skill, userSkill, onTakeQuiz }: { skill: Skill; userSkill: UserSkill; onTakeQuiz: () => void }) {
  const onCooldown = isQuizOnCooldown(userSkill.last_attempt_at);
  const cooldownEnd = getCooldownEnd(userSkill.last_attempt_at);

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-mist bg-white p-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-mist/60 shrink-0">
          <Award className="h-4 w-4 text-slatey" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink truncate">{skill.label}</p>
          <p className="text-xs text-slatey">{skill.category}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${SKILL_LEVEL_COLORS[userSkill.status]}`}>
          {SKILL_LEVEL_LABELS[userSkill.status]}
        </span>
        {userSkill.best_score !== null && (
          <span className="text-xs text-slatey tabular-nums hidden sm:inline">{userSkill.best_score}%</span>
        )}
        {onCooldown ? (
          <span className="inline-flex items-center gap-1 text-xs text-slatey">
            <Clock className="h-3.5 w-3.5" />
            {cooldownEnd && `${cooldownEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
          </span>
        ) : (
          <button
            onClick={onTakeQuiz}
            className="inline-flex items-center gap-1 rounded-full bg-gradient-accent px-4 py-2 text-xs font-medium text-white transition-all hover:scale-[1.02]"
          >
            {userSkill.status === 'unverified' ? 'Prove it' : 'Retake'}
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function SkillLibrary({ skills, userSkills, onClose, onAdd }: {
  skills: Skill[];
  userSkills: UserSkill[];
  onClose: () => void;
  onAdd: (skill: Skill) => void;
}) {
  const addedIds = new Set(userSkills.map((us) => us.skill_id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border border-mist bg-paper p-6 shadow-[0_30px_80px_-20px_rgba(42,42,46,0.35)]">
        <h2 className="text-lg font-semibold text-ink">Skill Library</h2>
        <p className="mt-1 text-sm text-slatey">Pick a skill to add. A quiz will challenge you to prove it.</p>
        <div className="mt-5 space-y-2">
          {skills.map((skill) => {
            const added = addedIds.has(skill.id);
            return (
              <div key={skill.id} className="flex items-center justify-between gap-3 rounded-xl border border-mist bg-white px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{skill.label}</p>
                  <p className="text-xs text-slatey">{skill.category}</p>
                </div>
                {added ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                    Added
                  </span>
                ) : (
                  <button
                    onClick={() => onAdd(skill)}
                    className="inline-flex items-center gap-1 rounded-full bg-gradient-accent px-4 py-2 text-xs font-medium text-white transition-all hover:scale-[1.02] shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <button onClick={onClose} className="mt-5 w-full rounded-full border border-mist bg-white px-5 py-2.5 text-sm font-medium text-slatey hover:text-ink transition-colors">
          Close
        </button>
      </div>
    </div>
  );
}

function QuizChallenge({ skill, userSkill, onClose, onComplete }: {
  skill: Skill;
  userSkill: UserSkill | null;
  onClose: () => void;
  onComplete: (scorePct: number, passed: boolean) => void;
}) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<SkillQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const loadQuestions = useCallback(async () => {
    const { data, error } = await supabase
      .from('skill_questions')
      .select('*')
      .eq('skill_id', skill.id)
      .order('display_order');
    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }
    setQuestions((data as SkillQuestion[]) ?? []);
    setLoading(false);
  }, [skill.id]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const computeScore = () => {
    if (questions.length === 0) return 0;
    let correct = 0;
    for (const q of questions) {
      if (answers[q.id] === q.correct_option) correct++;
    }
    return Math.round((correct / questions.length) * 100);
  };

  const handleSubmit = () => {
    const score = computeScore();
    const passed = score >= 70;
    setShowResults(true);
    onComplete(score, passed);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onClose} />
        <div className="relative rounded-2xl bg-white p-8">
          <Loader2 className="h-6 w-6 animate-spin text-slatey" />
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = computeScore();
    const passed = score >= 70;
    const level = getSkillLevelFromScore(score);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-md rounded-2xl border border-mist bg-paper p-8 text-center shadow-[0_30px_80px_-20px_rgba(42,42,46,0.35)]">
          <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${passed ? 'bg-green-100' : 'bg-amber-100'}`}>
            {passed ? <CheckCircle2 className="h-8 w-8 text-green-600" /> : <XCircle className="h-8 w-8 text-amber-600" />}
          </div>
          <h2 className="mt-5 text-xl font-semibold text-ink">{passed ? 'Passed!' : 'Keep studying'}</h2>
          <div className="mt-3 text-4xl font-semibold text-ink tabular-nums">{score}%</div>
          <p className="mt-2 text-sm text-slatey">
            Skill level: <span className={`font-medium rounded-full px-2 py-0.5 text-xs ${SKILL_LEVEL_COLORS[level]}`}>{SKILL_LEVEL_LABELS[level]}</span>
          </p>
          {passed && <p className="mt-3 text-xs text-coral font-medium">+{XP_REWARDS.take_quiz + XP_REWARDS.pass_quiz} XP earned</p>}
          {!passed && <p className="mt-3 text-xs text-slatey">+{XP_REWARDS.take_quiz} XP for trying. Retake after 1 day.</p>}
          <button onClick={onClose} className="mt-6 w-full rounded-full bg-gradient-accent px-5 py-3 text-sm font-medium text-white transition-all hover:scale-[1.02]">
            Back to Skills
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentIdx];
  if (!q) return null;
  const isLast = currentIdx === questions.length - 1;
  const answered = answers[q.id] !== undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-mist bg-paper p-6 shadow-[0_30px_80px_-20px_rgba(42,42,46,0.35)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-coral" />
            <span className="text-sm font-semibold text-ink">{skill.label}</span>
          </div>
          <span className="text-xs text-slatey tabular-nums">{currentIdx + 1} / {questions.length}</span>
        </div>

        <div className="h-1.5 rounded-full bg-mist/60 overflow-hidden mb-5">
          <div className="h-1.5 rounded-full bg-gradient-accent transition-all duration-300" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
        </div>

        <p className="text-sm font-medium text-ink leading-relaxed">{q.question_text}</p>

        <div className="mt-4 space-y-2">
          {(['a', 'b', 'c', 'd'] as const).map((opt) => {
            const text = opt === 'a' ? q.option_a : opt === 'b' ? q.option_b : opt === 'c' ? q.option_c : q.option_d;
            const isSelected = answers[q.id] === opt;
            return (
              <button
                key={opt}
                onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                  isSelected
                    ? 'border-coral bg-gradient-to-br from-coral/5 to-sky/5 text-ink font-medium'
                    : 'border-mist bg-white text-slatey hover:border-ink/20'
                }`}
              >
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold shrink-0 ${isSelected ? 'bg-gradient-accent text-white' : 'bg-mist text-slatey'}`}>
                  {opt.toUpperCase()}
                </span>
                {text}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
            className="inline-flex items-center gap-1 text-sm font-medium text-slatey hover:text-ink transition-colors disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" />
            Prev
          </button>
          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={!answered}
              className="rounded-full bg-gradient-accent px-6 py-2.5 text-sm font-medium text-white transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
              disabled={!answered}
              className="rounded-full bg-gradient-accent px-5 py-2.5 text-sm font-medium text-white transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
