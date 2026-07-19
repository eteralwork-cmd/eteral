import { useEffect, useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Loader2, Check } from 'lucide-react';
import { supabase } from './lib/supabase';
import { useAuth } from './lib/auth';

type Mode = 'signin' | 'signup';

type Props = {
  open: boolean;
  onClose: () => void;
  initialMode?: Mode;
  title?: string;
  subtitle?: string;
  onSuccess?: () => void;
};

function GoogleIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

export default function AuthModal({
  open,
  onClose,
  initialMode = 'signup',
  title,
  subtitle,
  onSuccess,
}: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setError(null);
      setEmail('');
      setPassword('');
      setName('');
    }
  }, [open, initialMode]);

  useEffect(() => {
    if (open && user) {
      onSuccess?.();
      onClose();
    }
  }, [user, open, onSuccess, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const heading =
    title ?? (mode === 'signup' ? 'Create your free account' : 'Welcome back');
  const subheading =
    subtitle ??
    (mode === 'signup'
      ? 'Sign up to unlock your quiz result and download free resources.'
      : 'Sign in to access your freebies and saved recommendations.');

  const handleGoogle = async () => {
    setError(null);
    setGoogleBusy(true);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (err) {
      setError(err.message);
      setGoogleBusy(false);
    }
    // success path: OAuth redirect happens, modal will close on return
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);

    if (mode === 'signup') {
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { data: name ? { full_name: name } : undefined },
      });
      if (err) {
        setError(err.message);
        setBusy(false);
        return;
      }
      // email confirmation is off; session is created immediately
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (err) {
        setError(err.message);
        setBusy(false);
        return;
      }
    }
    setBusy(false);
    // auth state change will trigger onSuccess via effect
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/30 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-3xl border border-mist bg-paper p-7 shadow-[0_30px_80px_-20px_rgba(42,42,46,0.35)] animate-fadeUp">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-slatey transition-colors hover:text-ink"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="pr-6">
          <h3 className="text-xl font-semibold text-ink">{heading}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slatey">{subheading}</p>
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={googleBusy}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-mist bg-white px-4 py-3 text-sm font-medium text-ink transition-all duration-200 hover:border-ink/20 hover:bg-white disabled:opacity-60"
        >
          {googleBusy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          Continue with Google
        </button>

        {/* divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-mist" />
          <span className="text-xs uppercase tracking-widest2 text-slatey">
            or
          </span>
          <div className="h-px flex-1 bg-mist" />
        </div>

        {/* Email form */}
        <form onSubmit={handleEmail} className="flex flex-col gap-3">
          {mode === 'signup' && (
            <div className="flex items-center gap-2 rounded-xl border border-mist bg-white px-3 py-2.5 focus-within:border-ink/30">
              <UserIcon className="h-4 w-4 text-slatey" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                className="flex-1 bg-transparent text-sm text-ink placeholder:text-slatey/60 focus:outline-none"
              />
            </div>
          )}
          <div className="flex items-center gap-2 rounded-xl border border-mist bg-white px-3 py-2.5 focus-within:border-ink/30">
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
          <div className="flex items-center gap-2 rounded-xl border border-mist bg-white px-3 py-2.5 focus-within:border-ink/30">
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

          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-accent px-5 py-3 text-sm font-medium text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Check className="h-4 w-4" />
                {mode === 'signup' ? 'Create account' : 'Sign in'}
              </>
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slatey">
          {mode === 'signup' ? 'Already have an account?' : "Don't have one yet?"}{' '}
          <button
            onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
            className="font-medium text-ink underline-offset-2 hover:underline"
          >
            {mode === 'signup' ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
}
