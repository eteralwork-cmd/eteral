import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Loader2, Mail, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fromPath = (location.state as { from?: string })?.from || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    if (mode === 'signup') {
      const { error: err } = await supabase.auth.signUp({ email, password });
      if (err) { setError(err.message); setBusy(false); return; }
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) { setError(err.message); setBusy(false); return; }
    }
    setBusy(false);
    navigate(fromPath, { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slatey hover:text-ink transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Eteral
        </Link>

        <div className="rounded-3xl border border-mist bg-white p-8 shadow-[0_20px_60px_-20px_rgba(42,42,46,0.15)]">
          <h1 className="text-2xl font-semibold text-ink">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-2 text-sm text-slatey">
            {mode === 'signin'
              ? 'Sign in to access your dashboard and resources.'
              : 'Create a free account to get started with Eteral.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 rounded-xl border border-mist bg-paper px-3 py-3 focus-within:border-ink/30">
              <Mail className="h-4 w-4 text-slatey" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="flex-1 bg-transparent text-sm text-ink placeholder:text-slatey/60 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-mist bg-paper px-3 py-3 focus-within:border-ink/30">
              <Lock className="h-4 w-4 text-slatey" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 6 chars)"
                className="flex-1 bg-transparent text-sm text-ink placeholder:text-slatey/60 focus:outline-none"
              />
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-gradient-accent px-5 py-3.5 text-sm font-medium text-white transition-all hover:scale-[1.02] disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slatey">
            {mode === 'signin' ? "Don't have an account?" : 'Already have one?'}{' '}
            <button
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="font-medium text-ink hover:underline"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
