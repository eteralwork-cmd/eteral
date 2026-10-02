import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  TrendingUp,
  Award,
  ArrowRight,
  Lock,
  Sparkles,
  Trophy,
  BookOpen,
  PenLine,
  Code2,
  Send,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useDashboard } from '@/lib/useDashboard';
import { useMembership } from '@/lib/membership';
import { WEEKLY_XP_GOAL, XP_REWARDS } from '@/lib/gamification';

type Props = {
  dashboard: ReturnType<typeof useDashboard>;
};

export function OverviewPage({ dashboard }: Props) {
  const { isStandard } = useMembership();
  const { user } = useAuth();
  const {
    profile,
    levelInfo,
    readinessScore,
    activity,
    badges,
    projects,
    trackSkills,
    userSkills,
    passedSkillsCount,
    dailyNotes,
    codingChallenges,
    awardXp,
    refresh,
  } = dashboard;

  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  if (!profile || !levelInfo) return null;

  const weeklyProgressPct = Math.min(100, Math.round((profile.weekly_xp / WEEKLY_XP_GOAL) * 100));
  const recentActivity = activity.slice(0, 8);
  const recentNotes = dailyNotes.slice(0, 5);
  const todaysNote = dailyNotes.find((n) => n.note_date === new Date().toISOString().split('T')[0]);
  const challengesPassed = codingChallenges.filter((c) => c.passed).length;

  const handleAddNote = async () => {
    if (!user || !noteText.trim()) return;
    setSavingNote(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      if (todaysNote) {
        await supabase.from('daily_notes').update({ note_text: noteText.trim() }).eq('id', todaysNote.id);
      } else {
        await supabase.from('daily_notes').insert({
          user_id: user.id,
          note_text: noteText.trim(),
          note_date: today,
        });
        await awardXp('add_daily_note', 'Added a daily learning note', XP_REWARDS.add_daily_note);
      }
      setNoteText('');
      await refresh();
    } catch {
      // error is non-fatal
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Welcome back</h1>
        <p className="mt-1 text-sm text-slatey">Keep the momentum going. Every action moves you closer to hireable.</p>
      </div>

      {/* Top row: Level + Streak + Readiness */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Level + XP */}
        <div className="rounded-2xl border border-mist bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-coral">Level {levelInfo.current.level}</span>
            <Trophy className="h-4 w-4 text-coral" />
          </div>
          <p className="mt-2 text-lg font-semibold text-ink">{levelInfo.current.label}</p>
          <p className="text-xs text-slatey mt-0.5">{levelInfo.current.stage} stage</p>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-slatey mb-1.5">
              <span>{profile.xp} XP</span>
              {levelInfo.next && <span>{levelInfo.next.minXp} XP</span>}
            </div>
            <div className="h-2.5 rounded-full bg-mist/60 overflow-hidden">
              <div
                className="h-2.5 rounded-full bg-gradient-accent transition-all duration-700 ease-out"
                style={{ width: `${levelInfo.progressPct}%` }}
              />
            </div>
            {levelInfo.next && (
              <p className="mt-2 text-xs text-slatey">{levelInfo.xpForNextLevel - levelInfo.xpIntoLevel} XP to next level</p>
            )}
          </div>
        </div>

        {/* Streak */}
        <div className="rounded-2xl border border-mist bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-coral">Daily Streak</span>
            <Flame className="h-4 w-4 text-coral" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-ink tabular-nums">{profile.current_streak}</span>
            <span className="text-sm text-slatey">day{profile.current_streak === 1 ? '' : 's'}</span>
          </div>
          <p className="mt-2 text-xs text-slatey">Longest: {profile.longest_streak} days</p>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="text-xs text-slatey">Freezes:</span>
            <span className="text-xs font-medium text-ink">{profile.streak_freezes}</span>
          </div>
        </div>

        {/* Career Readiness Meter */}
        <div className="rounded-2xl border border-mist bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-coral">Readiness</span>
            <TrendingUp className="h-4 w-4 text-coral" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-semibold text-ink tabular-nums">{readinessScore}</span>
            <span className="text-sm text-slatey">/ 100</span>
          </div>
          <div className="mt-3 h-2.5 rounded-full bg-mist/60 overflow-hidden">
            <div
              className="h-2.5 rounded-full bg-gradient-accent transition-all duration-700 ease-out"
              style={{ width: `${readinessScore}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slatey">
            {readinessScore >= 80 ? 'You are hireable!' : readinessScore >= 60 ? 'Getting close' : 'Keep building'}
          </p>
        </div>
      </div>

      {/* What I Learned Today */}
      <div className="rounded-2xl border border-mist bg-white p-5">
        <div className="flex items-center gap-2">
          <PenLine className="h-5 w-5 text-coral" />
          <h2 className="text-base font-semibold text-ink">What I Learned Today</h2>
          {todaysNote && (
            <span className="ml-auto text-xs font-medium text-green-600">Today's note saved</span>
          )}
        </div>
        <p className="mt-1 text-xs text-slatey">Jot down one thing you learned. Build a habit of daily reflection.</p>
        <div className="mt-4 flex gap-2">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder={todaysNote ? todaysNote.note_text : 'Today I learned...'}
            rows={2}
            className="flex-1 rounded-xl border border-mist bg-paper px-4 py-3 text-sm text-ink placeholder:text-slatey/60 focus:outline-none focus:border-ink/30 resize-none"
            maxLength={500}
          />
          <button
            onClick={handleAddNote}
            disabled={!noteText.trim() || savingNote}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-accent px-4 py-3 text-sm font-medium text-white transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {savingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Save
          </button>
        </div>
        {!todaysNote && (
          <p className="mt-2 text-xs text-slatey">+{XP_REWARDS.add_daily_note} XP for your first note of the day</p>
        )}

        {/* Recent notes timeline */}
        {recentNotes.length > 0 && (
          <div className="mt-5 space-y-2.5">
            {recentNotes.map((note) => (
              <div key={note.id} className="flex items-start gap-3 rounded-xl border border-mist bg-paper px-4 py-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-mist/60 shrink-0">
                  <BookOpen className="h-3.5 w-3.5 text-coral" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink leading-relaxed">{note.note_text}</p>
                  <p className="mt-1 text-xs text-slatey">
                    {new Date(note.note_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Goal + Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weekly goal */}
        <div className="rounded-2xl border border-mist bg-white p-5">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-coral" />
            <h2 className="text-base font-semibold text-ink">Weekly Goal</h2>
          </div>
          <p className="mt-2 text-sm text-slatey">Earn {WEEKLY_XP_GOAL} XP this week</p>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-slatey mb-1.5">
              <span>{profile.weekly_xp} XP</span>
              <span>{WEEKLY_XP_GOAL} XP</span>
            </div>
            <div className="h-3 rounded-full bg-mist/60 overflow-hidden">
              <div
                className="h-3 rounded-full bg-gradient-accent transition-all duration-700 ease-out"
                style={{ width: `${weeklyProgressPct}%` }}
              />
            </div>
            {weeklyProgressPct >= 100 ? (
              <p className="mt-2 text-xs font-medium text-green-600">Goal completed! Badge earned.</p>
            ) : (
              <p className="mt-2 text-xs text-slatey">{WEEKLY_XP_GOAL - profile.weekly_xp} XP to go</p>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="rounded-2xl border border-mist bg-white p-5">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-coral" />
            <h2 className="text-base font-semibold text-ink">Badges</h2>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {badges.slice(0, 6).map((badge) => (
              <div
                key={badge.key}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all ${
                  badge.earned
                    ? 'border-coral/30 bg-gradient-to-br from-coral/5 to-sky/5'
                    : 'border-mist bg-paper opacity-50'
                }`}
                title={badge.description}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${badge.earned ? 'bg-gradient-accent text-white' : 'bg-mist text-slatey'}`}>
                  {badge.earned ? <Trophy className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}
                </div>
                <span className={`text-[10px] font-medium leading-tight ${badge.earned ? 'text-ink' : 'text-slatey'}`}>
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
          <Link
            to="#"
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-coral hover:text-ink transition-colors"
            onClick={(e) => { e.preventDefault(); }}
          >
            {badges.filter((b) => b.earned).length} of {badges.length} earned
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl border border-mist bg-white p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-coral" />
          <h2 className="text-base font-semibold text-ink">Recent Activity</h2>
        </div>
        {recentActivity.length === 0 ? (
          <p className="mt-4 text-sm text-slatey py-4 text-center">
            No activity yet. Take a quiz, log a project, or write a learning note to get started!
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {recentActivity.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-3 rounded-xl border border-mist bg-paper px-4 py-2.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-mist/60 text-xs shrink-0">
                    <Sparkles className="h-3.5 w-3.5 text-coral" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{entry.description}</p>
                    <p className="text-xs text-slatey">{new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
                {entry.xp_earned > 0 && (
                  <span className="text-xs font-semibold text-coral shrink-0">+{entry.xp_earned}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickLink
          to="/dashboard/skills"
          label="Skill Track"
          stat={`${passedSkillsCount}/${trackSkills.length} skills passed`}
          icon={<Award className="h-4 w-4" />}
        />
        <QuickLink
          to="/dashboard/projects"
          label="Projects"
          stat={`${projects.length} logged`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <QuickLink
          to="/dashboard/clarity"
          label="Clarity"
          stat={isStandard ? 'Practice voice' : 'Pro feature'}
          icon={<Sparkles className="h-4 w-4" />}
          locked={!isStandard}
        />
        <QuickLink
          to="/dashboard/coding"
          label="Coding Space"
          stat={isStandard ? `${challengesPassed} solved` : 'Pro feature'}
          icon={<Code2 className="h-4 w-4" />}
          locked={!isStandard}
        />
      </div>
    </div>
  );
}

function QuickLink({ to, label, stat, icon, locked }: { to: string; label: string; stat: string; icon: React.ReactNode; locked?: boolean }) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between gap-3 rounded-2xl border border-mist bg-white p-4 transition-all hover:border-ink/20 hover:shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-accent text-white">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">{label}</p>
          <p className="text-xs text-slatey">{locked ? 'Pro feature' : stat}</p>
        </div>
      </div>
      {locked ? <Lock className="h-4 w-4 text-slatey" /> : <ArrowRight className="h-4 w-4 text-slatey group-hover:text-ink transition-colors" />}
    </Link>
  );
}
