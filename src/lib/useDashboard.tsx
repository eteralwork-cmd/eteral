import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { useAuth } from './auth';
import {
  XP_REWARDS,
  type ActionType,
  getLevelForXp,
  getLevelProgress,
  computeReadiness,
  DAILY_TASK_TEMPLATES,
  WEEKLY_XP_GOAL,
  BADGES,
  type TrackKey,
} from './gamification';

export type UserProfile = {
  user_id: string;
  target_track: TrackKey;
  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  streak_freezes: number;
  weekly_xp: number;
  weekly_xp_reset_at: string | null;
  onboarding_completed: boolean;
};

export type Skill = {
  id: string;
  track: string;
  skill_key: string;
  label: string;
  category: string;
  display_order: number;
};

export type SkillQuestion = {
  id: string;
  skill_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'a' | 'b' | 'c' | 'd';
  display_order: number;
};

export type UserSkill = {
  id: string;
  user_id: string;
  skill_id: string;
  status: 'unverified' | 'learning' | 'familiar' | 'proficient' | 'expert';
  best_score: number | null;
  last_score: number | null;
  last_attempt_at: string | null;
  attempts: number;
};

export type Project = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  problem_solved: string | null;
  role_description: string | null;
  skills_used: string[];
  link: string | null;
  lessons_learned: string | null;
  depth_score: number;
  created_at: string;
  updated_at: string;
};

export type ClaritySession = {
  id: string;
  user_id: string;
  question_text: string;
  question_category: string;
  transcript: string | null;
  audio_duration_seconds: number | null;
  clarity_score: number | null;
  filler_word_count: number | null;
  filler_words: Record<string, number> | null;
  pace_wpm: number | null;
  structure_assessment: string | null;
  corrections: string[] | null;
  rewritten_example: string | null;
  confidence_estimate: string | null;
  created_at: string;
};

