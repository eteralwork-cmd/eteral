import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { fetchResumeProfile, fetchProjectsForResume, type ResumeProfile, type ProjectRow } from '../lib/resume-data';

export default function ResumeCheck() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ResumeProfile | null>(null);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [p, proj] = await Promise.all([fetchResumeProfile(), fetchProjectsForResume()]);
      setProfile(p);
      setProjects(proj);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <Loader2 className="h-6 w-6 animate-spin text-slatey" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link to="/resume" className="inline-flex items-center gap-1.5 text-sm font-medium text-slatey hover:text-ink transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Boost Your Resume
        </Link>

        <h1 className="mt-6 text-2xl font-semibold text-ink">Here's what we have</h1>
        <p className="mt-2 text-sm text-slatey">Review before we ask about anything that's missing.</p>

        <div className="mt-6 space-y-4">
          <Section title="Contact">
            <p className="text-sm text-ink">{profile?.basics?.name || 'Name not set'}</p>
            <p className="text-sm text-slatey">{user?.email}</p>
          </Section>

          <Section title="Career goal">
            <p className="text-sm text-ink">{profile?.target_role || 'Not set yet'}</p>
          </Section>

          <Section title={`Projects (${projects.length})`}>
            {projects.length === 0 ? (
              <p className="text-sm text-slatey">No projects saved yet.</p>
            ) : (
              <ul className="space-y-1">
                {projects.map((p) => (
                  <li key={p.id} className="text-sm text-ink">{p.title}</li>
                ))}
              </ul>
            )}
          </Section>

          <Section title={`Skills (${profile?.skills?.length ?? 0})`}>
            {(profile?.skills?.length ?? 0) === 0 ? (
              <p className="text-sm text-slatey">No skills saved yet.</p>
            ) : (
              <p className="text-sm text-ink">{profile!.skills.join(', ')}</p>
            )}
          </Section>
        </div>

        <div className="mt-8 rounded-xl border border-dashed border-mist bg-white/50 p-5 text-sm text-slatey">
          The guided question flow for filling in gaps, and resume generation, are coming in the next build step.
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-mist bg-white p-5">
      <h3 className="text-sm font-semibold text-ink mb-2">{title}</h3>
      {children}
    </div>
  );
}