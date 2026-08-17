import { useEffect, useMemo, useState } from "react";
import { QUESTIONS, TOTAL_QUESTIONS } from "../data/questions.js";
import { isQuizComplete } from "../lib/scoring.js";
import { buildQuizResult } from "../lib/resultBuilder.js";
import ProgressBar from "./ProgressBar.jsx";
import QuestionCard from "./QuestionCard.jsx";
import ResultScreen from "./ResultScreen.jsx";

/**
 * Self-contained Career Readiness Assessment.
 *
 * Auth gating (optional): pass `isAuthenticated` + `onRequireAuth` to require
 * sign-up before results are revealed. The quiz still computes the score
 * locally as soon as they finish — it just holds the result screen back
 * until `isAuthenticated` is true. If these props are omitted, results show
 * immediately (original behavior).
 */
export default function CareerReadinessQuiz({
  useAI = false,
  className = "",
  isAuthenticated = true,
  onRequireAuth,
}) {
  const [stage, setStage] = useState("intro"); // intro | quiz | loading | locked | results | error
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const currentQuestion = QUESTIONS[currentIndex];
  const isLastQuestion = currentIndex === TOTAL_QUESTIONS - 1;
  const isFirstQuestion = currentIndex === 0;
  const hasAnsweredCurrent = typeof answers[currentQuestion?.id] === "number";

  const canSubmit = useMemo(() => isQuizComplete(answers), [answers]);

  // If the user finishes signup/login while the "locked" screen is showing,
  // automatically reveal the already-computed results.
  useEffect(() => {
    if (stage === "locked" && isAuthenticated && result) {
      setStage("results");
    }
  }, [isAuthenticated, stage, result]);

  function handleSelect(questionId, value) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function handleNext() {
    if (!hasAnsweredCurrent) return;
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentIndex((i) => Math.min(i + 1, TOTAL_QUESTIONS - 1));
    }
  }

  function handleBack() {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setStage("loading");
    try {
      const finalResult = await buildQuizResult(answers, { useAI });
      setResult(finalResult);

      if (isAuthenticated) {
        setStage("results");
      } else {
        setStage("locked");
        onRequireAuth?.();
      }
    } catch (err) {
      console.error("Career Readiness Quiz: failed to build result", err);
      setStage("error");
    }
  }

  function handleRestart() {
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
    setStage("intro");
  }

  function handleRetry() {
    setStage("quiz");
  }

  return (
    <div className={`crq-root max-w-2xl mx-auto px-4 py-8 sm:py-12 ${className}`}>
      {stage === "intro" && <IntroScreen onStart={() => setStage("quiz")} />}

      {stage === "quiz" && (
        <div>
          <ProgressBar current={currentIndex + 1} total={TOTAL_QUESTIONS} />

          <div className="mt-8 rounded-2xl border border-slate-200 p-5 sm:p-7">
            <QuestionCard
              question={currentQuestion}
              selectedValue={answers[currentQuestion.id]}
              onSelect={handleSelect}
            />
          </div>

          <div className="flex items-center justify-between mt-6 gap-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={isFirstQuestion}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-0 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors"
            >
              Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!hasAnsweredCurrent}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors"
            >
              {isLastQuestion ? "See my results" : "Next"}
            </button>
          </div>
        </div>
      )}

      {stage === "loading" && (
        <div className="flex flex-col items-center justify-center py-24 text-center" role="status" aria-live="polite">
          <div className="h-8 w-8 rounded-full border-2 border-slate-200 border-t-indigo-600 animate-spin mb-4" />
          <p className="text-slate-500 text-sm">Calculating your results…</p>
        </div>
      )}

      {stage === "locked" && (
        <div className="text-center py-16" role="status" aria-live="polite">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white text-2xl">
            🔒
          </div>
          <h2 className="mt-5 text-xl font-semibold text-slate-900">Your results are ready</h2>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
            Create a free account to see your Career Readiness score, your biggest gaps, and your
            30-day action plan.
          </p>
          <button
            type="button"
            onClick={() => onRequireAuth?.()}
            className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors"
          >
            Sign up to see my results
          </button>
        </div>
      )}

      {stage === "results" && result && (
        <ResultScreen result={result} onRestart={handleRestart} />
      )}

      {stage === "error" && (
        <div className="text-center py-20" role="alert">
          <p className="text-slate-900 font-semibold mb-2">Something went wrong</p>
          <p className="text-slate-500 text-sm mb-6">
            We couldn't calculate your results just now. Your answers are still saved — you can
            try again.
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

function IntroScreen({ onStart }) {
  return (
    <div className="text-center py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
        Eteral Career Readiness Assessment
      </h1>
      <p className="text-slate-600 max-w-md mx-auto mb-8">
        Find out where you stand, identify your biggest career gaps, and discover what you should
        work on next.
      </p>
      <p className="text-xs text-slate-400 mb-8">
        {TOTAL_QUESTIONS} questions · about 5-7 minutes · no email or personal info required
      </p>
      <button
        type="button"
        onClick={onStart}
        className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors"
      >
        Start Assessment
      </button>
    </div>
  );
}