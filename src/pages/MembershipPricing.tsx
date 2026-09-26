import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Check, X, Loader2, Sparkles, Lock, Moon, Sun,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useMembership } from '@/lib/membership';
import { startCheckout, cancelSubscription } from '@/lib/razorpay-client';

// ─── Plan feature definitions ────────────────────────────────────────────────

type FeatureRow = {
  label: string;
  free: boolean | string;
  standard: boolean | string;
  premium: boolean | string;
};

const FEATURES: FeatureRow[] = [
  { label: 'Eteral blog & articles',           free: true,        standard: true,        premium: true },
  { label: 'Career Readiness Quiz',            free: true,        standard: true,        premium: true },
  { label: 'Free resources & downloads',       free: '1/month',   standard: 'Unlimited', premium: 'Unlimited' },
  { label: 'All public website resources',     free: true,        standard: true,        premium: true },
  { label: 'Resume resources & ATS templates', free: false,       standard: true,        premium: true },
  { label: 'Resume-building guidance',         free: false,       standard: true,        premium: true },
  { label: 'Daily career readiness questions', free: false,       standard: true,        premium: true },
  { label: 'Project tracker',                  free: false,       standard: true,        premium: true },
  { label: 'Job & application tracker',        free: false,       standard: true,        premium: true },
  { label: 'Member dashboard',                 free: false,       standard: true,        premium: true },
  { label: 'Standard-marked resources',        free: false,       standard: true,        premium: true },
  { label: 'AI career clarity coach',          free: false,       standard: false,       premium: true },
  { label: 'Interview prep & mock Q&A',        free: false,       standard: false,       premium: true },
  { label: 'LinkedIn & portfolio review',      free: false,       standard: false,       premium: true },
  { label: 'Salary negotiation playbook',      free: false,       standard: false,       premium: true },
  { label: '1-on-1 mentorship sessions',       free: false,       standard: false,       premium: 'Monthly' },
  { label: 'Priority support',                 free: false,       standard: false,       premium: true },
];

// ─── Dark mode hook ───────────────────────────────────────────────────────────

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem('eteral-theme') === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('eteral-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('eteral-theme', 'light');
    }
  }, [dark]);

  return [dark, setDark] as const;
}

// ─── Cell component ───────────────────────────────────────────────────────────

