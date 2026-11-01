import { Link } from 'react-router-dom';
import {
  Flame,
  TrendingUp,
  Target,
  Award,
  CheckCircle2,
  Circle,
  ArrowRight,
  Lock,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { useDashboard } from '@/lib/useDashboard';
import { useMembership } from '@/lib/membership';
import { WEEKLY_XP_GOAL } from '@/lib/gamification';

type Props = {
  dashboard: ReturnType<typeof useDashboard>;
};

export function OverviewPage({ dashboard }: Props) {
  const { isStandard } = useMembership();
  const {
    profile,
    levelInfo,
    readinessScore,
    dailyTasks,
    activity,
    badges,
    projects,
    trackSkills,
    userSkills,
    passedSkillsCount,
    completeDailyTask,
    awardXp,
  } = dashboard;

  if (!profile || !levelInfo) return null;

  const allTasksDone = dailyTasks.length > 0 && dailyTasks.every((t) => t.completed);
  const weeklyProgressPct = Math.min(100, Math.round((profile.weekly_xp / WEEKLY_XP_GOAL) * 100));
  const recentActivity = activity.slice(0, 8);

  const handleTaskClick = async (taskKey: string) => {
    const task = dailyTasks.find((t) => t.task_key === taskKey && !t.completed);
    if (!task) return;

    if (task.task_key === 'take_quiz') {
      window.location.hash = '/dashboard/skills';
      return;
    }
    if (task.task_key === 'log_project') {
      window.location.hash = '/dashboard/projects';
      return;
    }
    if (task.task_key === 'practice_interview') {
      if (!isStandard) {
        window.location.hash = '/membership';
        return;
      }
      window.location.hash = '/dashboard/clarity';
      return;
    }
    await completeDailyTask(taskKey);
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

      {/* Today's Tasks */}
      <div className="rounded-2xl border border-mist bg-white p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-coral" />
            <h2 className="text-base font-semibold text-ink">Today's Tasks</h2>
          </div>
          {allTasksDone && (
            <span className="text-xs font-medium text-green-600 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              All done! +100 XP bonus
            </span>
          )}
        </div>
        <div className="mt-4 space-y-2.5">
          {dailyTasks.length === 0 && (
            <p className="text-sm text-slatey py-2">Tasks loading...</p>
          )}
          {dailyTasks.map((task) => (
            <button
              key={task.id}
              onClick={() => handleTaskClick(task.task_key)}
              disabled={task.completed}
              className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                task.completed
                  ? 'border-green-200 bg-green-50 cursor-default'
                  : 'border-mist bg-paper hover:border-ink/20 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                {task.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-slatey shrink-0" />
                )}
                <span className={`text-sm font-medium ${task.completed ? 'text-slatey line-through' : 'text-ink'}`}>
                  {task.label}
                </span>
              </div>
              <span className="text-xs font-semibold text-coral shrink-0">+{task.xp_reward} XP</span>
            </button>
          ))}
        </div>
      </div>

      {/* Weekly Goal + Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weekly goal */}
        <div className="rounded-2xl border border-mist bg-white p-5">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-coral" />
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
            No activity yet. Take a quiz or log a project to get started!
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
