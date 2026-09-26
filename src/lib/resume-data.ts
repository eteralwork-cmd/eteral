import { supabase } from './supabase';

export type ResumeBasics = {
  name?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
};

export type ResumeProfile = {
  id: string;
  user_id: string;
  target_role: string | null;
  basics: ResumeBasics;
  education: unknown[];
  skills: string[];
  certifications: unknown[];
  experience: unknown[];
  achievements: unknown[];
  updated_at: string;
};

export type ProjectRow = {
  id: string;
  title: string;
  description: string | null;
  link: string | null;
  status: string;
};

export async function fetchResumeProfile(): Promise<ResumeProfile | null> {
  const { data, error } = await supabase.from('resume_profiles').select('*').maybeSingle();
  if (error) throw error;
  return data as ResumeProfile | null;
}

export async function fetchProjectsForResume(): Promise<ProjectRow[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('id, title, description, link, status')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export type CompletenessItem = {
  key: string;
  label: string;
  complete: boolean;
  optional: boolean;
};

export function computeCompleteness(
  profile: ResumeProfile | null,
  projects: ProjectRow[],
  userEmail?: string | null,
): { items: CompletenessItem[]; percent: number } {
  const items: CompletenessItem[] = [
    {
      key: 'contact',
      label: 'Contact details',
      complete: !!(profile?.basics?.name && (userEmail || profile?.basics)),
      optional: false,
    },
    { key: 'target_role', label: 'Career goal', optional: false, complete: !!profile?.target_role },
    { key: 'education', label: 'Education', optional: false, complete: (profile?.education?.length ?? 0) > 0 },
    { key: 'skills', label: 'Skills', optional: false, complete: (profile?.skills?.length ?? 0) > 0 },
    { key: 'projects', label: 'Project links', optional: true, complete: projects.length > 0 },
    {
      key: 'certifications',
      label: 'Certifications',
      optional: true,
      complete: (profile?.certifications?.length ?? 0) > 0,
    },
    {
      key: 'experience',
      label: 'Work experience',
      optional: true,
      complete: (profile?.experience?.length ?? 0) > 0,
    },
  ];

  const required = items.filter((i) => !i.optional);
  const requiredDone = required.filter((i) => i.complete).length;
  const percent = required.length ? Math.round((requiredDone / required.length) * 100) : 0;

  return { items, percent };
}