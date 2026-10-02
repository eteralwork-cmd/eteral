import { useEffect, useMemo, useState, useRef } from "react";
import { QUESTIONS, TOTAL_QUESTIONS } from "../data/questions.js";
import { isQuizComplete } from "../lib/scoring.js";
import { buildQuizResult } from "../lib/resultBuilder.js";
import ProgressBar from "./ProgressBar.jsx";
import QuestionCard from "./QuestionCard.jsx";
import ResultScreen from "./ResultScreen.jsx";
import { supabase } from "@/lib/supabase";
import { MembershipProvider } from "@/lib/membership";

/**
 * Self-contained Onboarding Quiz.
 *
 * 7 short questions, ~30 seconds. Results are computed locally as soon
 * as the user finishes, but held behind a "locked" screen until they
 * sign up. After sign-up, results are saved to onboarding_quiz_results
 * and displayed.
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

  const STORAGE_KEY = "crq_quiz_state";

  function handleSelect(questionId, value) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  const savedRef = useRef(false);

  async function handleNext() {
    if (!hasAnsweredCurrent) return;

    if (isLastQuestion) {
      setStage("loading");
      try {
        const built = await buildQuizResult(answers);
        setResult(built);
        setStage(isAuthenticated ? "results" : "locked");

        if (isAuthenticated && !savedRef.current) {
          savedRef.current = true;
          try {
            const { data: session } = await supabase.auth.getSession();
            if (session.session) {
              await supabase.from("onboarding_quiz_results").insert({
                target_track: built.targetTrack,
                skill_level: built.skillLevel,
                project_evidence: built.projectEvidence,
                starting_point: built.recommendedStart,
                weekly_hours: built.weeklyHours,
                timeline: built.timeline,
                overall_score: built.overallScore,
                readiness_stage: built.readinessStage,
                recommended_start: built.recommendedStart,
                weekly_pace: built.weeklyPace,
                answers: answers,
              });
            }
          } catch (e) {
            console.error("Failed to save onboarding quiz results:", e);
          }
        }
      } catch {
        setStage("error");
      }
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  function handleBack() {
    if (!isFirstQuestion) {
      setCurrentIndex((i) => i - 1);
    }
  }

  // restore on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAnswers(parsed.answers ?? {});
        setResult(parsed.result ?? null);
        if (parsed.result) {
          setStage(isAuthenticated ? "results" : "locked");
        }
      } catch {}
    }
  }, []); // run once

  // persist whenever answers/result change meaningfully
  useEffect(() => {
    if (result) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, result }));
    }
  }, [answers, result]);

  function handleRestart() {
    sessionStorage.removeItem(STORAGE_KEY);
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
    savedRef.current = false;
    setStage("intro");
  }

  function handleRetry() {
    setStage("quiz");
  }

  return (
    <MembershipProvider>
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
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-0 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 transition-colors"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={!hasAnsweredCurrent}
                className="rounded-xl bg-coral px-5 py-2.5 text-sm font-semibold text-white hover:bg-coral/90 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 transition-colors"
              >
                {isLastQuestion ? "See my results" : "Next"}
              </button>
            </div>
          </div>
        )}

        {stage === "loading" && (
          <div className="flex flex-col items-center justify-center py-24 text-center" role="status" aria-live="polite">
            <div className="h-8 w-8 rounded-full border-2 border-slate-200 border-t-coral animate-spin mb-4" />
            <p className="text-slate-500 text-sm">Building your onboarding plan…</p>
          </div>
        )}

        {stage === "locked" && (
          <div className="text-center py-16" role="status" aria-live="polite">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-coral text-white text-2xl">
              🔒
            </div>
            <h2 className="mt-5 text-xl font-semibold text-slate-900">Your results are ready</h2>
            <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
              Create a free account to see your skill level, your starting point, and your first-week plan.
            </p>
            <button
              type="button"
              onClick={() => onRequireAuth?.()}
              className="mt-6 rounded-xl bg-coral px-6 py-3 text-sm font-semibold text-white hover:bg-coral/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 transition-colors"
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
              className="rounded-xl bg-coral px-5 py-2.5 text-sm font-semibold text-white hover:bg-coral/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 transition-colors"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </MembershipProvider>
  );
}

function IntroScreen({ onStart }) {
  return (
    <div className="text-center py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
        Where should you start?
      </h1>
      <p className="text-slate-600 max-w-md mx-auto mb-8">
        Answer {TOTAL_QUESTIONS} quick questions about your skills, direction, and goals. We'll figure out your level, where to begin, and how fast to go.
      </p>
      <p className="text-xs text-slate-400 mb-8">
        {TOTAL_QUESTIONS} questions · about 30 seconds · no email required to start
      </p>
      <button
        type="button"
        onClick={onStart}
        className="rounded-xl bg-coral px-6 py-3 text-sm font-semibold text-white hover:bg-coral/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 transition-colors"
      >
        Start
      </button>
    </div>
  );
}
