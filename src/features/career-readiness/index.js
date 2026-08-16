import { CATEGORIES } from "../data/categories.js";
import CategoryBar from "./components/CategoryBar.jsx";

export default function ResultScreen({ result, onRestart }) {
  const {
    overallScore,
    readinessStage,
    readinessStageSummary,
    categoryScores,
    strengths,
    weaknesses,
    primaryBottleneck,
    recommendedActions,
    thirtyDayPlan,
  } = result;

  return (
    <div className="crq-results max-w-2xl mx-auto" aria-live="polite">
      {/* Overall score */}
      <section className="text-center mb-8">
        <p className="text-sm font-medium text-indigo-600 uppercase tracking-wide mb-2">
          Your Career Readiness Result
        </p>
        <div className="text-6xl font-bold text-slate-900 tabular-nums">{overallScore}</div>
        <div className="text-slate-500 mb-3">out of 100</div>
        <div className="inline-block rounded-full bg-indigo-50 text-indigo-700 font-semibold px-4 py-1.5 text-sm">
          {readinessStage}
        </div>
        <p className="text-slate-600 mt-3 max-w-md mx-auto text-sm sm:text-base">
          {readinessStageSummary}
        </p>
        <p className="text-xs text-slate-400 mt-3 max-w-md mx-auto">
          This score reflects your current preparation habits, not a guarantee of employment
          outcomes.
        </p>
      </section>

      {/* Category breakdown */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Category Breakdown</h2>
        <div className="flex flex-col gap-4">
          {CATEGORIES.map((cat) => (
            <CategoryBar key={cat.id} label={cat.label} score={categoryScores[cat.id]} />
          ))}
        </div>
      </section>

      {/* Strengths */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Your Strengths</h2>
        <ul className="flex flex-col gap-3">
          {strengths.map((s) => (
            <li key={s.id} className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-emerald-900">{s.label}</span>
                <span className="text-emerald-700 text-sm tabular-nums">{s.score}/100</span>
              </div>
              {s.explanation && <p className="text-sm text-emerald-800">{s.explanation}</p>}
            </li>
          ))}
        </ul>
      </section>

      {/* Weaknesses */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Your Biggest Gaps</h2>
        <ul className="flex flex-col gap-3">
          {weaknesses.map((w) => (
            <li key={w.id} className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-amber-900">{w.label}</span>
                <span className="text-amber-700 text-sm tabular-nums">{w.score}/100</span>
              </div>
              {w.explanation && <p className="text-sm text-amber-800">{w.explanation}</p>}
            </li>
          ))}
        </ul>
      </section>

      {/* Priority */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Your #1 Priority</h2>
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
          <p className="font-semibold text-indigo-900 mb-1">{primaryBottleneck.label}</p>
          <p className="text-sm text-indigo-800">{primaryBottleneck.explanation}</p>
        </div>
      </section>

      {/* Next steps */}
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

      {/* 30-day plan */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Your 30-Day Action Plan</h2>
        <div className="flex flex-col gap-3">
          {thirtyDayPlan.map((week) => (
            <div key={week.week} className="rounded-xl border border-slate-200 p-4">
              <p className="font-semibold text-slate-900 text-sm mb-2">{week.week}</p>
              <ul className="flex flex-col gap-1.5">
                {week.tasks.map((task, i) => (
                  <li key={i} className="text-sm text-slate-600 flex gap-2">
                    <span aria-hidden="true">•</span>
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <button
        type="button"
        onClick={onRestart}
        className="w-full rounded-xl border border-slate-300 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors"
      >
        Restart Assessment
      </button>
    </div>
  );
}
