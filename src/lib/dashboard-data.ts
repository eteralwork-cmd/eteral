import { supabase } from './supabase';
import { CATEGORIES } from '@/features/career-readiness/data/categories';

export type ReadinessScore = {
  category: string;
  score: number;
  last_updated_at: string;
};

export type QuizAttempt = {
  id: string;
  answers: Record<string, number>;
  resulting_scores: Record<string, number>;
  overall_score: number;
  submitted_at: string;
};

export type Connection = {
  id: string;
  company_name: string;
  contact_name: string | null;
  source: string;
  created_at: string;
};

export type TrackerEntry = {
  skills: string[];
  id: string;
  type: 'project' | 'skill' | 'experience';
  title: string;
  description: string | null;
  month: string;
  source: string;
  created_at: string;
};

export type InterviewQuestion = {
  id: string;
  prompt: string;
  category: string;
  display_order: number;
};

export type InterviewAnswer = {
  id: string;
  question_id: string;
  answer_text: string;
  ai_feedback: { summary?: string; confidence?: string; clarity?: string; suggestions?: string[] } | null;
  updated_at: string;
};

export type DailyQuestion = {
  id: string;
  question_text: string;
  category: string;
  display_order: number;
};

export type CategoryMeta = {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
};

export const DASHBOARD_CATEGORIES: CategoryMeta[] = CATEGORIES.map((c) => ({
  id: c.id,
  label: c.label,
  shortLabel: c.shortLabel,
  description: c.description,
}));

export function getCategoryMeta(id: string): CategoryMeta | undefined {
  return DASHBOARD_CATEGORIES.find((c) => c.id === id);
}

export function computeOverallScore(scores: Record<string, number>): number {
  const values = Object.values(scores);
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export function getCurrentStrength(scores: Record<string, number>): { id: string; label: string; score: number } | null {
  let best: { id: string; label: string; score: number } | null = null;
  for (const cat of DASHBOARD_CATEGORIES) {
    const s = scores[cat.id];
    if (typeof s === 'number' && (best === null || s > best.score)) {
      best = { id: cat.id, label: cat.label, score: s };
    }
  }
  return best;
}

export function isStale(lastUpdated: string | null, days = 30): boolean {
  if (!lastUpdated) return false;
  const diff = Date.now() - new Date(lastUpdated).getTime();
  return diff > days * 24 * 60 * 60 * 1000;
}

export function getOldestUpdate(scores: ReadinessScore[]): string | null {
  if (scores.length === 0) return null;
  return scores.reduce((oldest, s) => {
    if (!oldest || new Date(s.last_updated_at) < new Date(oldest)) return s.last_updated_at;
    return oldest;
  }, scores[0].last_updated_at);
}

export async function fetchReadinessScores(): Promise<ReadinessScore[]> {
  const { data, error } = await supabase
    .from('readiness_scores')
    .select('category, score, last_updated_at')
    .order('category');
  if (error) throw error;
  return data || [];
}

export async function fetchConnections(): Promise<Connection[]> {
  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchTrackerEntries(): Promise<TrackerEntry[]> {
  const { data, error } = await supabase
    .from('tracker_entries')
    .select('*')
    .order('month', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchInterviewQuestions(): Promise<InterviewQuestion[]> {
  const { data, error } = await supabase
    .from('interview_questions')
    .select('*')
    .order('display_order');
  if (error) throw error;
  return data || [];
}

export async function fetchInterviewAnswers(): Promise<InterviewAnswer[]> {
  const { data, error } = await supabase
    .from('interview_answers')
    .select('id, question_id, answer_text, ai_feedback, updated_at');
  if (error) throw error;
  return data || [];
}

export async function fetchDailyQuestions(): Promise<DailyQuestion[]> {
  const { data, error } = await supabase
    .from('daily_questions')
    .select('*')
    .order('display_order');
  if (error) throw error;
  return data || [];
}

export function getDailyQuestion(questions: DailyQuestion[]): DailyQuestion | null {
  if (questions.length === 0) return null;
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return questions[dayOfYear % questions.length];
}

export function groupTrackerByMonth(entries: TrackerEntry[]): { month: string; entries: TrackerEntry[] }[] {
  const groups: Record<string, TrackerEntry[]> = {};
  for (const e of entries) {
    const key = e.month;
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  }
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([month, items]) => ({ month, entries: items }));
}

export function formatMonth(monthStr: string): string {
  const d = new Date(monthStr + '-01');
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
