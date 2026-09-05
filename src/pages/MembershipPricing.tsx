import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useMembership } from '@/lib/membership';
import { createCheckoutSession, createPortalSession } from '@/lib/stripe-client';

const FREE_FEATURES = [
  'Full access to Eteral blog & articles',
  '1 freebie per month',
  'Career Readiness Quiz',
  'All public website resources',
];

const STANDARD_FEATURES = [
  'Resume resources & ATS templates',
  'Resume-building guidance',
  'Stage-specific daily career questions',
  'Project tracker',
  'Job / application tracker',
  'Standard member dashboard',
  'All Standard-marked resources',
];

export default function MembershipPricingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { isStandard, plan, status, loading: membershipLoading } = useMembership();
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
    if (!user) {
      setAuthOpen(true);
      return;
    }
    setError(null);
    setCheckoutLoading(true);
    try {
      const { url } = await createCheckoutSession();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setCheckoutLoading(false);
    }
  };

  const handlePortal = async () => {
    setError(null);
    setPortalLoading(true);
    try {
      const { url } = await createPortalSession();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open billing portal.');
      setPortalLoading(false);
    }
  };

  if (authLoading || membershipLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <Loader2 className="h-6 w-6 animate-spin text-slatey" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-paper">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-paper/80 backdrop-blur-xl border-b border-mist/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-[1.15rem] font-medium tracking-tight text-ink lowercase">
            eteral
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-sm font-medium text-slatey hover:text-ink transition-colors"
              >
                Sign out
              </button>
            ) : (
              <button
                onClick={() => { setMode('signin'); setAuthOpen(true); }}
                className="text-sm font-medium text-slatey hover:text-ink transition-colors"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="pt-32 pb-24">
        <div className="mx-auto max-w-5xl px-6">
          <button
            onClick={() => navigate(fromPath || '/')}
            className="text-sm font-medium text-slatey hover:text-ink transition-colors"
          >
            <ArrowLeft className="inline h-4 w-4 mr-1" />
            Back to Eteral
          </button>

          <div className="mt-8 text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-coral">
              Membership
            </span>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-5xl">
              Choose your plan
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slatey">
              Start free, upgrade when you're ready. Cancel anytime.
            </p>
          </div>

          {error && (
            <div className="mx-auto mt-8 max-w-md rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Pricing cards */}
          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 max-w-3xl mx-auto">

            {/* Free plan */}
            <div className="rounded-2xl border border-mist bg-white p-8 flex flex-col">
              <h3 className="text-lg font-semibold text-ink">Free</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-semibold text-ink">$0</span>
                <span className="text-sm text-slatey">/month</span>
              </div>
              <p className="mt-3 text-sm text-slatey">Get started with Eteral for free.</p>
              <ul className="mt-6 space-y-3 flex-1">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-ink">
                    <Check className="h-4 w-4 text-coral mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                {user ? (
                  <div className="rounded-xl bg-mist/40 px-5 py-3.5 text-center text-sm font-medium text-slatey">
                    {plan === 'free' ? 'Your current plan' : 'You have a paid plan'}
                  </div>
                ) : (
                  <button
                    onClick={() => { setMode('signup'); setAuthOpen(true); }}
                    className="w-full rounded-full border border-mist bg-white px-6 py-3.5 text-sm font-medium text-ink transition-all hover:border-ink/20"
                  >
                    Create free account
                  </button>
                )}
              </div>
            </div>

            {/* Standard plan */}
            <div className="relative rounded-2xl border-2 border-coral/40 bg-white p-8 flex flex-col shadow-[0_20px_60px_-20px_rgba(245,163,160,0.25)]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-accent px-4 py-1.5 text-xs font-semibold text-white">
                  <Sparkles className="h-3 w-3" />
                  Most popular
                </span>
              </div>
              <h3 className="text-lg font-semibold text-ink">Standard</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-semibold text-ink">$6</span>
                <span className="text-sm text-slatey">/month</span>
              </div>
              <p className="mt-3 text-sm text-slatey">Everything you need to land and grow in the role.</p>
              <ul className="mt-6 space-y-3 flex-1">
                {STANDARD_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-ink">
                    <Check className="h-4 w-4 text-coral mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                {isStandard ? (
                  <div className="space-y-3">
                    <div className="rounded-xl bg-gradient-accent/10 px-5 py-3.5 text-center text-sm font-semibold text-ink">
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
                      className="w-full rounded-full border border-mist bg-white px-6 py-3 text-xs font-medium text-slatey transition-all hover:border-ink/20 disabled:opacity-60"
                    >
                      {portalLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      ) : (
                        'Manage subscription'
                      )}
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
                      <>
                        Start Standard Membership
                        <ArrowRight className="inline h-4 w-4 ml-1" />
                      </>
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
          </div>

          {/* Premium (coming soon) */}
          <div className="mt-8 mx-auto max-w-3xl">
            <div className="rounded-2xl border border-dashed border-mist bg-white/40 p-8 text-center">
              <div className="flex items-center justify-center gap-2">
                <Lock className="h-4 w-4 text-slatey" />
                <h3 className="text-lg font-semibold text-slatey">Premium</h3>
              </div>
              <p className="mt-2 text-sm text-slatey">Coming soon — not available yet.</p>
            </div>
          </div>

          {user && !isStandard && plan === 'standard' && !['active', 'trialing'].includes(status) && (
            <div className="mx-auto mt-8 max-w-md rounded-xl border border-mist bg-white px-5 py-4 text-center text-sm text-slatey">
              Your Standard membership is <span className="font-medium text-ink">{status.replace(/_/g, ' ')}</span>.
              {status === 'past_due' && ' Please update your payment method in the billing portal.'}
              {status === 'canceled' && ' You can rejoin anytime.'}
            </div>
          )}
        </div>
      </main>

      {/* Auth Modal (inline) */}
      {authOpen && !user && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={() => setAuthOpen(false)} />
          <div className="relative w-full max-w-md rounded-3xl border border-mist bg-paper p-7 shadow-[0_30px_80px_-20px_rgba(42,42,46,0.35)]">
            <h3 className="text-xl font-semibold text-ink">
              {mode === 'signup' ? 'Create your free account' : 'Welcome back'}
            </h3>
            <p className="mt-2 text-sm text-slatey">
              {mode === 'signup'
                ? 'Sign up to start your Standard membership.'
                : 'Sign in to manage your membership.'}
            </p>
            <form onSubmit={handleAuth} className="mt-5 flex flex-col gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="rounded-xl border border-mist bg-white px-4 py-3 text-sm text-ink placeholder:text-slatey/60 focus:outline-none focus:border-ink/30"
              />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 6 chars)"
                className="rounded-xl border border-mist bg-white px-4 py-3 text-sm text-ink placeholder:text-slatey/60 focus:outline-none focus:border-ink/30"
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
            <p className="mt-5 text-center text-xs text-slatey">
              {mode === 'signup' ? 'Already have an account?' : "Don't have one yet?"}{' '}
              <button
                onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
                className="font-medium text-ink hover:underline"
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
