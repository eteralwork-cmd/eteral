// XP rewards for each action type
export const XP_REWARDS = {
  take_quiz: 40,
  pass_quiz: 60,
  log_project: 50,
  update_project: 20,
  complete_clarity_session: 50,
  improve_clarity_score: 30,
  complete_all_daily_tasks: 100,
  streak_7_day_bonus: 200,
  streak_30_day_bonus: 1000,
  complete_daily_task: 0, // each task has its own xp_reward stored in DB
} as const;

export type ActionType = keyof typeof XP_REWARDS;

// Career level definitions
export type CareerLevel = {
  level: number;
  minXp: number;
  label: string;
  stage: string;
};

export const CAREER_LEVELS: CareerLevel[] = [
  { level: 1, minXp: 0, label: 'Foundation I', stage: 'Foundation' },
  { level: 2, minXp: 100, label: 'Foundation II', stage: 'Foundation' },
  { level: 3, minXp: 250, label: 'Foundation III', stage: 'Foundation' },
  { level: 4, minXp: 450, label: 'Apprentice I', stage: 'Apprentice' },
  { level: 5, minXp: 700, label: 'Apprentice II', stage: 'Apprentice' },
  { level: 6, minXp: 1000, label: 'Apprentice III', stage: 'Apprentice' },
  { level: 7, minXp: 1400, label: 'Junior Ready I', stage: 'Junior Ready' },
  { level: 8, minXp: 1850, label: 'Junior Ready II', stage: 'Junior Ready' },
  { level: 9, minXp: 2350, label: 'Junior Ready III', stage: 'Junior Ready' },
  { level: 10, minXp: 2950, label: 'Job Ready I', stage: 'Job Ready' },
  { level: 11, minXp: 3600, label: 'Job Ready II', stage: 'Job Ready' },
  { level: 12, minXp: 4300, label: 'Job Ready III', stage: 'Job Ready' },
  { level: 13, minXp: 5100, label: 'Career Builder I', stage: 'Career Builder' },
  { level: 14, minXp: 6000, label: 'Career Builder II', stage: 'Career Builder' },
  { level: 15, minXp: 7000, label: 'Career Builder III', stage: 'Career Builder' },
];

export function getLevelForXp(xp: number): CareerLevel {
  for (let i = CAREER_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= CAREER_LEVELS[i].minXp) return CAREER_LEVELS[i];
  }
  return CAREER_LEVELS[0];
}

export function getNextLevel(currentLevel: number): CareerLevel | null {
  return CAREER_LEVELS.find((l) => l.level === currentLevel + 1) ?? null;
}

export function getLevelProgress(xp: number): {
  current: CareerLevel;
  next: CareerLevel | null;
  xpIntoLevel: number;
  xpForNextLevel: number;
  progressPct: number;
} {
  const current = getLevelForXp(xp);
  const next = getNextLevel(current.level);
  if (!next) {
    return { current, next: null, xpIntoLevel: xp - current.minXp, xpForNextLevel: 0, progressPct: 100 };
  }
  const xpIntoLevel = xp - current.minXp;
  const xpForNextLevel = next.minXp - current.minXp;
  const progressPct = Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100));
  return { current, next, xpIntoLevel, xpForNextLevel, progressPct };
}

// Skill level thresholds based on quiz percentage
export type SkillLevel = 'learning' | 'familiar' | 'proficient' | 'expert' | 'unverified';

export function getSkillLevelFromScore(scorePct: number): SkillLevel {
  if (scorePct >= 85) return 'expert';
  if (scorePct >= 70) return 'proficient';
  if (scorePct >= 50) return 'familiar';
  return 'learning';
}

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  unverified: 'Unverified',
  learning: 'Learning',
  familiar: 'Familiar',
  proficient: 'Proficient',
  expert: 'Expert',
};

export const SKILL_LEVEL_COLORS: Record<SkillLevel, string> = {
  unverified: 'bg-mist text-slatey',
  learning: 'bg-red-100 text-red-600',
  familiar: 'bg-amber-100 text-amber-700',
  proficient: 'bg-sky/20 text-sky',
  expert: 'bg-green-100 text-green-700',
};

// Badge definitions
export type BadgeDef = {
  key: string;
  label: string;
  description: string;
  icon: string;
};

export const BADGES: BadgeDef[] = [
  { key: 'first_skill_passed', label: 'First Skill Passed', description: 'Complete your first skill quiz', icon: 'award' },
  { key: 'first_project', label: 'First Project Logged', description: 'Add your first project', icon: 'folder' },
  { key: 'spoke_up', label: 'Spoke Up', description: 'Complete your first voice practice session', icon: 'mic' },
  { key: 'seven_day_flame', label: '7-Day Flame', description: 'Maintain a streak for 7 days', icon: 'flame' },
  { key: 'sharp_speaker', label: 'Sharp Speaker', description: 'Score above 80 on clarity', icon: 'sparkles' },
  { key: 'well_rounded', label: 'Well-Rounded', description: 'Pass quizzes in 5 different skills', icon: 'circle' },
  { key: 'project_builder', label: 'Project Builder', description: 'Log 3 projects', icon: 'folder' },
  { key: 'quiz_master', label: 'Quiz Master', description: 'Pass 10 quizzes', icon: 'award' },
  { key: 'hireable', label: 'Hireable', description: 'Reach a career readiness score of 80+', icon: 'trophy' },
];

// Daily task templates
export type DailyTaskTemplate = {
  task_key: string;
  label: string;
  xp_reward: number;
};

