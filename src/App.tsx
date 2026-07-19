import { useEffect, useRef, useState } from 'react';
import {
  X,
  Download,
  ArrowRight,
  Check,
  Menu,
  Mail,
  Twitter,
  Instagram,
  Youtube,
  Sparkles,
  BookOpen,
  Target,
  Wallet,
  ClipboardList,
  Clock,
  TrendingUp,
  Loader2,
  Lock,
} from 'lucide-react';
import { supabase } from './lib/supabase';
import { useAuth } from './lib/auth';
import AuthModal from './AuthModal';

/* ------------------------------------------------------------------ */
/*  Eteral — Landing Page                                             */
/*  Placeholder sections are clearly marked with ⤓ REPLACE comments.  */
/* ------------------------------------------------------------------ */

/* Shared scroll-reveal hook */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

/* ------------------------------------------------------------------ */
/*  Logo mark — abstract interlocking "e"                             */
/* ------------------------------------------------------------------ */
function LogoMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="coralG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F5A3A0" />
          <stop offset="100%" stopColor="#EF8A86" />
        </linearGradient>
        <linearGradient id="skyG" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#9CC4F0" />
          <stop offset="100%" stopColor="#7FB0EC" />
        </linearGradient>
      </defs>
      <path
        d="M28 12.5C24.5 9.5 19 9 14.5 11.5 9.5 14.3 8 20.5 10.5 25.5 13 30.5 19 32.5 24.5 30.5 27 29.5 29 28 30 26"
        stroke="url(#coralG)"
        strokeWidth="3.4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M13 20.5H28"
        stroke="url(#skyG)"
        strokeWidth="3.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function Logo({ onNav }: { onNav: (id: string) => void }) {
  return (
    <button
      onClick={() => onNav('home')}
      className="flex items-center gap-2.5 group"
      aria-label="Eteral home"
    >
      <LogoMark className="h-8 w-8 transition-transform duration-500 group-hover:rotate-[8deg]" />
      <div className="flex flex-col items-start leading-none">
        <span className="text-[1.15rem] font-medium tracking-tight text-ink lowercase">
          etral
        </span>
        <span className="text-[0.5rem] font-medium tracking-widest2 text-slatey uppercase mt-0.5">
          Digital Products
        </span>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Buttons                                                            */
/* ------------------------------------------------------------------ */
function PrimaryButton({
  children,
  onClick,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative inline-flex items-center justify-center gap-2 rounded-full bg-gradient-accent px-7 py-3.5 text-sm font-medium text-white shadow-[0_8px_24px_-8px_rgba(245,163,160,0.5)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_12px_32px_-8px_rgba(156,196,240,0.6)] active:scale-100 ${className}`}
    >
      {children}
    </button>
  );
}

function GhostButton({
  children,
  onClick,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`group inline-flex items-center justify-center gap-2 rounded-full border border-mist bg-white/40 px-7 py-3.5 text-sm font-medium text-ink backdrop-blur-sm transition-all duration-300 hover:border-ink/30 hover:bg-white ${className}`}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Header                                                             */
/* ------------------------------------------------------------------ */
function Header({
  onNav,
  onAuth,
  user,
  onSignOut,
}: {
  onNav: (id: string) => void;
  onAuth: (mode: 'signin' | 'signup') => void;
  user: { email?: string } | null;
  onSignOut: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const nav = [
    { label: 'Home', id: 'home' },
    { label: 'Freebies', id: 'freebies' },
    { label: 'Shop', id: 'shop' },
    { label: 'Contact', id: 'contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled
          ? 'bg-paper/80 backdrop-blur-xl border-b border-mist/60'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:py-5">
        <Logo onNav={onNav} />
        <nav className="hidden md:flex items-center gap-9">
          {nav.map((n) => (
            <button
              key={n.id}
              onClick={() => onNav(n.id)}
              className="text-sm font-medium text-slatey transition-colors duration-200 hover:text-ink"
            >
              {n.label}
            </button>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slatey max-w-[12rem] truncate">
                {user.email}
              </span>
              <button
                onClick={onSignOut}
                className="text-xs font-medium text-slatey hover:text-ink transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => onAuth('signin')}
                className="text-sm font-medium text-slatey hover:text-ink transition-colors"
              >
                Sign in
              </button>
              <PrimaryButton
                onClick={() => onAuth('signup')}
                className="px-5 py-2.5 text-xs"
              >
                Get the Free Bundle
              </PrimaryButton>
            </>
          )}
        </div>
        <button
          className="md:hidden text-ink"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? 'max-h-96' : 'max-h-0'
        } bg-paper/95 backdrop-blur-xl border-b border-mist`}
      >
        <nav className="flex flex-col px-6 py-4 gap-1">
          {nav.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                onNav(n.id);
                setMenuOpen(false);
              }}
              className="text-left py-3 text-sm font-medium text-slatey hover:text-ink border-b border-mist/50 last:border-0"
            >
              {n.label}
            </button>
          ))}
          {user ? (
            <button
              onClick={() => {
                onSignOut();
                setMenuOpen(false);
              }}
              className="text-left py-3 text-sm font-medium text-slatey hover:text-ink"
            >
              Sign out
            </button>
          ) : (
            <button
              onClick={() => {
                onAuth('signup');
                setMenuOpen(false);
              }}
              className="text-left py-3 text-sm font-medium text-coral"
            >
              Get the Free Bundle
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */
function Hero({ onNav }: { onNav: (id: string) => void }) {
  return (
    <section id="home" className="relative overflow-hidden pt-36 pb-24 lg:pt-48 lg:pb-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 -left-10 h-96 w-96 rounded-full bg-coral/25 blur-[120px] animate-floatSlow" />
        <div className="absolute top-10 right-0 h-[28rem] w-[28rem] rounded-full bg-sky/25 blur-[140px] animate-floatSlow2" />
      </div>

      <div className="mx-auto max-w-4xl px-6 text-center">
        <div className="reveal is-visible inline-flex items-center gap-2 rounded-full border border-mist bg-white/50 px-4 py-1.5 text-xs font-medium tracking-wide text-slatey backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 text-coral" />
          New — Free starter bundle available now
        </div>

        <h1 className="mt-8 text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-6xl">
          Tools to help you study,
          <br />
          focus, and <span className="text-gradient">get more done</span>.
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slatey sm:text-lg">
          Calm, well-made digital products for students and creators who want
          to stay organized, build better habits, and earn a little more along
          the way.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <PrimaryButton onClick={() => onNav('freebies')}>
            Get the Free Bundle
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </PrimaryButton>
          <GhostButton onClick={() => onNav('shop')}>Browse Products</GhostButton>
        </div>

        <p className="mt-6 text-xs tracking-wide text-slatey/70">
          No credit card. No spam. Just useful things.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Freebies section                                                   */
/*  ⤓ REPLACE: swap these placeholder freebies with real content.    */
/* ------------------------------------------------------------------ */
type Freebie = {
  icon: React.ReactNode;
  title: string;
  desc: string;
};

const FREEBIES: Freebie[] = [
  {
    icon: <ClipboardList className="h-5 w-5" />,
    title: 'Weekly Planner',
    desc: 'A clean one-page planner to map your week without the noise.',
  },
  {
    icon: <BookOpen className="h-5 w-5" />,
    title: 'Study Checklist',
    desc: 'Stay on track each term with a simple, satisfying checklist.',
  },
  {
    icon: <Target className="h-5 w-5" />,
    title: 'Focus Tracker',
    desc: 'Measure deep-work sessions and find your most productive hours.',
  },
  {
    icon: <Wallet className="h-5 w-5" />,
    title: 'Income Tracker',
    desc: 'A lightweight sheet to log side-income and see what adds up.',
  },
];

function FreebieCard({
  f,
  onDownload,
}: {
  f: Freebie;
  onDownload: () => void;
}) {
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle');

  const click = async () => {
    setState('busy');
    await onDownload();
    // onDownload triggers auth modal if not signed in; only mark done if signed in
    // We detect by checking if a session exists post-call via a quick re-check
    const { data } = await supabase.auth.getSession();
    if (data.session) setState('done');
    else setState('idle');
  };

  return (
    <div className="group relative flex flex-col rounded-2xl border border-mist bg-white/60 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-ink/15 hover:shadow-[0_20px_40px_-20px_rgba(42,42,46,0.18)]">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-accent text-white shadow-sm">
        {f.icon}
      </div>
      <h3 className="mt-5 text-base font-semibold text-ink">{f.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slatey">{f.desc}</p>
      <button
        onClick={click}
        disabled={state === 'busy'}
        className="mt-5 inline-flex items-center gap-1.5 self-start text-sm font-medium text-ink transition-colors hover:text-coral disabled:opacity-60"
      >
        {state === 'busy' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : state === 'done' ? (
          <Check className="h-4 w-4 text-coral" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {state === 'done' ? 'Downloaded' : 'Download'}
      </button>
    </div>
  );
}

function Freebies({
  onNav,
  onRequireAuth,
}: {
  onNav: (id: string) => void;
  onRequireAuth: (mode: 'signup') => void;
}) {
  const ref = useReveal<HTMLDivElement>();
  const { user } = useAuth();

  const handleDownload = async () => {
    if (!user) {
      onRequireAuth('signup');
      return;
    }
    // ⤓ REPLACE: trigger real file download / signed URL here.
  };

  return (
    <section id="freebies" className="py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div ref={ref} className="reveal max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-widest2 text-coral">
            Start free
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            4 free resources to get you started
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slatey">
            A small bundle of templates and trackers — free to download, no
            strings attached. Create a free account to unlock downloads.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FREEBIES.map((f) => (
            <FreebieCard key={f.title} f={f} onDownload={handleDownload} />
          ))}
        </div>

        {!user && (
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slatey">
            <Lock className="h-3.5 w-3.5" />
            Sign up free to unlock all downloads
          </div>
        )}

        <div className="mt-14 flex flex-col items-center gap-4 rounded-2xl border border-mist bg-white/40 px-6 py-8 text-center backdrop-blur-sm sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h3 className="text-lg font-semibold text-ink">
              Not sure where to start?
            </h3>
            <p className="mt-1 text-sm text-slatey">
              Take the 30-second quiz and we'll point you to the right tool.
            </p>
          </div>
          <GhostButton onClick={() => onNav('quiz')} className="shrink-0">
            Take the Quiz
            <ArrowRight className="h-4 w-4" />
          </GhostButton>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz modal                                                         */
/*  ⤓ REPLACE: refine quiz questions/logic & recommendation mapping.  */
/* ------------------------------------------------------------------ */
type QuizOption = { label: string; segment: 'student' | 'hustler' | 'habit' };
type QuizQuestion = { q: string; options: QuizOption[] };

const QUIZ: QuizQuestion[] = [
  {
    q: 'What brings you here today?',
    options: [
      { label: 'Studying for school or uni', segment: 'student' },
      { label: 'Building a side income', segment: 'hustler' },
      { label: 'Getting more organized', segment: 'habit' },
    ],
  },
  {
    q: 'Where do you feel most stuck?',
    options: [
      { label: 'Keeping up with deadlines', segment: 'student' },
      { label: 'Tracking money coming in', segment: 'hustler' },
      { label: 'Staying focused day to day', segment: 'habit' },
    ],
  },
  {
    q: 'Pick the outcome you want most:',
    options: [
      { label: 'Better grades with less stress', segment: 'student' },
      { label: 'A clearer view of my income', segment: 'hustler' },
      { label: 'A calmer, more focused routine', segment: 'habit' },
    ],
  },
];

const RECS: Record<QuizOption['segment'], { title: string; desc: string; cta: string }> = {
  student: {
    title: 'Start with the Study Checklist',
    desc: 'A simple term-long checklist to keep every deadline visible and off your mind.',
    cta: 'Get the Study Checklist',
  },
  hustler: {
    title: 'Start with the Income Tracker',
    desc: 'Log every bit of side income in one place and see what actually adds up.',
    cta: 'Get the Income Tracker',
  },
  habit: {
    title: 'Start with the Focus Tracker',
    desc: 'Measure deep-work sessions and find the hours where you do your best work.',
    cta: 'Get the Focus Tracker',
  },
};

function QuizModal({
  open,
  onClose,
  onNav,
  onRequireAuth,
}: {
  open: boolean;
  onClose: () => void;
  onNav: (id: string) => void;
  onRequireAuth: (mode: 'signup', ctx: { segment: string; recommendation: string }) => void;
}) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({
    student: 0,
    hustler: 0,
    habit: 0,
  });
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(0);
      setScores({ student: 0, hustler: 0, habit: 0 });
      setDone(false);
      setSaving(false);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const pick = (opt: QuizOption) => {
    const next = { ...scores, [opt.segment]: scores[opt.segment] + 1 };
    setScores(next);
    if (step < QUIZ.length - 1) setStep(step + 1);
    else {
      setDone(true);
    }
  };

  const winner = (Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] ||
    'habit') as QuizOption['segment'];
  const rec = RECS[winner];

  const revealResult = async () => {
    if (!user) {
      // gate: require auth before revealing the recommendation
      onRequireAuth('signup', { segment: winner, recommendation: rec.title });
      return;
    }
    // signed in — persist the quiz result
    setSaving(true);
    await supabase.from('quiz_results').insert({
      segment: winner,
      recommendation: rec.title,
    });
    setSaving(false);
    onClose();
    onNav('freebies');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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

        {!done ? (
          <>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest2 text-coral">
              <Clock className="h-3.5 w-3.5" />
              30-second quiz
            </div>
            <div className="mt-4 flex gap-1.5">
              {QUIZ.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                    i <= step ? 'bg-gradient-accent' : 'bg-mist'
                  }`}
                />
              ))}
            </div>
            <h3 className="mt-6 text-xl font-semibold text-ink">{QUIZ[step].q}</h3>
            <div className="mt-5 flex flex-col gap-2.5">
              {QUIZ[step].options.map((o) => (
                <button
                  key={o.label}
                  onClick={() => pick(o)}
                  className="group flex items-center justify-between rounded-xl border border-mist bg-white/60 px-4 py-3.5 text-left text-sm font-medium text-ink transition-all duration-200 hover:border-ink/20 hover:bg-white"
                >
                  {o.label}
                  <ArrowRight className="h-4 w-4 text-slatey transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-ink" />
                </button>
              ))}
            </div>
            <p className="mt-5 text-xs text-slatey">
              Question {step + 1} of {QUIZ.length}
            </p>
          </>
        ) : (
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-accent text-white">
              <Check className="h-7 w-7" />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-ink">
              Your recommendation
            </h3>

            {!user ? (
              <>
                <div className="mt-4 rounded-xl border border-mist bg-white/60 p-4">
                  <p className="text-sm text-slatey">
                    We've picked a recommendation just for you. Create a free
                    account to reveal it and unlock your downloads.
                  </p>
                </div>
                <div className="mt-6 flex flex-col gap-2.5">
                  <PrimaryButton onClick={revealResult}>
                    <Lock className="h-4 w-4" />
                    Sign up to reveal my result
                  </PrimaryButton>
                  <GhostButton onClick={onClose}>Maybe later</GhostButton>
                </div>
              </>
            ) : (
              <>
                <p className="mt-2 text-base font-medium text-ink">{rec.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-slatey">{rec.desc}</p>
                <div className="mt-6 flex flex-col gap-2.5">
                  <PrimaryButton onClick={revealResult} className={saving ? 'opacity-70' : ''}>
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        {rec.cta}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </PrimaryButton>
                  <GhostButton onClick={onClose}>Maybe later</GhostButton>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function QuizSection({ onOpen }: { onOpen: () => void }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="quiz" className="py-20 lg:py-28">
      <div ref={ref} className="reveal mx-auto max-w-4xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-mist bg-white/50 px-6 py-12 text-center backdrop-blur-sm sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-coral/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-sky/20 blur-3xl" />
          <div className="relative">
            <span className="text-xs font-semibold uppercase tracking-widest2 text-coral">
              Find your fit
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Not sure where to start?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-slatey">
              Answer three quick questions and we'll recommend the right
              resource for you — takes about 30 seconds.
            </p>
            <div className="mt-8">
              <PrimaryButton onClick={onOpen}>
                Take the 30-second quiz
                <ArrowRight className="h-4 w-4" />
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Shop section                                                       */
/*  ⤓ REPLACE: swap placeholder products with real Payhip listings.  */
/* ------------------------------------------------------------------ */
type Product = {
  title: string;
  price: string;
  desc: string;
  tag: string;
};

const PRODUCTS: Product[] = [
  {
    title: 'The Complete Student System',
    price: '$19',
    desc: 'A full Notion workspace for notes, deadlines, revision and exams.',
    tag: 'Notion template',
  },
  {
    title: 'Side Income Starter Kit',
    price: '$24',
    desc: 'Templates and trackers to launch, log and grow a small online income.',
    tag: 'Bundle',
  },
  {
    title: 'Deep Focus Planner',
    price: '$15',
    desc: 'A printable planner built around deep-work blocks and weekly reviews.',
    tag: 'Printable',
  },
  {
    title: 'Habit & Routine Builder',
    price: '$12',
    desc: 'Design calmer mornings and steadier days with a guided habit system.',
    tag: 'Workbook',
  },
  {
    title: 'Budget for Students',
    price: '$9',
    desc: 'A simple, friendly budget that actually works on a student income.',
    tag: 'Spreadsheet',
  },
  {
    title: 'Exam Prep Pack',
    price: '$18',
    desc: 'Revision schedules, flashcard templates and a calm exam-day checklist.',
    tag: 'Bundle',
  },
];

function ProductCard({ p }: { p: Product }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-mist bg-white/60 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(42,42,46,0.18)]">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-coral/15 via-paper to-sky/15">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium uppercase tracking-widest2 text-slatey/70">
            {p.tag}
          </span>
        </div>
        <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-coral/20 blur-2xl transition-opacity duration-300 group-hover:opacity-80" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-ink">{p.title}</h3>
          <span className="shrink-0 text-base font-semibold text-ink">{p.price}</span>
        </div>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slatey">{p.desc}</p>
        {/* ⤓ REPLACE: insert Payhip buy button / checkout link here */}
        <button className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-accent px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:scale-[1.03]">
          Buy Now
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Shop() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="shop" className="py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div ref={ref} className="reveal max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-widest2 text-coral">
            Shop
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Explore our products
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slatey">
            Thoughtfully built templates, planners and systems — each one
            designed to be simple to use and genuinely useful.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.title} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Trust strip                                                        */
/* ------------------------------------------------------------------ */
function Trust() {
  const ref = useReveal<HTMLDivElement>();
  const stats = [
    { value: '1,000+', label: 'Students & creators' },
    { value: '4.9/5', label: 'Average rating' },
    { value: '12k+', label: 'Downloads' },
  ];
  return (
    <section className="py-12">
      <div ref={ref} className="reveal mx-auto max-w-5xl px-6">
        <div className="rounded-2xl border border-mist bg-white/40 px-6 py-10 backdrop-blur-sm">
          <p className="text-center text-sm font-medium tracking-wide text-slatey">
            Trusted by students and creators who care about doing better work.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-semibold tracking-tight text-ink">
                  {s.value}
                </div>
                <div className="mt-1 text-xs uppercase tracking-widest2 text-slatey">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */
function Footer({ onNav }: { onNav: (id: string) => void }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // ⤓ REPLACE: wire to your email list (e.g. ConvertKit / MailerLite) or Supabase.
    setSent(true);
    setEmail('');
    setTimeout(() => setSent(false), 3000);
  };

  const links = [
    { label: 'Freebies', id: 'freebies' },
    { label: 'Shop', id: 'shop' },
    { label: 'Contact', id: 'contact' },
    { label: 'Privacy Policy', id: 'privacy' },
    { label: 'Terms', id: 'terms' },
  ];

  return (
    <footer id="contact" className="border-t border-mist bg-white/40">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5">
              <LogoMark className="h-8 w-8" />
              <div className="flex flex-col leading-none">
                <span className="text-base font-medium text-ink lowercase">
                  etral
                </span>
                <span className="text-[0.5rem] font-medium tracking-widest2 text-slatey uppercase mt-0.5">
                  Digital Products
                </span>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slatey">
              Calm, well-made digital products for studying, focusing and
              earning. One email a month, no fluff.
            </p>
            <form onSubmit={submit} className="mt-5">
              <div className="flex items-center gap-2 rounded-full border border-mist bg-paper p-1 pl-4 focus-within:border-ink/30">
                <Mail className="h-4 w-4 text-slatey" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="flex-1 bg-transparent text-sm text-ink placeholder:text-slatey/60 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-full bg-gradient-accent px-4 py-2 text-xs font-medium text-white transition-transform duration-300 hover:scale-105"
                >
                  {sent ? 'Thanks!' : 'Subscribe'}
                </button>
              </div>
            </form>
          </div>
          <div className="md:col-span-1">
            <h4 className="text-xs font-semibold uppercase tracking-widest2 text-ink">
              Explore
            </h4>
            <ul className="mt-4 space-y-3">
              {links.map((l) => (
                <li key={l.id}>
                  <button
                    onClick={() => onNav(l.id)}
                    className="text-sm text-slatey transition-colors hover:text-ink"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-1">
            <h4 className="text-xs font-semibold uppercase tracking-widest2 text-ink">
              Follow
            </h4>
            <div className="mt-4 flex gap-3">
              {[Twitter, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-mist bg-paper text-slatey transition-all duration-300 hover:-translate-y-0.5 hover:border-ink/20 hover:text-ink"
                  aria-label="social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <p className="mt-6 flex items-center gap-2 text-xs text-slatey">
              <TrendingUp className="h-3.5 w-3.5 text-coral" />
              New freebies added every month.
            </p>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-mist pt-6 sm:flex-row">
          <p className="text-xs text-slatey">
            © {new Date().getFullYear()} Eteral. All rights reserved.
          </p>
          <p className="text-xs text-slatey">
            Made with care for students and creators.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  App                                                                */
/* ------------------------------------------------------------------ */
export default function App() {
  const { user, loading } = useAuth();
  const [quizOpen, setQuizOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [authCtx, setAuthCtx] = useState<{
    segment: string;
    recommendation: string;
  } | null>(null);
  const [reopenQuiz, setReopenQuiz] = useState(false);

  const onNav = (id: string) => {
    if (id === 'privacy' || id === 'terms') return;
    if (id === 'quiz') {
      setQuizOpen(true);
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const requireAuthForQuiz = (
    mode: 'signup',
    ctx: { segment: string; recommendation: string }
  ) => {
    setAuthCtx(ctx);
    setAuthMode(mode);
    setAuthOpen(true);
    setReopenQuiz(true);
  };

  const onAuthSuccess = async () => {
    // After successful auth, if we came from the quiz, persist the result + reopen
    if (authCtx && reopenQuiz) {
      await supabase.from('quiz_results').insert({
        segment: authCtx.segment,
        recommendation: authCtx.recommendation,
      });
      setAuthCtx(null);
      setReopenQuiz(false);
      setQuizOpen(true);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slatey" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Header
        onNav={onNav}
        onAuth={openAuth}
        user={user}
        onSignOut={signOut}
      />
      <main>
        <Hero onNav={onNav} />
        <Freebies onNav={onNav} onRequireAuth={openAuth} />
        <QuizSection onOpen={() => setQuizOpen(true)} />
        <Shop />
        <Trust />
      </main>
      <Footer onNav={onNav} />
      <QuizModal
        open={quizOpen}
        onClose={() => setQuizOpen(false)}
        onNav={onNav}
        onRequireAuth={requireAuthForQuiz}
      />
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
        onSuccess={onAuthSuccess}
      />
    </div>
  );
}
