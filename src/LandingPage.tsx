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
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import { CareerReadinessQuiz } from './features/career-readiness';
import BlogList from './features/blog/BlogList.jsx';
import BlogPost from './features/blog/BlogPost.jsx';
import { sanityClient, urlForImage } from './features/blog/sanityClient.js';
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import MembershipPricingPage from "./pages/MembershipPricing";
import LoginPage from "./pages/Login";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Applications from "./pages/Applications";
import ResumeResources from "./pages/ResumeResources";
import ProtectedRoute from "./lib/ProtectedRoute";
import logo from "./assets/eteral_symbol.png"; // adjust path to wherever it lives in assets
import RefundAndCancellation from "./pages/RefundAndCancellation";
import Contact from "./pages/Contact";
import BoostYourResume from './pages/BoostYourResume';
import ResumeCheck from './pages/ResumeCheck';
import EterAlAssistant from '@/components/EterAlAssistant';







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

/* Triggers a same-origin file download without navigating away */
function triggerDownload(url: string, filename?: string) {
  const link = document.createElement('a');
  link.href = url;
  if (filename) link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* ------------------------------------------------------------------ */
/*  Logo mark — abstract interlocking "e"                             */
/* ------------------------------------------------------------------ */
function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <img
      src={logo}
      alt=""
      aria-hidden="true"
      className={`${className} object-contain`}
    />
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
          eteral
        </span>
        <span className="text-[0.5rem] font-medium tracking-widest2 text-slatey uppercase mt-0.5">
          Grow in it
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
/*  Nav — Unified navigation component                                */
/* ------------------------------------------------------------------ */
type NavLink = {
  label: string;
  id?: string;
  path?: string;
  type: 'route' | 'scroll';
};

function Nav({ links }: { links: NavLink[] }) {
  const navigate = useNavigate();

  const handleScrollClick = (id: string) => {
    // if we're not on the homepage, go there first, then scroll
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav>
      {links.map((link) =>
        link.type === 'route' ? (
          <Link key={link.label} to={link.path!}>
            {link.label}
          </Link>
        ) : (
          <button key={link.label} onClick={() => handleScrollClick(link.id!)}>
            {link.label}
          </button>
        )
      )}
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Header                                                             */
/* ------------------------------------------------------------------ */
export function Header({
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

  const navigate = useNavigate();

  const nav = [
    { label: 'Home', id: 'home' },
    { label: 'Freebies', id: 'freebies' },
    { label: 'Membership', id: 'membership', path: '/membership' },
    { label: 'Dashboard', id: 'dashboard', path: '/dashboard' },
    { label: 'Contact', id: 'contact' },
  ];

  const handleNavClick = (n: { id: string; path?: string }) => {
    if (n.id === 'dashboard' && !user) {
      onAuth('signup');
      return;
    }
    if (n.path) {
      navigate(n.path);
    } else {
      onNav(n.id);
    }
  };

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
              onClick={() => handleNavClick(n)}
              className="text-sm font-medium text-slatey transition-colors duration-200 hover:text-ink"
            >
              {n.label}
            </button>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-xs font-medium text-coral hover:text-ink transition-colors"
              >
                Dashboard
              </button>
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
                handleNavClick(n);
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
  const navigate = useNavigate();
  return (
    <section id="home" className="relative overflow-hidden pt-36 pb-24 lg:pt-48 lg:pb-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 -left-10 h-96 w-96 rounded-full bg-coral/25 blur-[120px] animate-floatSlow" />
        <div className="absolute top-10 right-0 h-[28rem] w-[28rem] rounded-full bg-sky/25 blur-[140px] animate-floatSlow2" />
      </div>

      <div className="mx-auto max-w-4xl px-6 text-center">
        <div className="reveal is-visible inline-flex items-center gap-2 rounded-full border border-mist bg-white/50 px-4 py-1.5 text-xs font-medium tracking-wide text-slatey backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 text-coral" />
          Eteral Membership — now open
        </div>

        <h1 className="mt-8 text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-6xl">
          The job search doesn't end
          <br />
          at the <span className="text-gradient">offer letter</span>.
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slatey sm:text-lg">
          We're built for the whole arc — from first interview to first promotion.
          One membership, every stage of your early career covered.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <PrimaryButton onClick={() => navigate('/membership')}>
            Join Eteral
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </PrimaryButton>
          <GhostButton onClick={() => onNav('freebies')}>Get the Free Bundle</GhostButton>
        </div>

        <p className="mt-6 text-xs tracking-wide text-slatey/70">
          Start free. Upgrade when you're ready.
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
  fileUrl: string;
  unlockAfterDays?: number; // undefined = available immediately after signup
};

const FREEBIES: Freebie[] = [
  {
    icon: <ClipboardList className="h-5 w-5" />,
    title: 'ATS Resume Checklist',
    desc: 'A clean one-page checklist to see if your resume reaches the human',
    fileUrl: '/freebies/eteral-ats-resume-checklist.pdf',
  },
  {
    icon: <BookOpen className="h-5 w-5" />,
    title: 'ATS-Friendly Editable Resume',
    desc: 'An editable, ATS-friendly resume template',
    fileUrl: '/freebies/ats-friendly-tech-resume-template.pdf',
  },
  {
    icon: <Target className="h-5 w-5" />,
    title: 'Career Organization Kit',
    desc: 'Unlocks in your third week with Eteral',
    fileUrl: '/freebies/organization-tracker.pdf',
    unlockAfterDays: 21,
  },
  {
    icon: <Wallet className="h-5 w-5" />,
    title: 'Eteral Career Kit',
    desc: 'Unlocks after your first month with Eteral',
    fileUrl: '/freebies/career-kit.pdf',
    unlockAfterDays: 30,
  },
];

function daysSince(date: string | Date): number {
  const ms = Date.now() - new Date(date).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function FreebieCard({
  f,
  onDownload,
  locked,
  unlocksInDays,
}: {
  f: Freebie;
  onDownload: (f: Freebie) => Promise<boolean>;
  locked: boolean;
  unlocksInDays?: number;
}) {
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle');

  const click = async () => {
    if (locked) return;
    setState('busy');
    const success = await onDownload(f);
    setState(success ? 'done' : 'idle');
  };

  return (
    <div className="group relative flex flex-col rounded-2xl border border-mist bg-white/60 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-ink/15 hover:shadow-[0_20px_40px_-20px_rgba(42,42,46,0.18)]">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-accent text-white shadow-sm">
        {f.icon}
      </div>
      <h3 className="mt-5 text-base font-semibold text-ink">{f.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slatey">{f.desc}</p>

      {locked ? (
        <div className="mt-5 inline-flex items-center gap-1.5 self-start text-sm font-medium text-slatey">
          <Lock className="h-4 w-4" />
          {unlocksInDays && unlocksInDays > 0
            ? `Unlocks in ${unlocksInDays} day${unlocksInDays === 1 ? '' : 's'}`
            : 'Locked'}
        </div>
      ) : (
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
      )}
    </div>
  );
}

function Freebies({
  onNav,
  onRequireAuth,
}: {
  onNav: (id: string) => void;
  onRequireAuth: (mode: 'signup', freebie: Freebie) => void;
}) {
  const ref = useReveal<HTMLDivElement>();
  const { user } = useAuth();

  const handleDownload = async (f: Freebie): Promise<boolean> => {
    if (!user) {
      onRequireAuth('signup', f);
      return false;
    }
    triggerDownload(f.fileUrl, `${f.title}.pdf`);
    return true;
  };

  const memberDays = user ? daysSince(user.created_at) : 0;

  return (
    <section id="freebies" className="py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div ref={ref} className="reveal max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-coral">
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
          {FREEBIES.map((f) => {
            const locked = !!f.unlockAfterDays && (!user || memberDays < f.unlockAfterDays);
            const unlocksInDays = f.unlockAfterDays
              ? Math.max(f.unlockAfterDays - memberDays, 0)
              : undefined;
            return (
              <FreebieCard
                key={f.fileUrl}
                f={f}
                onDownload={handleDownload}
                locked={locked}
                unlocksInDays={unlocksInDays}
              />
            );
          })}
        </div>

        {!user && (
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slatey">
            <Lock className="h-3.5 w-3.5" />
            Sign up free to unlock all downloads
          </div>
        )}

        <Link
          to="./career-readiness/"
          className="group relative mt-14 flex flex-col items-center gap-5 overflow-hidden rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-white to-sky/10 px-6 py-10 text-center transition-all duration-300 hover:border-coral/50 hover:shadow-[0_20px_60px_-20px_rgba(255,107,107,0.35)] sm:flex-row sm:justify-between sm:text-left sm:py-8"
        >
          <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-coral/20 blur-3xl transition-opacity duration-300 group-hover:opacity-80" />
 
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-coral/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest2 text-coral">
              <Sparkles className="h-3 w-3" />
              Free · 30 seconds
            </div>
            <h3 className="mt-3 text-xl font-semibold text-ink sm:text-2xl">
              How career-ready are you, really?
            </h3>
            <p className="mt-2 text-sm text-slatey">
              Answer a few quick questions and get a personalized readiness score —
              plus exactly which tool to use first.
            </p>
          </div>
 
          <div className="relative shrink-0">
            <span className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-3.5 text-sm font-semibold text-white transition-transform duration-300 group-hover:scale-[1.04] group-hover:gap-3">
              Take the Quiz
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}


/*  Membership section                                                 */
/*  ⤓ REPLACE: swap placeholder tiers once pricing/billing is live.   */
/* ------------------------------------------------------------------ */

type MembershipStage = {
  label: string;
  title: string;
  desc: string;
};

const MEMBERSHIP_STAGES: MembershipStage[] = [
  {
    label: 'Before the offer',
    title: 'Land the interview',
    desc: 'Resume, portfolio, and outreach built to actually get a response.',
  },
  {
    label: 'Getting the offer',
    title: 'Win the interview',
    desc: 'Structured prep, mock interviews, and negotiation guidance.',
  },
  {
    label: 'After the offer',
    title: 'Grow into the role',
    desc: 'Onboarding playbooks, performance habits, and a path to your first promotion.',
  },
];

function Membership() {
  const ref = useReveal<HTMLDivElement>();
  const navigate = useNavigate();

  return (
    <section id="membership" className="py-20 lg:py-28 bg-white/40">
      <div className="mx-auto max-w-6xl px-6">
        <div ref={ref} className="reveal max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-coral">
            Membership
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Built for the whole arc.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slatey">
            The job search doesn't end at the offer letter — and neither do we.
            One membership that covers first interview through first promotion.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {MEMBERSHIP_STAGES.map((stage) => (
            <div
              key={stage.title}
              className="rounded-2xl border border-mist bg-white p-6 transition-colors duration-200 hover:border-ink/20"
            >
              <span className="text-xs font-semibold uppercase tracking-widest2 text-coral">
                {stage.label}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-ink">{stage.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slatey">{stage.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <PrimaryButton onClick={() => navigate('/membership')}>
            Learn about Membership
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
}


type BlogPost = {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  mainImage: any;
  publishedAt: string;
};

const LATEST_POSTS_QUERY = `*[_type == "post"] | order(publishedAt desc)[0...3]{
  _id,
  title,
  slug,
  excerpt,
  mainImage,
  publishedAt
}`;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function BlogCard({ post }: { post: BlogPost }) {
  const imageUrl = post.mainImage ? urlForImage(post.mainImage) : null;

  return (
    <Link
      to={`/blog/${post.slug.current}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-mist bg-white/60 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(42,42,46,0.18)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-coral/15 via-paper to-sky/15">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium uppercase tracking-widest text-slatey/70">
              Blog
            </span>
          </div>
        )}
        <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-coral/20 blur-2xl transition-opacity duration-300 group-hover:opacity-80" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-ink">{post.title}</h3>
          <span className="shrink-0 text-xs font-medium text-slatey">
            {formatDate(post.publishedAt)}
          </span>
        </div>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slatey">
          {post.excerpt}
        </p>
        <span className="mt-5 inline-flex items-center justify-center gap-2 self-start rounded-full bg-gradient-accent px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 group-hover:scale-[1.03]">
          Read the post
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

function BlogCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-mist bg-white/60 backdrop-blur-sm">
      <div className="aspect-[4/3] w-full bg-mist" />
      <div className="p-6">
        <div className="h-4 w-2/3 rounded bg-mist" />
        <div className="mt-3 h-3 w-full rounded bg-mist" />
        <div className="mt-2 h-3 w-4/5 rounded bg-mist" />
      </div>
    </div>
  );
}

function Blog() {
  const ref = useReveal<HTMLDivElement>();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    sanityClient
      .fetch<BlogPost[]>(LATEST_POSTS_QUERY)
      .then((data: BlogPost[]) => {
        if (!cancelled) setPosts(data || []);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="blog" className="py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div ref={ref} className="reveal max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-coral">
            Blog
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            From the blog
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slatey">
            Thoughts, guides and updates — written to be simple to read and
            genuinely useful.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading && (
            <>
              <BlogCardSkeleton />
              <BlogCardSkeleton />
              <BlogCardSkeleton />
            </>
          )}
          {!loading && error && (
            <p className="text-sm text-slatey">
              Couldn't load the latest posts right now.
            </p>
          )}
          {!loading && !error && posts.length === 0 && (
            <p className="text-sm text-slatey">No posts yet — check back soon.</p>
          )}
          {!loading &&
            !error &&
            posts.map((post) => <BlogCard key={post._id} post={post} />)}
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
    { value: '98+', label: 'Students & Workers' },
    { value: '4.8', label: 'Average rating' },
    { value: '68+', label: 'Members' },
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
export function Footer({ onNav }: { onNav: (id: string) => void }) {
  const navigate = useNavigate();
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
  { label: 'Freebies', id: 'freebies', type: 'scroll' },
  { label: 'Membership', path: '/membership', type: 'route' },
  { label: 'Contact', id: 'contact', type: 'scroll' },
  { label: 'Privacy Policy', path: '/privacy-policy', type: 'route' },
  { label: 'Terms and Condition', path: '/terms-and-conditions', type: 'route' },
  { label: 'Refund and Cancellation', path: '/refund-and-cancellation', type: 'route'},
  {label: 'Contact Eteral', path: '/contact-eteral', type: 'route'}
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
                  eteral
                </span>
                <span className="text-[0.5rem] font-medium tracking-widest2 text-slatey uppercase mt-0.5">
                  grow in it
                </span>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slatey">
              Calm, well-made for career readiness and to actually improve your journey
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
                <li key={l.id || l.path}>
                  {l.type === 'route' ? (
                    <Link
                      to={l.path!}
                      className="text-sm text-slatey transition-colors hover:text-ink"
                    >
                      {l.label}
                    </Link>
                  ) : (
                    <button
                      onClick={() => onNav(l.id!)}
                      className="text-sm text-slatey transition-colors hover:text-ink"
                    >
                      {l.label}
                    </button>
                  )}
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
            Made with care for You.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  App                                                                */
/* ------------------------------------------------------------------ */
function LandingPage() {
  const { user, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [pendingFreebie, setPendingFreebie] = useState<Freebie | null>(null);

  const onNav = (id: string) => {
    if (id === 'privacy' || id === 'terms') return;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const requireAuthForFreebie = (mode: 'signup', freebie: Freebie) => {
    setPendingFreebie(freebie);
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const onAuthSuccess = async () => {
    if (pendingFreebie) {
      triggerDownload(pendingFreebie.fileUrl, `${pendingFreebie.title}.pdf`);
      setPendingFreebie(null);
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
        <Freebies onNav={onNav} onRequireAuth={requireAuthForFreebie} />
        <Membership />
        <Blog />
        <Trust />
      </main>
      <Footer onNav={onNav} />
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
        onSuccess={onAuthSuccess}
      />
      <EterAlAssistant />
    </div>
  );
}
function CareerReadinessPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  const onNav = (id: string) => {
    navigate('/');
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
      <Header onNav={onNav} onAuth={() => setAuthOpen(true)} user={user} onSignOut={signOut} />
      <div className="pt-28 px-6 max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="text-sm font-medium text-slatey hover:text-ink transition-colors"
        >
          ← Back to Eteral
        </button>
      </div>
      <CareerReadinessQuiz
        isAuthenticated={!!user}
        onRequireAuth={() => setAuthOpen(true)}
      />
      <Footer onNav={onNav} />
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode="signup"
        onSuccess={() => setAuthOpen(false)}
      />
    </div>
  );
}
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/career-readiness" element={<CareerReadinessPage />} />
      <Route path="/membership" element={<MembershipPricingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/cancelled" element={<PaymentCancelled />} />
      <Route path="/blog" element={<BlogList />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
      <Route path="/refund-and-cancellation" element={<RefundAndCancellation />} />
      <Route path="/contact-eteral" element={<Contact />} />
      <Route path="/resume" element={<ProtectedRoute><BoostYourResume /></ProtectedRoute>} />
<Route path="/resume/check" element={<ProtectedRoute><ResumeCheck /></ProtectedRoute>} />
      {/* Standard-protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
      <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
      <Route path="/standard/resume" element={<ProtectedRoute><ResumeResources /></ProtectedRoute>} />
    </Routes>
  );
}