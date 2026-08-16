import { scoreQuiz } from "./scoring.js";
import { buildLocalExplanations } from "./recommendations.js";
import { buildThirtyDayPlan } from "./actionPlan.js";
import { fetchAIEnhancedExplanations } from "../api/aiExplanations.js";

/**
 * Builds the full, final result object for the results screen.
 *
 * Core numbers (overallScore, categoryScores, readinessStage, strengths,
 * weaknesses, primaryBottleneck) are ALWAYS deterministic/local — see
 * scoring.js. AI is only ever used to reword/enhance explanation text,
 * and only if `useAI` is true and the request succeeds; otherwise the
 * result is identical in shape, just using local copy.
 */
export async function buildQuizResult(userAnswers, { useAI = false } = {}) {
  const scoreResult = scoreQuiz(userAnswers);
  const local = buildLocalExplanations(scoreResult);
  const thirtyDayPlan = buildThirtyDayPlan(scoreResult);

  let explanations = {
    primaryBottleneckExplanation: local.primaryBottleneckExplanation,
    weaknessDetails: local.weaknessDetails,
    strengthDetails: local.strengthDetails,
  };
  let recommendedActions = local.recommendedActions;
  let aiEnhanced = false;

  if (useAI) {
    try {
      const aiResult = await fetchAIEnhancedExplanations({
        overallScore: scoreResult.overallScore,
        readinessStage: scoreResult.readinessStage,
        categoryScores: scoreResult.categoryScores,
        strengths: scoreResult.strengths,
        weaknesses: scoreResult.weaknesses,
        primaryBottleneck: scoreResult.primaryBottleneck,
      });

      if (aiResult) {
        explanations = {
          primaryBottleneckExplanation:
            aiResult.primaryBottleneckExplanation ?? explanations.primaryBottleneckExplanation,
          weaknessDetails: mergeDetails(local.weaknessDetails, aiResult.weaknessExplanations),
          strengthDetails: mergeDetails(local.strengthDetails, aiResult.strengthExplanations),
        };
        recommendedActions = aiResult.recommendedActions?.length
          ? aiResult.recommendedActions
          : recommendedActions;
        aiEnhanced = true;
      }
      // aiResult === null (fetch failed / API unavailable) -> silently keep local copy.
    } catch {
      // Never let an AI failure block or corrupt the result. Local copy stands.
      aiEnhanced = false;
    }
  }

  return {
    overallScore: scoreResult.overallScore,
    readinessStage: scoreResult.readinessStage,
    readinessStageSummary: scoreResult.readinessStageSummary,
    categoryScores: scoreResult.categoryScores,
    strengths: explanations.strengthDetails,
    weaknesses: explanations.weaknessDetails,
    primaryBottleneck: {
      ...scoreResult.primaryBottleneck,
      explanation: explanations.primaryBottleneckExplanation,
    },
    recommendedActions,
    thirtyDayPlan,
    recommendedResourceIds: scoreResult.recommendedResourceIds,
    aiEnhanced,
  };
}

function mergeDetails(localDetails, aiTextById) {
  if (!aiTextById) return localDetails;
  return localDetails.map((d) => ({
    ...d,
    explanation: aiTextById[d.id] ?? d.explanation,
  }));
}
