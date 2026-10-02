import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Rocket, Clock, Target, CheckCircle2, LayoutDashboard } from "lucide-react";
import { useMembership } from "@/lib/membership";
import { useAuth } from "@/lib/auth";

function CtaSection() {
  const { isStandard } = useMembership();

  if (isStandard) {
    return (
      <section className="mb-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-white p-6 sm:p-7">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
            You're a Standard member
          </span>
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
         Your dashboard is ready for you
        </h2>
        <p className="text-sm text-slate-600 mb-5 max-w-md">
          Head to your dashboard to start practicing, building projects, and tracking your progress with all Standard tools unlocked.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
        >
          Go to Dashboard
          <LayoutDashboard className="h-4 w-4" />
        </Link>
      </section>
    );
  }

  return (
    <section className="mb-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 sm:p-7">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-4 w-4 text-coral" />
        <span className="text-xs font-semibold uppercase tracking-wide text-coral">
          Eteral Standard Membership
        </span>
      </div>
      <h2 className="text-lg font-semibold text-slate-900 mb-2">
        Close your gaps with the right tools
      </h2>
      <p className="text-sm text-slate-600 mb-5 max-w-md">
        Your results show where to start. Standard membership gives you coding challenges, project tracking, interview practice, and a guided skill path — everything you need to go from where you are to job-ready.
      </p>
      <Link
        to="/membership"
        className="inline-flex items-center gap-1.5 rounded-xl bg-coral px-6 py-3 text-sm font-semibold text-white hover:bg-coral/90 transition-colors"
      >
        Get Standard — $6/month
        <ArrowRight className="h-4 w-4" />
      </Link>
      <p className="mt-3 text-xs text-slate-400">
        Cancel anytime. Everything above is available the moment you join.
      </p>
    </section>
  );
}

export default function ResultScreen({ result, onRestart }) {
  const {
    overallScore,
    readinessStage,
    readinessStageSummary,
    trackLabel,
    startPointLabel,
    startPointExplanation,
    weeklyPace,
    paceExplanation,
    recommendedActions,
    firstWeekPlan,
  } = result;

  return (
    <div className="crq-results max-w-2xl mx-auto" aria-live="polite">
      {/* Overall score */}
      <section className="text-center mb-8">
        <p className="text-sm font-medium text-coral uppercase tracking-wide mb-2">
          Your Onboarding Result
        </p>
        <div className="text-6xl font-bold text-slate-900 tabular-nums">{overallScore}</div>
        <div className="text-slate-500 mb-3">out of 100</div>
        <div className="inline-block rounded-full bg-coral/10 text-coral font-semibold px-4 py-1.5 text-sm">
          {readinessStage}
        </div>
        <p className="text-slate-600 mt-3 max-w-md mx-auto text-sm sm:text-base">
          {readinessStageSummary}
        </p>
      </section>

      {/* Starting Point */}
      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-5 w-5 text-coral" />
          <h2 className="text-lg font-semibold text-slate-900">Your Starting Point</h2>
        </div>
        <p className="text-base font-semibold text-slate-900 mb-2">{startPointLabel}</p>
        <p className="text-sm text-slate-600 leading-relaxed">{startPointExplanation}</p>
      </section>

      {/* Target Track + Weekly Pace side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="h-4 w-4 text-coral" />
            <h3 className="text-sm font-semibold text-slate-900">Your Direction</h3>
          </div>
          <p className="text-base font-semibold text-slate-900">{trackLabel}</p>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-coral" />
            <h3 className="text-sm font-semibold text-slate-900">Weekly Pace</h3>
          </div>
          <p className="text-base font-semibold text-slate-900">{weeklyPace}</p>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{paceExplanation}</p>
        </section>
      </div>

      {/* First week plan */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Your First Week</h2>
        <div className="rounded-2xl border border-slate-200 p-5">
          <ul className="flex flex-col gap-2.5">
            {firstWeekPlan.map((task, i) => (
              <li key={i} className="text-sm text-slate-700 flex gap-3 items-start">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-coral/10 text-coral text-xs font-semibold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="pt-0.5">{task}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Recommended actions */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Recommended Next Steps</h2>
        <ol className="flex flex-col gap-2">
          {recommendedActions.map((action, i) => (
            <li key={i} className="flex gap-3 items-start rounded-xl border border-slate-200 p-4">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center justify-center">
                {i + 1}
              </span>
              <span className="text-sm text-slate-700 pt-0.5">{action}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA — membership upsell or dashboard link */}
      <CtaSection />

      <button
        type="button"
        onClick={onRestart}
        className="w-full rounded-xl border border-slate-300 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 transition-colors"
      >
        Retake Quiz
      </button>
    </div>
  );
}
