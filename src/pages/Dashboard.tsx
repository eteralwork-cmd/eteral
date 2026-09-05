import { Link } from 'react-router-dom';
import { FolderKanban, Briefcase, FileText, Settings, ArrowRight, Sparkles } from 'lucide-react';
import { useMembership } from '@/lib/membership';

const TOOLS = [
  {
    title: 'Project Tracker',
    desc: 'Track projects you\'re building to strengthen your resume and portfolio.',
    path: '/projects',
    icon: FolderKanban,
  },
  {
    title: 'Application Tracker',
    desc: 'Keep tabs on every job application — from saved to offered.',
    path: '/applications',
    icon: Briefcase,
  },
  {
    title: 'Resume Resources',
    desc: 'ATS-friendly templates, checklists, and resume-building guidance.',
    path: '/standard/resume',
    icon: FileText,
  },
];

export default function Dashboard() {
  const { membership, status, current_period_end } = useMembership() as ReturnType<typeof useMembership> & {
    current_period_end?: string;
  };

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-coral" />
          <span className="text-xs font-semibold uppercase tracking-widest text-coral">
            Standard Dashboard
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
          Welcome to your dashboard
        </h1>
        <p className="mt-3 text-base text-slatey max-w-xl">
          Everything you need to land the role and grow in it — all in one place.
        </p>

        {membership?.current_period_end && (
          <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-mist bg-white px-4 py-2.5 text-xs text-slatey">
            <span className="font-medium text-ink">Status: {status.replace(/_/g, ' ')}</span>
            {membership.cancel_at_period_end ? (
              <span className="text-slatey">· Cancels at period end</span>
            ) : (
              <span className="text-slatey">· Renews {new Date(membership.current_period_end).toLocaleDateString()}</span>
            )}
          </div>
        )}

        {/* Tools grid */}
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => (
            <Link
              key={tool.path}
              to={tool.path}
              className="group rounded-2xl border border-mist bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-ink/15 hover:shadow-[0_20px_40px_-20px_rgba(42,42,46,0.18)]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-accent text-white">
                <tool.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-semibold text-ink">{tool.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slatey">{tool.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-ink transition-colors group-hover:text-coral">
                Open
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>

        {/* Manage subscription */}
        <div className="mt-12 rounded-2xl border border-mist bg-white/60 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-base font-semibold text-ink flex items-center gap-2">
                <Settings className="h-4 w-4 text-slatey" />
                Subscription
              </h3>
              <p className="mt-1 text-sm text-slatey">
                Manage your payment method, billing info, or cancel your subscription.
              </p>
            </div>
            <Link
              to="/membership"
              className="rounded-full border border-mist bg-white px-5 py-2.5 text-sm font-medium text-ink transition-all hover:border-ink/20"
            >
              Manage membership
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
