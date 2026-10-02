import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, X, Mic, Code2, FolderGit2, Compass, BookOpen, Zap, BarChart3, Rocket, BadgeCheck } from 'lucide-react';

/* Drop this file in src/. Replaces Hero + adds new sections.
   All mock UI is labelled "Sample" — swap numbers for real screenshots later. */

const QUIZ = '/career-readiness';

export function QuizButton({ children = 'Take the free readiness quiz', className = '' }: { children?: ReactNode; className?: string }) {
  return (
    <Link
      to={QUIZ}
      className={`group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-accent px-8 py-4 text-base font-semibold text-white shadow-[0_8px_24px_-8px_rgba(245,163,160,0.5)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_12px_32px_-8px_rgba(156,196,240,0.6)] ${className}`}
    >
      {children}
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
    </Link>
  );
}

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setSeen(true); io.disconnect(); }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen] as const;
}

function Frame({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-mist bg-white shadow-[0_30px_60px_-30px_rgba(42,42,46,0.25)] ${className}`}>
      <div className="flex items-center justify-between border-b border-mist bg-paper px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-coral/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-sky/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-mist" />
        </div>
        <span className="text-xs text-slatey">{title}</span>
        <span className="text-[10px] text-slatey/60">Sample</span>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

function Bar({ label, pct, seen }: { label: string; pct: number; seen: boolean }) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="font-medium text-ink">{label}</span>
        <span className="text-slatey">{pct}%</span>
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-mist/70">
        <div
          className="h-2 rounded-full bg-gradient-accent transition-[width] duration-1000 ease-out motion-reduce:transition-none"
          style={{ width: seen ? `${pct}%` : '0%' }}
        />
      </div>
    </div>
  );
}

function Split({ id, title, text, flip, children }: { id?: string; title: string; text: string; flip?: boolean; children: ReactNode }) {
  return (
    <section id={id} className="py-12 lg:py-20">
      <div className={`mx-auto grid max-w-6xl items-center gap-10 px-6 lg:grid-cols-2 lg:gap-16 ${flip ? 'lg:[&>*:first-child]:order-2' : ''}`}>
        <div>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">{title}</h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-slatey">{text}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

/* 1 ─ Hero */
export function Hero() {
  const [ref, seen] = useInView<HTMLDivElement>();
  return (
    <section id="home" className="relative overflow-hidden pt-32 pb-16 lg:pt-44 lg:pb-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 -left-10 h-96 w-96 rounded-full bg-coral/25 blur-[120px] animate-floatSlow" />
        <div className="absolute top-10 right-0 h-[28rem] w-[28rem] rounded-full bg-sky/25 blur-[140px] animate-floatSlow2" />
      </div>
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Stop learning.
            <br />
            Start proving you're job-ready.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-slatey sm:text-lg">
            Learn what matters. Practice it. Build projects. Prove your skills. Prepare for interviews.
          </p>
          <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <QuizButton />
            <a href="#how-it-works" className="text-sm font-medium text-slatey transition-colors hover:text-ink">
              See how it works
            </a>
          </div>
          <p className="mt-4 text-xs text-slatey/70">Free, takes 30 seconds, no card needed. You get a readiness score and your first step.</p>
          <p className="mt-8 text-sm font-medium text-ink">One career path → one place to practice → one profile of your proof</p>
          <p className="mt-1 text-xs text-slatey">Learn → Practice → Build → Explain → Prove</p>
        </div>

        <div ref={ref}>
          <Frame title="Your readiness">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-slatey">Frontend Developer path</p>
                <p className="mt-1 text-4xl font-semibold text-ink">64%</p>
              </div>
              <span className="rounded-full bg-coral/10 px-3 py-1 text-xs font-medium text-coral">Practicing</span>
            </div>
            <div className="mt-5 space-y-4">
              <Bar label="JavaScript" pct={78} seen={seen} />
              <Bar label="React" pct={61} seen={seen} />
              <Bar label="Git / GitHub" pct={88} seen={seen} />
            </div>
            <Link to={QUIZ} className="mt-6 flex items-center justify-between rounded-xl border border-coral/30 bg-coral/5 px-4 py-3 text-sm text-ink transition-colors hover:bg-coral/10">
              <span>Where do you stand? Find out free.</span>
              <ArrowRight className="h-4 w-4 text-coral" />
            </Link>
          </Frame>
        </div>
      </div>
    </section>
  );
}

/* 2 ─ Before / After */
export function BeforeAfter() {
  const learned = ['React', 'Java', 'SQL', 'Git'];
  const proved = ['Completed coding challenges', 'Built projects', 'GitHub evidence', 'Interview explanations', 'Demonstrated skills'];
  return (
    <section className="py-12 lg:py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Courses completed ≠ skills proved.</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-mist bg-white/50 p-6">
            <h3 className="text-sm font-semibold text-slatey">What you learned</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {learned.map((t) => (
                <li key={t} className="rounded-full border border-mist bg-white px-4 py-1.5 text-sm text-slatey">{t}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-white to-sky/10 p-6">
            <h3 className="text-sm font-semibold text-coral">What you can actually prove</h3>
            <ul className="mt-4 space-y-3">
              {proved.map((t) => (
                <li key={t} className="flex items-center gap-3 text-sm font-medium text-ink"><Check className="h-4 w-4 shrink-0 text-coral" />{t}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-base text-slatey">How much of what you've learned could you prove today?</p>
          <QuizButton>Find out in 30 seconds</QuizButton>
        </div>
      </div>
    </section>
  );
}
/* 3 ─ The path */
export function Path() {
  const steps = [
    [Compass, 'Choose your direction'], [BookOpen, 'Learn from quality resources'], [Code2, 'Practice with AI challenges'], [Zap, 'Earn XP and skill evidence'],
    [FolderGit2, 'Build real projects'], [Mic, 'Practice interviews'], [BarChart3, 'Track your readiness'], [Rocket, 'Build your career proof'],
  ] as const;
  return (
    <section id="how-it-works" className="bg-white/40 py-12 lg:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Your career path, not another course library.</h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slatey">Know what to learn, what to practice, what to build, and what proof you'll need for your target role.</p>
        <p className="mt-3 text-sm font-medium text-ink">Target role → skills → projects → proof</p>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([Icon, label], i) => (
            <li key={label} className="flex items-start gap-3 rounded-xl border border-mist bg-white p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-accent text-white"><Icon className="h-4 w-4" /></span>
              <div>
                <p className="text-xs text-slatey">Step {i + 1}</p>
                <p className="text-sm font-semibold text-ink">{label}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* 4 ─ Learning environment */
export function Practice() {
  return (
    <Split title="Don't just read it. Try it." text="Pick a skill and difficulty. Eteral gives you a practical challenge and a workspace to solve it. Pass and earn XP. Fail, see what went wrong, and try again.">
      <Frame title="Python · Easy">
        <p className="text-base font-semibold text-ink">Write a function that returns the largest number in a list.</p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-ink p-4 text-xs leading-relaxed text-white/90">{`def largest(nums):\n    return max(nums)`}</pre>
        <div className="mt-5 flex items-center justify-between">
          <span className="rounded-full bg-ink px-5 py-2 text-xs font-semibold text-white">Run</span>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-coral"><Check className="h-4 w-4" />Passed +25 XP</span>
        </div>
      </Frame>
    </Split>
  );
}
/* 5 ─ Skill progression */
export function Skills() {
  const [ref, seen] = useInView<HTMLDivElement>();
  return (
    <Split flip title="Know what you actually know." text="Eteral remembers what you've practiced, so you always see where you're strong and what to work on next. It's more than a course tracker.">
      <div ref={ref}>
        <Frame title="Skill progress">
          <div className="space-y-4">
            <Bar label="JavaScript" pct={78} seen={seen} />
            <Bar label="React" pct={61} seen={seen} />
            <Bar label="SQL" pct={69} seen={seen} />
            <Bar label="Git / GitHub" pct={88} seen={seen} />
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-mist pt-5 text-sm">
            {[['Challenges', '42'], ['Projects', '3'], ['Interview sessions', '11'], ['XP earned', '2,840']].map(([k, v]) => (
              <div key={k}><dt className="text-slatey">{k}</dt><dd className="text-lg font-semibold text-ink">{v}</dd></div>
            ))}
          </dl>
        </Frame>
      </div>
    </Split>
  );
}

/* 6 ─ Projects */
export function ProjectsSection() {
  return (
    <Split title="Turn skills into proof." text="Build projects based on your career path and track the skills you demonstrate through them.">
      <div className="space-y-4">
        <Frame title="Expense Tracker">
          <p className="text-sm text-slatey">React · Supabase · API · GitHub</p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink"><BadgeCheck className="h-4 w-4 text-coral" />Completed</p>
        </Frame>
        <Frame title="Portfolio Dashboard">
          <p className="text-sm text-slatey">React · Authentication · SQL</p>
          <div className="mt-3 h-2 rounded-full bg-mist/70"><div className="h-2 w-[72%] rounded-full bg-gradient-accent" /></div>
          <p className="mt-2 text-xs text-slatey">In progress · 72%</p>
        </Frame>
      </div>
    </Split>
  );
}

/* 7 ─ Interview */
export function Interview() {
  return (
    <Split flip title="Knowing the answer isn't enough. You need to explain it." text="Answer fresh interview questions out loud, then get feedback on clarity, filler words, structure, pace, and how well you explained the technical part.">
      <Frame title="Interview practice">
        <p className="text-sm text-slatey">Question</p>
        <p className="mt-1 text-base font-semibold text-ink">"Explain a technical problem you solved."</p>
        <p className="mt-4 text-sm text-slatey">Your answer</p>
        <p className="mt-1 rounded-lg bg-paper p-3 text-sm text-slatey">"So, um, our cart total was wrong, and I traced it to a rounding bug in…"</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          {[['Clarity', '84%'], ['Structure', '76%'], ['Filler words', '6'], ['Pace', 'Good']].map(([k, v]) => (
            <div key={k} className="rounded-lg bg-paper px-3 py-2"><dt className="text-slatey">{k}</dt><dd className="font-semibold text-ink">{v}</dd></div>
          ))}
        </dl>
      </Frame>
    </Split>
  );
}
/* 8 ─ Curated learning */
export function Curated() {
  const rows = [['JavaScript', 'MDN · freeCodeCamp · selected tutorials'], ['React', 'React documentation · MDN · selected resources']];
  return (
    <section className="bg-white/40 py-12 lg:py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Learn it somewhere. Prove it here.</h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-slatey">
          Eteral doesn't try to teach everything, because the internet already does. We point you to the best documentation, tutorials and creators for each skill, then make you demonstrate what you learned.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {rows.map(([k, v]) => (
            <div key={k} className="rounded-xl border border-mist bg-white p-5"><p className="font-semibold text-ink">{k}</p><p className="mt-1 text-sm text-slatey">{v}</p></div>
          ))}
        </div>
      </div>
    </section>
  );
}
/* 9 ─ Career profile */
export function CareerProfile() {
  return (
    <Split title="What do you have when you're done?" text="Not another certificate. Not \u201cI completed a React course,\u201d but \u201cI can demonstrate React\u201d: projects, GitHub, demonstrated skills, interview practice, and career evidence in one profile.">
      <Frame title="Your Eteral career profile">
        <p className="text-lg font-semibold text-ink">Frontend Developer</p>
        <p className="mt-1 text-sm text-slatey">React 82% · JavaScript 76% · Git 88% · Supabase 69%</p>
        <ul className="mt-5 grid grid-cols-2 gap-2 text-sm text-ink">
          {['63 challenges', '4 projects', 'GitHub connected', '18 interview sessions', '4,820 XP'].map((t) => (
            <li key={t} className="flex items-center gap-2"><Check className="h-4 w-4 text-coral" />{t}</li>
          ))}
        </ul>
        <p className="mt-5 rounded-lg bg-coral/10 px-3 py-2 text-xs font-medium text-coral">Building → Practicing → Interview ready</p>
      </Frame>
    </Split>
  );
}

/* 10 ─ Final CTA */
export function FinalCta() {
  return (
    <section className="py-12 lg:py-20">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-ink px-6 py-16 text-center sm:px-12">
        <div className="pointer-events-none absolute -top-16 -left-10 h-64 w-64 rounded-full bg-coral/30 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-16 right-0 h-64 w-64 rounded-full bg-sky/30 blur-[100px]" />
        <h2 className="relative text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
          Stop wondering if you're ready.
          <br />
          Start building the proof.
        </h2>
        <p className="relative mx-auto mt-5 max-w-md text-sm text-white/70">Take the quiz to get your readiness score and the one tool to use first.</p>
        <div className="relative mt-8"><QuizButton /></div>
        <p className="relative mt-4 text-xs text-white/50">Free · 30 seconds · No credit card required</p>
      </div>
    </section>
  );
}

/* ── Wire-up in App.tsx ──
   import { Hero, BeforeAfter, Path, Practice, Skills, ProjectsSection, Interview, Curated, CareerProfile, FinalCta } from './HomeSections';
   Delete the old Hero function, then in LandingPage:
   <main>
     <Hero /><BeforeAfter /><Path /><Curated /><Practice /><Skills /><ProjectsSection /><Interview /><CareerProfile />
     <Membership /><Freebies onNav={onNav} onRequireAuth={requireAuthForFreebie} /><Blog /><Trust /><FinalCta />
   </main>
   Header: make the desktop CTA <PrimaryButton onClick={() => navigate('/career-readiness')}>Take the Quiz</PrimaryButton>
   (and the mobile menu item), so the quiz is the primary action everywhere. */