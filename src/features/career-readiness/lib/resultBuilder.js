import { scoreQuiz } from "./scoring.js";
import { buildLocalExplanations } from "./recommendations.js";
import { buildFirstWeekPlan } from "./actionPlan.js";

/**
 * Builds the full result object for the onboarding quiz results screen.
 *
 * No AI layer — everything is deterministic and local.
 * The result shape changed from the old assessment: it now carries
 * onboarding overview fields instead of category breakdowns.
 */
export async function buildQuizResult(userAnswers) {
  const scoreResult = scoreQuiz(userAnswers);
  const insights = buildLocalExplanations(scoreResult);
  const firstWeekPlan = buildFirstWeekPlan(scoreResult);

  return {
    overallScore: scoreResult.overallScore,
    readinessStage: scoreResult.readinessStage,
    readinessStageId: scoreResult.readinessStageId,
    readinessStageSummary: insights.stageExplanation,
    targetTrack: scoreResult.targetTrack,
    trackLabel: insights.trackLabel,
    skillLevel: scoreResult.skillLevel,
    projectEvidence: scoreResult.projectEvidence,
    recommendedStart: scoreResult.recommendedStart,
    startPointLabel: insights.startPointLabel,
    startPointExplanation: insights.startPointExplanation,
    weeklyPace: insights.weeklyPace,
    paceExplanation: insights.paceExplanation,
    weeklyHours: scoreResult.weeklyHours,
    timeline: scoreResult.timeline,
    recommendedActions: insights.recommendedActions,
    firstWeekPlan,
  };
}
