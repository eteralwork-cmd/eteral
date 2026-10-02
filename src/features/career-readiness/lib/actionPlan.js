/**
 * Builds a simple "Your First Week" plan from the recommended starting point.
 * Replaces the old 30-day, 4-week plan that was too detailed for a 30-second quiz.
 */

export function buildFirstWeekPlan(scoreResult) {
  const { recommendedStart, skillLevel } = scoreResult;

  const plans = {
    learn: [
      "Day 1-2: Add 2-3 core skills to your Skill Track",
      "Day 3-4: Complete one learning resource or tutorial",
      "Day 5: Try your first easy coding challenge",
      "Day 6-7: Review what you learned and plan next week",
    ],
    practice: [
      "Day 1-2: Complete 2 coding challenges at your level",
      "Day 3: Review failed challenges and retry",
      "Day 4-5: Complete 2 more challenges, try a harder one",
      "Day 6-7: Add weak spots to your Skill Track",
    ],
    projects: [
      "Day 1: Pick a project idea and write down the scope",
      "Day 2-3: Build the core functionality",
      "Day 4-5: Polish and write a short description",
      "Day 6-7: Push to GitHub and link from your dashboard",
    ],
    interviews: [
      "Day 1: Answer your first interview question out loud",
      "Day 2: Review the recording and note improvements",
      "Day 3-4: Practice 2 more questions with specific examples",
      "Day 5-7: Refine your 'tell me about yourself' answer",
    ],
  };

  return plans[recommendedStart] ?? plans.learn;
}
