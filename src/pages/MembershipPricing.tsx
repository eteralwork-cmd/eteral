import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Check, Loader2, Moon, Sun,
  Target, Code2, MessageSquareText, Mic, LineChart, FolderKanban,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { track } from '@/Analytics';

const FEATURES = [
  { icon: Target, title: 'Learning goal points', text: 'Set learning goals and earn points, levels and streaks as you progress.' },
  { icon: Code2, title: 'Code challenges', text: 'Level-based coding challenges you can solve right in your browser.' },
  { icon: MessageSquareText, title: 'Practice questions', text: 'Questions that keep your thinking sharp and your learning on track.' },
  { icon: Mic, title: 'Voice clarity', text: 'Speak your answers out loud to track and improve how clearly you communicate.' },
  { icon: LineChart, title: 'Track your skills', text: 'See your skills grow over time, level by level.' },
  { icon: FolderKanban, title: 'Build your assets', text: 'Turn your work into projects and proof you can show, all from the Eteral dashboard.' },
];

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
    try {
      if (dark) {
        root.classList.add('dark');
        localStorage.setItem('eteral-theme', 'dark');
      } else {
        root.classList.remove('dark');
        localStorage.setItem('eteral-theme', 'light');
      }
    } catch {
      /* storage unavailable */
    }
  }, [dark]);

  return [dark, setDark] as const;
}

