/**
 * Client-side service for the OPTIONAL AI-personalization layer.
 *
 * IMPORTANT:
 * - This only ever asks the AI to reword/personalize explanation text.
 * - It never sends full quiz answers, only the already-computed scores
 *   and category labels (the minimum needed for a useful explanation).
 * - The API key lives server-side only (see /server/career-readiness-ai).
 *   This file never touches a key.
 * - Any failure (network error, timeout, non-200, malformed response)
 *   resolves to `null`. Callers (resultBuilder.js) treat `null` as
 *   "use local deterministic copy" — the UI never blocks on this.
 */

const AI_ENDPOINT = "/api/career-readiness/explain";
const REQUEST_TIMEOUT_MS = 8000;

export async function fetchAIEnhancedExplanations(payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const data = await response.json();

    // Basic shape check — if the server sent something unexpected, fall back.
    if (typeof data !== "object" || data === null) return null;

    return {
      primaryBottleneckExplanation:
        typeof data.primaryBottleneckExplanation === "string"
          ? data.primaryBottleneckExplanation
          : undefined,
      weaknessExplanations:
        typeof data.weaknessExplanations === "object" ? data.weaknessExplanations : undefined,
      strengthExplanations:
        typeof data.strengthExplanations === "object" ? data.strengthExplanations : undefined,
      recommendedActions: Array.isArray(data.recommendedActions)
        ? data.recommendedActions.slice(0, 3)
        : undefined,
    };
  } catch {
    // Network error, timeout, abort, JSON parse error — all fall back silently.
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
