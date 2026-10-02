import { useEffect, useRef, useState } from 'react';
import {
  X,
  Download,
  ArrowRight,
  Check,
  Menu,
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

import ResumeResources from "./pages/ResumeResources";
import ProtectedRoute from "./lib/ProtectedRoute";
import logo from "./assets/eteral_symbol.png";
import RefundAndCancellation from "./pages/RefundAndCancellation";
import Contact from "./pages/Contact";

import {
  Hero,
  BeforeAfter,
  Path,
  Practice,
  Skills,
  ProjectsSection,
  Interview,
  Curated,
  CareerProfile,
  FinalCta,
} from './Homesections';

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

function triggerDownload(url: string, filename?: string) {
  const link = document.createElement('a');
  link.href = url;
  if (filename) link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* Logo */
function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return <img src={logo} alt="" aria-hidden="true" className={`${className} object-contain`} />;
}

function Logo({ onNav }: { onNav: (id: string) => void }) {
  return (
    <button onClick={() => onNav('home')} className="flex items-center gap-2.5 group" aria-label="Eteral home">
      <LogoMark className="h-8 w-8 transition-transform duration-500 group-hover:rotate-[8deg]" />
      <div className="flex flex-col items-start leading-none">
        <span className="text-[1.15rem] font-medium tracking-tight text-ink lowercase">eteral</span>
        <span className="text-[0.5rem] font-medium tracking-widest2 text-slatey uppercase mt-0.5">Grow in it</span>
      </div>
    </button>
  );
}

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

/* Header */
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
    { label: 'Career Quiz', id: 'quiz', path: '/career-readiness' },
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
    if (n.path) navigate(n.path);
    else onNav(n.id);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled ? 'bg-paper/80 backdrop-blur-xl border-b border-mist/60' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:py-5">
        <Logo onNav={onNav} />
        <nav className="hidden md:flex items-center gap-8">
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
              <button onClick={() => navigate('/dashboard')} className="text-xs font-medium text-coral hover:text-ink transition-colors">
                Dashboard
              </button>
              <span className="text-xs text-slatey max-w-[12rem] truncate">{user.email}</span>
              <button onClick={onSignOut} className="text-xs font-medium text-slatey hover:text-ink transition-colors">
                Sign out
              </button>
            </div>
          ) : (
            <>
              <button onClick={() => onAuth('signin')} className="text-sm font-medium text-slatey hover:text-ink transition-colors">
                Sign in
              </button>
              <PrimaryButton onClick={() => navigate('/career-readiness')} className="px-5 py-2.5 text-xs">
                Take the Quiz
              </PrimaryButton>
            </>
          )}
        </div>
        <button className="md:hidden text-ink" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? 'max-h-[28rem]' : 'max-h-0'
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
                navigate('/career-readiness');
                setMenuOpen(false);
              }}
              className="text-left py-3 text-sm font-medium text-coral"
            >
              Take the Quiz
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

/* Freebies */
type Freebie = {
  icon: React.ReactNode;
  title: string;
  desc: string;
  fileUrl: string;
  unlockAfterDays?: number;
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
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-accent text-white shadow-sm">{f.icon}</div>
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
  onRequireAuth,
}: {
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
          <span className="text-xs font-semibold uppercase tracking-widest text-coral">Start free</span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">4 free resources to get you started</h2>
          <p className="mt-4 text-base leading-relaxed text-slatey">
            A small bundle of templates and trackers — free to download, no strings attached. Create a free account to unlock downloads.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FREEBIES.map((f) => {
            const locked = !!f.unlockAfterDays && (!user || memberDays < f.unlockAfterDays);
            const unlocksInDays = f.unlockAfterDays ? Math.max(f.unlockAfterDays - memberDays, 0) : undefined;
            return (
              <FreebieCard key={f.fileUrl} f={f} onDownload={handleDownload} locked={locked} unlocksInDays={unlocksInDays} />
            );
          })}
        </div>

        {!user && (
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slatey">
            <Lock className="h-3.5 w-3.5" />
            Sign up free to unlock all downloads
          </div>
        )}
      </div>
    </section>
  );
}

