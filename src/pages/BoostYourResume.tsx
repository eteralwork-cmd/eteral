import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Loader2, Check, Circle, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth';
type ResumeProfile = {
  target_role?: string | null;
  skills?: string[] | null;
  [key: string]: unknown;
};

type ProjectRow = Record<string, unknown>;

const fetchResumeProfile = async (): Promise<ResumeProfile | null> => null;
const fetchProjectsForResume = async (): Promise<ProjectRow[]> => [];

function computeCompleteness(
  profile: ResumeProfile | null,
  projects: ProjectRow[],
  email?: string,
) {
  const checks = [
    { key: 'email', label: 'Email', complete: Boolean(email), optional: false },
    { key: 'target_role', label: 'Target role', complete: Boolean(profile?.target_role), optional: false },
    { key: 'skills', label: 'Skills', complete: Boolean(profile?.skills?.length), optional: false },
    { key: 'projects', label: 'Projects', complete: projects.length > 0, optional: true },
  ];

  const required = checks.filter((item) => !item.optional);
  const complete = checks.filter((item) => item.complete).length;

  return {
    items: checks,
    percent: Math.round((complete / checks.length) * 100),
    requiredComplete: required.every((item) => item.complete),
  };
}

export default function BoostYourResume() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ResumeProfile | null>(null);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [p, proj] = await Promise.all([fetchResumeProfile(), fetchProjectsForResume()]);
        setProfile(p);
        setProjects(proj);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load your resume information.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <Loader2 className="h-6 w-6 animate-spin text-slatey" />
      </div>
    );
  }

  const { items, percent } = computeCompleteness(profile, projects, user?.email);

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-slatey hover:text-ink transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>

        <div className="mt-6 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-coral" />
          <span className="text-xs font-semibold uppercase tracking-widest text-coral">Boost Your Resume</span>
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">Build an accurate, professional resume</h1>
        <p className="mt-3 text-sm leading-relaxed text-slatey max-w-xl">
          Eteral builds your resume using the information saved in your dashboard. We'll check what's
          already there, ask only for what's missing, and put together a draft you can review and edit.
        </p>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-mist bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">Resume information</h2>
            <span className="text-2xl font-semibold text-ink tabular-nums">{percent}%</span>
          </div>
          <div className="mt-3 h-2.5 rounded-full bg-mist/60 overflow-hidden">
            <div
              className="h-2.5 rounded-full bg-gradient-accent transition-all duration-700 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slatey">
            This reflects how much of your profile is filled in — not an ATS score, and not a guarantee of anything.
          </p>

          <ul className="mt-5 space-y-2.5">
            {items.map((item) => (
              <li key={item.key} className="flex items-center gap-2.5 text-sm">
                {item.complete ? (
                  <Check className="h-4 w-4 text-green-600 shrink-0" />
                ) : (
                  <Circle className="h-3.5 w-3.5 text-slatey/50 shrink-0" />
                )}
                <span className={item.complete ? 'text-ink' : 'text-slatey'}>{item.label}</span>
                {item.optional && !item.complete && (
                  <span className="text-xs text-slatey/60">(optional)</span>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-paper p-3">
              <p className="text-xs text-slatey">Target role</p>
              <p className="mt-1 text-sm font-medium text-ink">{profile?.target_role || 'Not set'}</p>
            </div>
            <div className="rounded-xl bg-paper p-3">
              <p className="text-xs text-slatey">Saved projects</p>
              <p className="mt-1 text-sm font-medium text-ink">{projects.length}</p>
            </div>
            <div className="rounded-xl bg-paper p-3">
              <p className="text-xs text-slatey">Saved skills</p>
              <p className="mt-1 text-sm font-medium text-ink">{profile?.skills?.length ?? 0}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/resume/check')}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-accent px-6 py-3 text-sm font-medium text-white transition-all hover:scale-[1.02]"
          >
            <FileText className="h-4 w-4" />
            Check my information
          </button>
        </div>

        <p className="mt-8 text-xs text-slatey/70 max-w-xl">
          Eteral creates a resume draft from the information you provide. Always review it for accuracy before submitting it to an employer.
        </p>
      </div>
    </div>
  );
}