export default function FreeAccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [dark, setDark] = useDarkMode();
  const [authOpen, setAuthOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const fromPath = (location.state as { from?: string })?.from;

  useEffect(() => {
    if (user) {
      setAuthOpen(false);
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const openAuth = (m: 'signin' | 'signup') => {
    setMode(m);
    setAuthError(null);
    setAuthOpen(true);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthBusy(true);
    if (mode === 'signup') {
      const { data, error: err } = await supabase.auth.signUp({ email, password });
      if (err) { setAuthError(err.message); setAuthBusy(false); return; }
      track('sign_up', { method: 'email' });
      if (!data.session) {
        // email confirmation is on: no session until they confirm
        setAuthError('Check your email to confirm your account, then sign in.');
        setAuthBusy(false);
        return;
      }
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) { setAuthError(err.message); setAuthBusy(false); return; }
    }
    setAuthBusy(false);
    setAuthOpen(false);
    navigate('/dashboard', { replace: true });
  };

  const handleGoogle = async () => {
    setAuthError(null);
    setAuthBusy(true);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (err) { setAuthError(err.message); setAuthBusy(false); }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper dark:bg-[#18181c]">
        <Loader2 className="h-6 w-6 animate-spin text-slatey" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-paper dark:bg-[#18181c] transition-colors duration-200">
      <header className="fixed top-0 left-0 right-0 z-40 bg-paper/80 dark:bg-[#18181c]/80 backdrop-blur-xl border-b border-mist/60 dark:border-white/10 transition-colors">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-[1.15rem] font-medium tracking-tight text-ink dark:text-stone-100 lowercase">
            eteral
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDark(!dark)}
              aria-label="Toggle dark mode"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-mist dark:border-white/10 bg-white dark:bg-white/5 text-slatey dark:text-stone-300 hover:border-ink/20 dark:hover:border-white/20 transition-all"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => openAuth('signin')}
              className="text-sm font-medium text-slatey dark:text-stone-400 hover:text-ink dark:hover:text-stone-100 transition-colors"
            >
              Sign in
            </button>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-24">
        <div className="mx-auto max-w-5xl px-6">
          <button
            onClick={() => navigate(fromPath || '/')}
            className="text-sm font-medium text-slatey dark:text-stone-400 hover:text-ink dark:hover:text-stone-100 transition-colors"
          >
            <ArrowLeft className="inline h-4 w-4 mr-1" />
            Back to Eteral
          </button>

          <div className="mt-8 text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-coral">
              Membership
            </span>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink dark:text-stone-100 sm:text-4xl lg:text-5xl">
              Every Eteral feature, free for now
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slatey dark:text-stone-400">
              Eteral is a developing platform, so full membership is open to everyone at no cost while we learn what you need.
            </p>
          </div>

          {/* Plan card */}
          <div className="mx-auto mt-12 max-w-md rounded-3xl border border-ink/10 dark:border-white/15 bg-white dark:bg-white/5 p-8 shadow-[0_30px_80px_-30px_rgba(42,42,46,0.25)]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink dark:text-stone-100">Free membership</h2>
              <span className="rounded-full bg-mist dark:bg-white/10 px-3 py-1 text-xs font-medium text-ink dark:text-stone-100">
                Current plan
              </span>
            </div>
            <p className="mt-5 flex items-baseline gap-1.5">
              <span className="text-4xl font-semibold tracking-tight text-ink dark:text-stone-100">₹0</span>
              <span className="text-sm text-slatey dark:text-stone-400">/ month, no card needed</span>
            </p>
            <ul className="mt-6 space-y-3">
              {FEATURES.map(({ title }) => (
                <li key={title} className="flex items-start gap-3 text-sm text-ink dark:text-stone-200">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
                  {title}
                </li>
              ))}
            </ul>
            <button
              onClick={() => openAuth('signup')}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-accent px-7 py-3.5 text-sm font-medium text-white transition-all hover:scale-[1.02]"
            >
              Join for free
              <ArrowRight className="h-4 w-4" />
            </button>
            <p className="mt-4 text-center text-xs text-slatey dark:text-stone-500">
              Already a member?{' '}
              <button onClick={() => openAuth('signin')} className="font-medium text-ink dark:text-stone-200 hover:underline">
                Sign in
              </button>
            </p>
          </div>

          <div className="mt-16">
            <h2 className="text-center text-xl font-semibold tracking-tight text-ink dark:text-stone-100">
              What's included
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-mist dark:border-white/10 bg-white dark:bg-white/5 p-6"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mist dark:bg-white/10 text-ink dark:text-stone-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-ink dark:text-stone-100">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slatey dark:text-stone-400">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-14 max-w-xl rounded-2xl border border-dashed border-mist dark:border-white/10 px-6 py-5 text-center">
            <p className="text-sm leading-relaxed text-slatey dark:text-stone-400">
              We'd love your feedback to make Eteral better for your needs.{' '}
              <Link to="/contact-eteral" className="font-medium text-ink dark:text-stone-100 hover:underline">
                Share your feedback
              </Link>
            </p>
          </div>
        </div>
      </main>

      {authOpen && !user && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/30 dark:bg-black/50 backdrop-blur-sm" onClick={() => setAuthOpen(false)} />
          <div className="relative w-full max-w-md rounded-3xl border border-mist dark:border-white/10 bg-paper dark:bg-[#22222a] p-7 shadow-[0_30px_80px_-20px_rgba(42,42,46,0.35)]">
            <h3 className="text-xl font-semibold text-ink dark:text-stone-100">
              {mode === 'signup' ? 'Create your free account' : 'Welcome back'}
            </h3>
            <p className="mt-2 text-sm text-slatey dark:text-stone-400">
              {mode === 'signup' ? 'Sign up to become a free Eteral member.' : 'Sign in to open your dashboard.'}
            </p>
            <button
              type="button"
              onClick={handleGoogle}
              disabled={authBusy}
              className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl border border-mist dark:border-white/10 bg-white dark:bg-white/5 px-5 py-3 text-sm font-medium text-ink dark:text-stone-100 transition-all hover:border-ink/20 dark:hover:border-white/20 disabled:opacity-60"
            >
              <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
                <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z" />
                <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
              </svg>
              Continue with Google
            </button>
            <div className="my-4 flex items-center gap-3 text-xs text-slatey dark:text-stone-500">
              <span className="h-px flex-1 bg-mist dark:bg-white/10" />
              or
              <span className="h-px flex-1 bg-mist dark:bg-white/10" />
            </div>
            <form onSubmit={handleAuth} className="flex flex-col gap-3">
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