function Cell({ value }: { value: boolean | string }) {
  if (value === false) return <X className="h-4 w-4 text-slatey/40 mx-auto" />;
  if (value === true) return <Check className="h-4 w-4 text-coral mx-auto" />;
  return <span className="text-xs font-medium text-ink dark:text-stone-200">{value}</span>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MembershipPricingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { isStandard, plan, status, loading: membershipLoading, refresh } = useMembership();
  const [dark, setDark] = useDarkMode();
  const [authOpen, setAuthOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const fromPath = (location.state as { from?: string })?.from;

  useEffect(() => {
    if (user) setAuthOpen(false);
  }, [user]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthBusy(true);
    if (mode === 'signup') {
      const { error: err } = await supabase.auth.signUp({ email, password });
      if (err) { setAuthError(err.message); setAuthBusy(false); return; }
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) { setAuthError(err.message); setAuthBusy(false); return; }
    }
    setAuthBusy(false);
  };

  const handleCheckout = async () => {
    if (!user) { setAuthOpen(true); return; }
    setError(null);
    setCheckoutLoading(true);
    try {
      await startCheckout(navigate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handlePortal = async () => {
    const confirmed = window.confirm(
      "Cancel your membership? You'll keep access until the end of your current billing period."
    );
    if (!confirmed) return;
    setError(null);
    setPortalLoading(true);
    try {
      await cancelSubscription();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not cancel membership.');
    } finally {
      setPortalLoading(false);
    }
  };

  if (authLoading || membershipLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper dark:bg-[#18181c]">
        <Loader2 className="h-6 w-6 animate-spin text-slatey" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-paper dark:bg-[#18181c] transition-colors duration-200">

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-paper/80 dark:bg-[#18181c]/80 backdrop-blur-xl border-b border-mist/60 dark:border-white/10 transition-colors">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-[1.15rem] font-medium tracking-tight text-ink dark:text-stone-100 lowercase">
            eteral
          </Link>
          <div className="flex items-center gap-4">
            {/* Dark mode toggle */}
            <button
              onClick={() => setDark(!dark)}
              aria-label="Toggle dark mode"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-mist dark:border-white/10 bg-white dark:bg-white/5 text-slatey dark:text-stone-300 hover:border-ink/20 dark:hover:border-white/20 transition-all"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {user ? (
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-sm font-medium text-slatey dark:text-stone-400 hover:text-ink dark:hover:text-stone-100 transition-colors"
              >
                Sign out
              </button>
            ) : (
              <button
                onClick={() => { setMode('signin'); setAuthOpen(true); }}
                className="text-sm font-medium text-slatey dark:text-stone-400 hover:text-ink dark:hover:text-stone-100 transition-colors"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="pt-32 pb-24">
        <div className="mx-auto max-w-6xl px-6">

          <button
            onClick={() => navigate(fromPath || '/')}
            className="text-sm font-medium text-slatey dark:text-stone-400 hover:text-ink dark:hover:text-stone-100 transition-colors"
          >
            <ArrowLeft className="inline h-4 w-4 mr-1" />
            Back to Eteral
          </button>

          {/* Heading */}
          <div className="mt-8 text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-coral">
              Membership
            </span>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink dark:text-stone-100 sm:text-4xl lg:text-5xl">
              Choose your plan
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slatey dark:text-stone-400">
              Start free, upgrade when you're ready. Cancel anytime.
            </p>
          </div>

          {error && (
            <div className="mx-auto mt-8 max-w-md rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-5 py-4 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* ── Plan cards ── */}
          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">

            {/* Free */}
            <div className="rounded-2xl border border-mist dark:border-white/10 bg-white dark:bg-white/5 p-8 flex flex-col">
              <div className="h-6" /> {/* spacer to align with "Most popular" badge */}
              <h3 className="text-lg font-semibold text-ink dark:text-stone-100">Free</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-semibold text-ink dark:text-stone-100">₹0</span>
                <span className="text-sm text-slatey dark:text-stone-400">/month</span>
              </div>
              <p className="mt-3 text-sm text-slatey dark:text-stone-400 leading-relaxed">
                Explore Eteral and build your career foundations at no cost.
              </p>

              <ul className="mt-6 space-y-2.5 flex-1">
                {FEATURES.filter(f => f.free !== false).map(f => (
                  <li key={f.label} className="flex items-start gap-2.5 text-sm text-ink dark:text-stone-200">
                    <Check className="h-4 w-4 text-coral mt-0.5 shrink-0" />
                    <span>{f.label}{typeof f.free === 'string' ? ` — ${f.free}` : ''}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {user ? (
                  <div className="rounded-xl bg-mist/40 dark:bg-white/5 px-5 py-3.5 text-center text-sm font-medium text-slatey dark:text-stone-400">
                    {plan === 'free' ? 'Your current plan' : 'Included in your plan'}
                  </div>
                ) : (
                  <button
                    onClick={() => { setMode('signup'); setAuthOpen(true); }}
                    className="w-full rounded-full border border-mist dark:border-white/10 bg-white dark:bg-white/5 px-6 py-3.5 text-sm font-medium text-ink dark:text-stone-100 transition-all hover:border-ink/20 dark:hover:border-white/20"
                  >
                    Create free account
                  </button>
                )}
              </div>
            </div>

            {/* Standard */}
            <div className="relative rounded-2xl border-2 border-coral/50 dark:border-coral/30 bg-white dark:bg-white/5 p-8 flex flex-col shadow-[0_20px_60px_-20px_rgba(245,163,160,0.3)]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-accent px-4 py-1.5 text-xs font-semibold text-white shadow-sm">
                  <Sparkles className="h-3 w-3" />
                  Most popular
                </span>
              </div>

              <div className="h-2" />
              <h3 className="text-lg font-semibold text-ink dark:text-stone-100">Standard</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-semibold text-ink dark:text-stone-100">₹499</span>
                <span className="text-sm text-slatey dark:text-stone-400">/month</span>
              </div>
              <p className="mt-3 text-sm text-slatey dark:text-stone-400 leading-relaxed">
                All the tools you need to land your next role and grow your career.
              </p>

              <ul className="mt-6 space-y-2.5 flex-1">
                {FEATURES.filter(f => f.standard !== false && f.free === false).map(f => (
                  <li key={f.label} className="flex items-start gap-2.5 text-sm text-ink dark:text-stone-200">
                    <Check className="h-4 w-4 text-coral mt-0.5 shrink-0" />
                    <span>{f.label}{typeof f.standard === 'string' ? ` — ${f.standard}` : ''}</span>
                  </li>
                ))}
                <li className="text-xs text-slatey dark:text-stone-500 pt-1">+ Everything in Free</li>
              </ul>

              <div className="mt-8">
                {isStandard ? (
                  <div className="space-y-3">
                    <div className="rounded-xl bg-gradient-accent/10 dark:bg-coral/10 px-5 py-3.5 text-center text-sm font-semibold text-ink dark:text-stone-100">
                      You're a Standard Member
                    </div>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="w-full rounded-full bg-gradient-accent px-6 py-3.5 text-sm font-medium text-white transition-all hover:scale-[1.02]"
                    >
                      Go to Dashboard
                      <ArrowRight className="inline h-4 w-4 ml-1" />
                    </button>
                    <button
                      onClick={handlePortal}
                      disabled={portalLoading}
                      className="w-full rounded-full border border-mist dark:border-white/10 bg-white dark:bg-white/5 px-6 py-3 text-xs font-medium text-slatey dark:text-stone-400 transition-all hover:border-ink/20 disabled:opacity-60"
                    >
                      {portalLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Manage subscription'}
                    </button>
                  </div>
                ) : user ? (
                  <button
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                    className="w-full rounded-full bg-gradient-accent px-6 py-3.5 text-sm font-medium text-white transition-all hover:scale-[1.02] disabled:opacity-60"
                  >
                    {checkoutLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    ) : (
                      <>Start Standard Membership <ArrowRight className="inline h-4 w-4 ml-1" /></>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => { setMode('signup'); setAuthOpen(true); }}
                    className="w-full rounded-full bg-gradient-accent px-6 py-3.5 text-sm font-medium text-white transition-all hover:scale-[1.02]"
                  >
                    Sign up to join Standard
                    <ArrowRight className="inline h-4 w-4 ml-1" />
                  </button>
                )}
              </div>
            </div>

            {/* Premium — coming soon */}
            <div className="relative rounded-2xl border border-dashed border-mist dark:border-white/10 bg-white/60 dark:bg-white/3 p-8 flex flex-col">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-mist dark:border-white/10 bg-white dark:bg-[#18181c] px-4 py-1.5 text-xs font-semibold text-slatey dark:text-stone-400">
                  <Lock className="h-3 w-3" />
                  Coming soon
                </span>
              </div>

              <div className="h-2" />
              <h3 className="text-lg font-semibold text-ink dark:text-stone-100">Premium</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-semibold text-slatey dark:text-stone-500">₹?</span>
                <span className="text-sm text-slatey dark:text-stone-500">/month</span>
              </div>
              <p className="mt-3 text-sm text-slatey dark:text-stone-400 leading-relaxed">
                Deep, personalised career support for those serious about accelerating fast.
              </p>

              <ul className="mt-6 space-y-2.5 flex-1">
                {FEATURES.filter(f => f.premium !== false && f.standard === false).map(f => (
                  <li key={f.label} className="flex items-start gap-2.5 text-sm text-slatey dark:text-stone-400">
                    <Lock className="h-3.5 w-3.5 text-slatey/40 dark:text-stone-600 mt-0.5 shrink-0" />
                    <span>{f.label}{typeof f.premium === 'string' ? ` — ${f.premium}` : ''}</span>
                  </li>
                ))}
                <li className="text-xs text-slatey/60 dark:text-stone-600 pt-1">+ Everything in Standard</li>
              </ul>

              <div className="mt-8">
                <div className="w-full rounded-full border border-dashed border-mist dark:border-white/10 px-6 py-3.5 text-center text-sm font-medium text-slatey dark:text-stone-500">
                  Not available yet
                </div>
              </div>
            </div>
          </div>

          {/* ── Comparison table ── */}
          <div className="mt-20">
            <h2 className="text-center text-xl font-semibold text-ink dark:text-stone-100 mb-8">
              Full plan comparison
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-mist dark:border-white/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-mist dark:border-white/10">
                    <th className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider text-slatey dark:text-stone-400 w-1/2">
                      Feature
                    </th>
                    <th className="py-4 px-4 text-center text-xs font-semibold uppercase tracking-wider text-slatey dark:text-stone-400">
                      Free
                    </th>
                    <th className="py-4 px-4 text-center text-xs font-semibold uppercase tracking-wider text-coral">
                      Standard
                    </th>
                    <th className="py-4 px-4 text-center text-xs font-semibold uppercase tracking-wider text-slatey dark:text-stone-400">
                      Premium
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {FEATURES.map((row, i) => (
                    <tr
                      key={row.label}
                      className={`border-b border-mist/50 dark:border-white/5 last:border-0 ${i % 2 === 0 ? 'bg-transparent' : 'bg-mist/20 dark:bg-white/[0.02]'}`}
                    >
                      <td className="py-3.5 px-6 text-ink dark:text-stone-300">{row.label}</td>
                      <td className="py-3.5 px-4 text-center"><Cell value={row.free} /></td>
                      <td className="py-3.5 px-4 text-center bg-coral/5 dark:bg-coral/5"><Cell value={row.standard} /></td>
                      <td className="py-3.5 px-4 text-center"><Cell value={row.premium} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Status notice */}
          {user && !isStandard && plan === 'standard' && !['active', 'trialing'].includes(status) && (
            <div className="mx-auto mt-10 max-w-md rounded-xl border border-mist dark:border-white/10 bg-white dark:bg-white/5 px-5 py-4 text-center text-sm text-slatey dark:text-stone-400">
              Your Standard membership is <span className="font-medium text-ink dark:text-stone-100">{status.replace(/_/g, ' ')}</span>.
              {status === 'past_due' && ' Please update your payment method.'}
              {status === 'canceled' && ' You can rejoin anytime.'}
            </div>
          )}
        </div>
      </main>

      {/* Auth Modal */}
      {authOpen && !user && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/30 dark:bg-black/50 backdrop-blur-sm" onClick={() => setAuthOpen(false)} />
          <div className="relative w-full max-w-md rounded-3xl border border-mist dark:border-white/10 bg-paper dark:bg-[#22222a] p-7 shadow-[0_30px_80px_-20px_rgba(42,42,46,0.35)]">
            <h3 className="text-xl font-semibold text-ink dark:text-stone-100">
              {mode === 'signup' ? 'Create your free account' : 'Welcome back'}
            </h3>
            <p className="mt-2 text-sm text-slatey dark:text-stone-400">
              {mode === 'signup' ? 'Sign up to start your Standard membership.' : 'Sign in to manage your membership.'}
            </p>
            <form onSubmit={handleAuth} className="mt-5 flex flex-col gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="rounded-xl border border-mist dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-sm text-ink dark:text-stone-100 placeholder:text-slatey/60 focus:outline-none focus:border-ink/30 dark:focus:border-white/20"
              />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 6 chars)"
                className="rounded-xl border border-mist dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-sm text-ink dark:text-stone-100 placeholder:text-slatey/60 focus:outline-none focus:border-ink/30 dark:focus:border-white/20"
              />
              {authError && <p className="text-xs text-red-500">{authError}</p>}
              <button
                type="submit"
                disabled={authBusy}
                className="rounded-xl bg-gradient-accent px-5 py-3 text-sm font-medium text-white transition-all hover:scale-[1.02] disabled:opacity-60"
              >
                {authBusy ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : mode === 'signup' ? 'Create account' : 'Sign in'}
              </button>
            </form>
            <p className="mt-5 text-center text-xs text-slatey dark:text-stone-500">
              {mode === 'signup' ? 'Already have an account?' : "Don't have one yet?"}{' '}
              <button
                onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
                className="font-medium text-ink dark:text-stone-200 hover:underline"
              >
                {mode === 'signup' ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
