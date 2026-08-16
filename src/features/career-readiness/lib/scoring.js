import { QUESTIONS } from "../data/questions.js";
import { CATEGORIES, CATEGORY_IDS, getReadinessStage } from "../data/categories.js";

const MAX_OPTION_VALUE = 3;

/**
 * userAnswers shape: { [questionId]: number (0-3) }
 *
 * All scoring here is deterministic and local — it must never depend on
 * network/API availability. This is the ONLY function that should be
 * treated as the source of truth for scores.
 */
export function scoreQuiz(userAnswers) {
  const categoryScores = {};
  const categoryQuestionCounts = {};

  for (const id of CATEGORY_IDS) {
    categoryScores[id] = 0;
    categoryQuestionCounts[id] = 0;
  }

  // Sum raw answer values per category
  const categoryRawTotals = {};
  for (const id of CATEGORY_IDS) categoryRawTotals[id] = 0;

  for (const question of QUESTIONS) {
    const answerValue = userAnswers[question.id];
    categoryQuestionCounts[question.category] += 1;

    if (typeof answerValue === "number" && answerValue >= 0 && answerValue <= MAX_OPTION_VALUE) {
      categoryRawTotals[question.category] += answerValue;
    }
    // Unanswered questions contribute 0 — they should not happen in a
    // completed quiz (UI should block submit until all are answered),
    // but scoring stays safe/deterministic either way.
  }

  for (const id of CATEGORY_IDS) {
    const maxPossible = categoryQuestionCounts[id] * MAX_OPTION_VALUE;
    categoryScores[id] =
      maxPossible > 0 ? Math.round((categoryRawTotals[id] / maxPossible) * 100) : 0;
  }

  const overallScore = computeOverallScore(categoryScores);
  const readinessStage = getReadinessStage(overallScore);

  const ranked = rankCategories(categoryScores);
  const strengths = ranked.slice(0, 3);
  const weaknesses = ranked.slice(-3).reverse(); // lowest first

  const primaryBottleneck = weaknesses[0];

  const recommendedResourceIds = weaknesses.map((w) => {
    const cat = CATEGORIES.find((c) => c.id === w.id);
    return cat.resourceId;
  });

  return {
    overallScore,
    readinessStage: readinessStage.label,
    readinessStageId: readinessStage.id,
    readinessStageSummary: readinessStage.summary,
    categoryScores,
    strengths,
    weaknesses,
    primaryBottleneck,
    recommendedResourceIds,
  };
}

function computeOverallScore(categoryScores) {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const category of CATEGORIES) {
    const score = categoryScores[category.id] ?? 0;
    weightedSum += score * category.weight;
    totalWeight += category.weight;
  }

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

function rankCategories(categoryScores) {
  return CATEGORIES.map((category) => ({
    id: category.id,
    label: category.label,
    score: categoryScores[category.id] ?? 0,
  })).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Deterministic tie-break: keep declared category order stable
    return CATEGORY_IDS.indexOf(a.id) - CATEGORY_IDS.indexOf(b.id);
  });
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
