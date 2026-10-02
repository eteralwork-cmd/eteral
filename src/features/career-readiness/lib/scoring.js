import { QUESTIONS } from "../data/questions.js";
import { getReadinessStage } from "../data/categories.js";

const MAX_OPTION_VALUE = 3;

/**
 * Scores the onboarding quiz answers.
 *
 * Unlike the old 9-category assessment, this produces:
 *  - overallScore (0-100): weighted blend of skill level, project evidence, and timeline
 *  - readinessStage: label from READINESS_STAGES
 *  - targetTrack: career direction from q2/q2b
 *  - recommendedStart: which Eteral feature to use first (smart-redirected if beginner picks advanced start)
 *  - weeklyPace: pace label from hours commitment
 *  - startPoint, weeklyHours, timeline: raw answer metadata for saving
 *
 * userAnswers shape: { [questionId]: number (0-3) }
 */
export function scoreQuiz(userAnswers) {
  const skillLevel = userAnswers["q3"] ?? 0;
  const projectEvidence = userAnswers["q4"] ?? 0;
  const timeline = userAnswers["q7"] ?? 0;

  // --- Overall score ---
  // 50% skill level, 30% project evidence, 20% timeline urgency
  const skillPct = (skillLevel / MAX_OPTION_VALUE) * 100;
  const projectPct = (projectEvidence / MAX_OPTION_VALUE) * 100;
  const timelinePct = (timeline / MAX_OPTION_VALUE) * 100;
  const overallScore = Math.round(skillPct * 0.5 + projectPct * 0.3 + timelinePct * 0.2);

  const readinessStage = getReadinessStage(overallScore);

  // --- Target track ---
  // q2b overrides q2 if the user picked a design/product/undecided option with value >= 0
  // and q2b's track is not null. If q2b picked "I picked my direction above" (track=null),
  // fall back to q2's track.
  const q2Option = QUESTIONS.find((q) => q.id === "q2")?.options[userAnswers["q2"]];
  const q2bOption = QUESTIONS.find((q) => q.id === "q2b")?.options[userAnswers["q2b"]];
  const targetTrack =
    q2bOption && q2bOption.track !== null && q2bOption.track !== undefined
      ? q2bOption.track
      : q2Option?.track ?? "undecided";

  // --- Starting point (with smart redirect for beginners) ---
  const q5Option = QUESTIONS.find((q) => q.id === "q5")?.options[userAnswers["q5"]];
  let startPoint = q5Option?.startPoint ?? "learn";

  // If a beginner (skill level 0) picks projects or interviews, redirect to learn first
  if (skillLevel === 0 && (startPoint === "projects" || startPoint === "interviews")) {
    startPoint = "learn";
  }
  // If skill level 0-1 picks practice, still allow it but note they should learn too
  if (skillLevel <= 1 && startPoint === "interviews") {
    startPoint = "practice";
  }

  // --- Weekly hours ---
  const q6Option = QUESTIONS.find((q) => q.id === "q6")?.options[userAnswers["q6"]];
  const weeklyHours = q6Option?.hoursKey ?? "few_hours";

  // --- Timeline ---
  const q7Option = QUESTIONS.find((q) => q.id === "q7")?.options[userAnswers["q7"]];
  const timelineKey = q7Option?.timelineKey ?? "no_rush";

  return {
    overallScore,
    readinessStage: readinessStage.label,
    readinessStageId: readinessStage.id,
    readinessStageSummary: readinessStage.summary,
    skillLevel,
    projectEvidence,
    targetTrack,
    startPoint,
    weeklyHours,
    timeline: timelineKey,
    recommendedStart: startPoint,
  };
}

export function isQuizComplete(userAnswers) {
  return QUESTIONS.every(
    (q) =>
      typeof userAnswers[q.id] === "number" &&
      userAnswers[q.id] >= 0 &&
      userAnswers[q.id] <= MAX_OPTION_VALUE
  );
}

export function answeredCount(userAnswers) {
  return QUESTIONS.filter((q) => typeof userAnswers[q.id] === "number").length;
}