/* Blog (type renamed: it clashed with the imported BlogPost component) */
type BlogPostData = {
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
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function BlogCard({ post }: { post: BlogPostData }) {
  const imageUrl = post.mainImage ? urlForImage(post.mainImage) : null;

  return (
    <Link
      to={`/blog/${post.slug.current}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-mist bg-white/60 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(42,42,46,0.18)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-coral/15 via-paper to-sky/15">
        {imageUrl ? (
          <img src={imageUrl} alt={post.title} className="h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium uppercase tracking-widest text-slatey/70">Blog</span>
          </div>
        )}
        <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-coral/20 blur-2xl transition-opacity duration-300 group-hover:opacity-80" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-ink">{post.title}</h3>
          <span className="shrink-0 text-xs font-medium text-slatey">{formatDate(post.publishedAt)}</span>
        </div>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slatey">{post.excerpt}</p>
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
  const [posts, setPosts] = useState<BlogPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    sanityClient
      .fetch<BlogPostData[]>(LATEST_POSTS_QUERY)
      .then((data: BlogPostData[]) => {
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
          <span className="text-xs font-semibold uppercase tracking-widest text-coral">Blog</span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">From the blog</h2>
          <p className="mt-4 text-base leading-relaxed text-slatey">
            Thoughts, guides and updates — written to be simple to read and genuinely useful.
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
          {!loading && error && <p className="text-sm text-slatey">Couldn't load the latest posts right now.</p>}
          {!loading && !error && posts.length === 0 && <p className="text-sm text-slatey">No posts yet — check back soon.</p>}
          {!loading && !error && posts.map((post) => <BlogCard key={post._id} post={post} />)}
        </div>
      </div>
    </section>
  );
}

/* Trust strip */
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
                <div className="text-3xl font-semibold tracking-tight text-ink">{s.value}</div>
                <div className="mt-1 text-xs uppercase tracking-widest2 text-slatey">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* Footer */
export function Footer({ onNav }: { onNav: (id: string) => void }) {


  const links = [
    { label: 'Career Quiz', path: '/career-readiness', type: 'route' },
    { label: 'Freebies', id: 'freebies', type: 'scroll' },
    { label: 'Membership', path: '/membership', type: 'route' },
    { label: 'Contact', id: 'contact', type: 'scroll' },
    { label: 'Privacy Policy', path: '/privacy-policy', type: 'route' },
    { label: 'Terms and Condition', path: '/terms-and-conditions', type: 'route' },
    { label: 'Refund and Cancellation', path: '/refund-and-cancellation', type: 'route' },
    { label: 'Contact Eteral', path: '/contact-eteral', type: 'route' },
  ];

  return (
    <footer id="contact" className="border-t border-mist bg-white/40">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5">
              <LogoMark className="h-8 w-8" />
              <div className="flex flex-col leading-none">
                <span className="text-base font-medium text-ink lowercase">eteral</span>
                <span className="text-[0.5rem] font-medium tracking-widest2 text-slatey uppercase mt-0.5">grow in it</span>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slatey">
              Calm, well-made for career readiness and to actually improve your journey
            </p>
            <Link
              to="/membership"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-accent px-5 py-2.5 text-sm font-medium text-white transition-transform duration-300 hover:scale-105"
            >
              See Membership Plans
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="md:col-span-1">
            <h4 className="text-xs font-semibold uppercase tracking-widest2 text-ink">Explore</h4>
            <ul className="mt-4 space-y-3">
              {links.map((l) => (
                <li key={l.id || l.path}>
                  {l.type === 'route' ? (
                    <Link to={l.path!} className="text-sm text-slatey transition-colors hover:text-ink">
                      {l.label}
                    </Link>
                  ) : (
                    <button onClick={() => onNav(l.id!)} className="text-sm text-slatey transition-colors hover:text-ink">
                      {l.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-1">
            <h4 className="text-xs font-semibold uppercase tracking-widest2 text-ink">Follow</h4>
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
          <p className="text-xs text-slatey">© {new Date().getFullYear()} Eteral. All rights reserved.</p>
          <p className="text-xs text-slatey">Made with care for You.</p>
        </div>
      </div>
    </footer>
  );
}

/* Pages */
function LandingPage() {
  const { user, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [pendingFreebie, setPendingFreebie] = useState<Freebie | null>(null);

  const onNav = (id: string) => {
    if (id === 'privacy' || id === 'terms') return;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      <Header onNav={onNav} onAuth={openAuth} user={user} onSignOut={signOut} />
      <main>
        <Hero />
        <BeforeAfter />
        <Path />
        <Curated />
        <Practice />
        <Skills />
        <ProjectsSection />
        <Interview />
        <CareerProfile />
        <Freebies onRequireAuth={requireAuthForFreebie} />
        <Blog />
        <Trust />
        <FinalCta />
      </main>
      <Footer onNav={onNav} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} initialMode={authMode} onSuccess={onAuthSuccess} />
      
    </div>
  );
}

function CareerReadinessPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  const onNav = () => navigate('/');

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
        <button onClick={() => navigate('/')} className="text-sm font-medium text-slatey hover:text-ink transition-colors">
          ← Back to Eteral
        </button>
      </div>
      <CareerReadinessQuiz isAuthenticated={!!user} onRequireAuth={() => setAuthOpen(true)} />
      <Footer onNav={onNav} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} initialMode="signup" onSuccess={() => setAuthOpen(false)} />
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
      {/* Standard-protected routes */}
      <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

      <Route path="/standard/resume" element={<ProtectedRoute><ResumeResources /></ProtectedRoute>} />
    </Routes>
  );
}