export const DAILY_TASK_TEMPLATES: DailyTaskTemplate[] = [
  { task_key: 'take_quiz', label: 'Take a skill quiz', xp_reward: 40 },
  { task_key: 'log_project', label: 'Log or update a project', xp_reward: 30 },
  { task_key: 'practice_interview', label: 'Practice an interview question', xp_reward: 50 },
];

// Weekly goal
export const WEEKLY_XP_GOAL = 500;

// Target tracks
export type TrackKey = 'fullstack' | 'data_analyst' | 'data_scientist' | 'aiml';

export const TRACKS: { key: TrackKey; label: string; description: string; icon: string }[] = [
  { key: 'fullstack', label: 'Fullstack Developer', description: 'JavaScript, React, Node.js, databases, and system design', icon: 'code' },
  { key: 'data_analyst', label: 'Data Analyst', description: 'SQL, statistics, visualization, and business metrics', icon: 'chart' },
  { key: 'data_scientist', label: 'Data Scientist', description: 'Python, ML, statistics, and experiment design', icon: 'brain' },
  { key: 'aiml', label: 'AI/ML Engineer', description: 'Deep learning, MLOps, deployment, and data pipelines', icon: 'cpu' },
];

// Clarity question bank
export type ClarityQuestion = {
  id: string;
  prompt: string;
  category: string;
  tracks: TrackKey[] | 'all';
  difficulty: 'easy' | 'medium' | 'hard';
};

export const CLARITY_QUESTIONS: ClarityQuestion[] = [
  // Shared
  { id: 'shared_1', prompt: 'Tell me about yourself.', category: 'Behavioral', tracks: 'all', difficulty: 'easy' },
  { id: 'shared_2', prompt: 'Why this company?', category: 'Behavioral', tracks: 'all', difficulty: 'easy' },
  { id: 'shared_3', prompt: 'Tell me about a time you faced a difficult challenge.', category: 'Behavioral', tracks: 'all', difficulty: 'medium' },
  { id: 'shared_4', prompt: 'Tell me about a time you disagreed with a teammate.', category: 'Behavioral', tracks: 'all', difficulty: 'medium' },
  { id: 'shared_5', prompt: 'What is your greatest weakness?', category: 'Behavioral', tracks: 'all', difficulty: 'easy' },
  // Fullstack
  { id: 'fs_1', prompt: 'Walk me through how you would build a URL shortener.', category: 'Technical', tracks: ['fullstack'], difficulty: 'hard' },
  { id: 'fs_2', prompt: 'Explain the difference between SQL and NoSQL and when you would use each.', category: 'Technical', tracks: ['fullstack'], difficulty: 'medium' },
  { id: 'fs_3', prompt: 'Tell me about a bug that took you days to find.', category: 'Behavioral', tracks: ['fullstack'], difficulty: 'medium' },
  // Data Analyst
  { id: 'da_1', prompt: 'Walk me through an A/B test you would design.', category: 'Technical', tracks: ['data_analyst'], difficulty: 'hard' },
  { id: 'da_2', prompt: 'How would you decide which metric to optimize?', category: 'Technical', tracks: ['data_analyst'], difficulty: 'medium' },
  { id: 'da_3', prompt: 'Tell me about a time your analysis changed a business decision.', category: 'Behavioral', tracks: ['data_analyst'], difficulty: 'medium' },
  // Data Scientist
  { id: 'ds_1', prompt: 'Explain how you would handle missing data.', category: 'Technical', tracks: ['data_scientist'], difficulty: 'medium' },
  { id: 'ds_2', prompt: 'Walk me through building a model from scratch.', category: 'Technical', tracks: ['data_scientist'], difficulty: 'hard' },
  { id: 'ds_3', prompt: 'Tell me about a model that failed in production.', category: 'Behavioral', tracks: ['data_scientist'], difficulty: 'hard' },
  // AI/ML
  { id: 'aiml_1', prompt: 'Explain the difference between batch and online learning.', category: 'Technical', tracks: ['aiml'], difficulty: 'medium' },
  { id: 'aiml_2', prompt: 'How would you deploy a model to production?', category: 'Technical', tracks: ['aiml'], difficulty: 'hard' },
  { id: 'aiml_3', prompt: 'Tell me about a time you had to optimize a slow pipeline.', category: 'Behavioral', tracks: ['aiml'], difficulty: 'medium' },
];

// Quiz cooldown in days
export const QUIZ_COOLDOWN_DAYS = 1;

export function isQuizOnCooldown(lastAttemptAt: string | null): boolean {
  if (!lastAttemptAt) return false;
  const diff = Date.now() - new Date(lastAttemptAt).getTime();
  return diff < QUIZ_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
}

export function getCooldownEnd(lastAttemptAt: string | null): Date | null {
  if (!lastAttemptAt) return null;
  return new Date(new Date(lastAttemptAt).getTime() + QUIZ_COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
}

// Compute career readiness score from components
export function computeReadiness(
  skillsPassed: number,
  skillsTotal: number,
  projectsCount: number,
  avgClarityScore: number | null,
): number {
  const skillPct = skillsTotal > 0 ? (skillsPassed / skillsTotal) * 100 : 0;
  const projectScore = Math.min(100, projectsCount * 20);
  const clarityScore = avgClarityScore !== null ? (avgClarityScore / 10) * 100 : 0;

  const weights = { skills: 0.5, projects: 0.3, clarity: 0.2 };
  const total = skillPct * weights.skills + projectScore * weights.projects + clarityScore * weights.clarity;
  return Math.round(total);
}