export type ActivityEntry = {
  id: string;
  user_id: string;
  action_type: string;
  description: string;
  xp_earned: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type DailyTask = {
  id: string;
  user_id: string;
  task_date: string;
  task_key: string;
  label: string;
  xp_reward: number;
  completed: boolean;
  completed_at: string | null;
};

export type UserBadge = {
  id: string;
  user_id: string;
  badge_key: string;
  unlocked_at: string;
};

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function startOfWeekStr(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = (day === 0 ? 6 : day - 1);
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  return monday.toISOString().split('T')[0];
}

export function useDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [claritySessions, setClaritySessions] = useState<ClaritySession[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const [profileRes, skillsRes, userSkillsRes, projectsRes, clarityRes, activityRes, tasksRes, badgesRes] =
        await Promise.all([
          supabase.from('user_profiles').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('skills').select('*').order('display_order'),
          supabase.from('user_skills').select('*').eq('user_id', user.id),
          supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('clarity_sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('activity_log').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
          supabase.from('daily_tasks').select('*').eq('user_id', user.id).eq('task_date', todayStr()),
          supabase.from('user_badges').select('*').eq('user_id', user.id),
        ]);

      if (profileRes.error) throw profileRes.error;
      if (skillsRes.error) throw skillsRes.error;
      if (userSkillsRes.error) throw userSkillsRes.error;
      if (projectsRes.error) throw projectsRes.error;
      if (clarityRes.error) throw clarityRes.error;
      if (activityRes.error) throw activityRes.error;
      if (tasksRes.error) throw tasksRes.error;
      if (badgesRes.error) throw badgesRes.error;

      setProfile(profileRes.data as UserProfile | null);
      setSkills(skillsRes.data as Skill[]);
      setUserSkills(userSkillsRes.data as UserSkill[]);
      setProjects(projectsRes.data as Project[]);
      setClaritySessions(clarityRes.data as ClaritySession[]);
      setActivity(activityRes.data as ActivityEntry[]);
      setDailyTasks(tasksRes.data as DailyTask[]);
      setBadges(badgesRes.data as UserBadge[]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Ensure daily tasks exist for today
  const ensureDailyTasks = useCallback(async () => {
    if (!user || !profile) return;
    const today = todayStr();
    if (dailyTasks.length > 0) return;

    const inserts = DAILY_TASK_TEMPLATES.map((t) => ({
      user_id: user.id,
      task_date: today,
      task_key: t.task_key,
      label: t.label,
      xp_reward: t.xp_reward,
      completed: false,
    }));

    const { data, error: insertError } = await supabase
      .from('daily_tasks')
      .insert(inserts)
      .select('*');

    if (insertError) {
      // Could be a race condition — try to fetch
      const { data: existing } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('task_date', today);
      if (existing) setDailyTasks(existing as DailyTask[]);
      return;
    }
    setDailyTasks(data as DailyTask[]);
  }, [user, profile, dailyTasks.length]);

  useEffect(() => {
    if (profile && profile.onboarding_completed) {
      ensureDailyTasks();
    }
  }, [profile, ensureDailyTasks]);

  // Award XP and update streak
  const awardXp = useCallback(
    async (actionType: ActionType, description: string, xpAmount: number, metadata?: Record<string, unknown>) => {
      if (!user || !profile) return;

      const today = todayStr();
      const newStreak = computeNewStreak(profile.current_streak, profile.last_activity_date, today, profile.streak_freezes);
      const newWeeklyXp = shouldResetWeekly(profile.weekly_xp_reset_at) ? xpAmount : profile.weekly_xp + xpAmount;

      const newXp = profile.xp + xpAmount;
      const newLevel = getLevelForXp(newXp).level;

      const { error: profileErr } = await supabase
        .from('user_profiles')
        .update({
          xp: newXp,
          level: newLevel,
          current_streak: newStreak.streak,
          longest_streak: Math.max(profile.longest_streak, newStreak.streak),
          last_activity_date: today,
          streak_freezes: newStreak.freezesRemaining,
          weekly_xp: newWeeklyXp,
          weekly_xp_reset_at: startOfWeekStr(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (profileErr) {
        console.error('Failed to update profile:', profileErr);
        return;
      }

      await supabase.from('activity_log').insert({
        user_id: user.id,
        action_type: actionType,
        description,
        xp_earned: xpAmount,
        metadata: metadata ?? null,
      });

      // Check for streak bonuses
      if (newStreak.streak === 7 && profile.current_streak < 7) {
        await supabase.from('activity_log').insert({
          user_id: user.id,
          action_type: 'streak_7_day_bonus',
          description: 'Maintained a 7-day streak!',
          xp_earned: XP_REWARDS.streak_7_day_bonus,
        });
        await supabase.from('user_profiles').update({ xp: newXp + XP_REWARDS.streak_7_day_bonus }).eq('user_id', user.id);
      }
      if (newStreak.streak === 30 && profile.current_streak < 30) {
        await supabase.from('activity_log').insert({
          user_id: user.id,
          action_type: 'streak_30_day_bonus',
          description: 'Maintained a 30-day streak!',
          xp_earned: XP_REWARDS.streak_30_day_bonus,
        });
        await supabase.from('user_profiles').update({ xp: newXp + XP_REWARDS.streak_30_day_bonus }).eq('user_id', user.id);
      }

      await loadAll();
    },
    [user, profile, loadAll],
  );

  // Complete a daily task
  const completeDailyTask = useCallback(
    async (taskKey: string) => {
      if (!user) return;
      const task = dailyTasks.find((t) => t.task_key === taskKey && !t.completed);
      if (!task) return;

      await supabase
        .from('daily_tasks')
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq('id', task.id);

      await awardXp('complete_daily_task', `Completed: ${task.label}`, task.xp_reward, { task_key: taskKey });

      // Check if all tasks are done
      const updated = dailyTasks.map((t) => (t.id === task.id ? { ...t, completed: true } : t));
      const allDone = updated.every((t) => t.completed);
      if (allDone && updated.length === DAILY_TASK_TEMPLATES.length) {
        await awardXp('complete_all_daily_tasks', 'Completed all daily tasks!', XP_REWARDS.complete_all_daily_tasks);
      }
    },
    [user, dailyTasks, awardXp],
  );

  // Unlock a badge
  const unlockBadge = useCallback(
    async (badgeKey: string) => {
      if (!user) return;
      const hasIt = badges.some((b) => b.badge_key === badgeKey);
      if (hasIt) return;
      await supabase.from('user_badges').insert({ user_id: user.id, badge_key: badgeKey });
      await loadAll();
    },
    [user, badges, loadAll],
  );

  // Create or update profile during onboarding
  const completeOnboarding = useCallback(
    async (track: TrackKey) => {
      if (!user) return;
      const { error: upsertErr } = await supabase.from('user_profiles').upsert({
        user_id: user.id,
        target_track: track,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      if (upsertErr) {
        setError(upsertErr.message);
        return;
      }
      await loadAll();
    },
    [user, loadAll],
  );

  // Check and unlock badges based on current state
  const checkBadges = useCallback(async () => {
    if (!user || !profile) return;
    const passedSkills = userSkills.filter((s) => s.status !== 'unverified' && s.best_score !== null && s.best_score >= 70);
    const passedCount = passedSkills.length;
    const distinctSkillsPassed = new Set(passedSkills.map((s) => s.skill_id)).size;
    const hasClarity = claritySessions.length > 0;
    const bestClarity = claritySessions.length > 0 ? Math.max(...claritySessions.map((s) => s.clarity_score ?? 0)) : 0;
    const readinessScore = computeReadiness(
      passedCount,
      skills.filter((s) => s.track === profile.target_track).length,
      projects.length,
      claritySessions.length > 0 ? claritySessions.reduce((sum, s) => sum + (s.clarity_score ?? 0), 0) / claritySessions.length : null,
    );

    if (passedCount >= 1) await unlockBadge('first_skill_passed');
    if (projects.length >= 1) await unlockBadge('first_project');
    if (hasClarity) await unlockBadge('spoke_up');
    if (profile.current_streak >= 7) await unlockBadge('seven_day_flame');
    if (bestClarity >= 80) await unlockBadge('sharp_speaker');
    if (distinctSkillsPassed >= 5) await unlockBadge('well_rounded');
    if (projects.length >= 3) await unlockBadge('project_builder');
    if (passedCount >= 10) await unlockBadge('quiz_master');
    if (readinessScore >= 80) await unlockBadge('hireable');
  }, [user, profile, userSkills, projects, claritySessions, skills, unlockBadge]);

  useEffect(() => {
    if (profile && profile.onboarding_completed) {
      checkBadges();
    }
  }, [profile, checkBadges]);

  // Derived values
  const levelInfo = profile ? getLevelProgress(profile.xp) : null;
  const trackSkills = profile ? skills.filter((s) => s.track === profile.target_track) : [];
  const passedSkillsCount = userSkills.filter(
    (s) => s.status !== 'unverified' && s.best_score !== null && s.best_score >= 70,
  ).length;
  const avgClarityScore =
    claritySessions.length > 0 && claritySessions.some((s) => s.clarity_score !== null)
      ? claritySessions.filter((s) => s.clarity_score !== null).reduce((sum, s) => sum + (s.clarity_score ?? 0), 0) /
        claritySessions.filter((s) => s.clarity_score !== null).length
      : null;
  const readinessScore = profile
    ? computeReadiness(passedSkillsCount, trackSkills.length, projects.length, avgClarityScore)
    : 0;

  const earnedBadgeKeys = new Set(badges.map((b) => b.badge_key));
  const allBadges = BADGES.map((b) => ({ ...b, earned: earnedBadgeKeys.has(b.key) }));

  return {
    profile,
    skills,
    userSkills,
    projects,
    claritySessions,
    activity,
    dailyTasks,
    badges: allBadges,
    loading,
    error,
    levelInfo,
    readinessScore,
    passedSkillsCount,
    trackSkills,
    weeklyGoal: WEEKLY_XP_GOAL,
    refresh: loadAll,
    awardXp,
    completeDailyTask,
    unlockBadge,
    completeOnboarding,
    checkBadges,
  };
}

function computeNewStreak(
  currentStreak: number,
  lastActivityDate: string | null,
  today: string,
  freezes: number,
): { streak: number; freezesRemaining: number } {
  if (!lastActivityDate) return { streak: 1, freezesRemaining: freezes };
  const last = new Date(lastActivityDate);
  const todayDate = new Date(today);
  const diffDays = Math.round((todayDate.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { streak: currentStreak, freezesRemaining: freezes };
  if (diffDays === 1) return { streak: currentStreak + 1, freezesRemaining: freezes };
  if (diffDays === 2 && freezes > 0) {
    return { streak: currentStreak + 1, freezesRemaining: freezes - 1 };
  }
  return { streak: 1, freezesRemaining: freezes };
}

function shouldResetWeekly(resetAt: string | null): boolean {
  if (!resetAt) return true;
  return startOfWeekStr() !== resetAt;
}
