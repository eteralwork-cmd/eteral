/**
 * Deterministic, human-written explanations and next actions per category.
 * Used as the guaranteed fallback when the AI explanation endpoint is
 * unavailable, disabled, or errors out — and as the default experience
 * when AI personalization isn't requested at all.
 */

export const CATEGORY_INSIGHTS = {
  careerClarity: {
    lowExplanation:
      "Your biggest gap isn't ability — it's direction. Without a clear target, it's hard to know which skills, projects, or applications actually move you forward, so effort gets spread thin.",
    highExplanation:
      "You have a clear sense of what you're aiming for, which makes every other part of your preparation more efficient.",
    action:
      "Pick 2-3 specific target roles and write one sentence on why each fits you.",
  },
  skillReadiness: {
    lowExplanation:
      "Your biggest gap isn't necessarily knowledge — it's applied practice. Skills that have only been studied, not used, are hard for you to speak to confidently and hard for an employer to verify.",
    highExplanation:
      "Your skills are backed by real practice, not just coursework, which gives you concrete things to point to.",
    action: "Pick one skill gap from a real job posting and practice it through a small, finished task.",
  },
  portfolioReadiness: {
    lowExplanation:
      "Your biggest gap isn't necessarily your knowledge. You don't yet have enough visible evidence of your abilities for employers to evaluate.",
    highExplanation:
      "You have visible, well-explained work that gives employers real evidence of what you can do.",
    action: "Finish and publish one project with a short write-up of the problem and your role.",
  },
  resumeReadiness: {
    lowExplanation:
      "Your biggest gap is translation, not experience. An outdated or generic resume undersells work you've likely already done.",
    highExplanation:
      "Your resume is current and tailored, so it's doing its job of representing your actual experience.",
    action: "Update your resume and tailor it to one specific job posting this week.",
  },
  professionalPresence: {
    lowExplanation:
      "Your biggest gap is discoverability. If a recruiter looked you up right now, there wouldn't be enough there to back up your resume.",
    highExplanation:
      "Your professional presence online reinforces your resume and makes you easy to verify.",
    action: "Complete your LinkedIn (or equivalent) profile and align it with your target roles.",
  },
  interviewReadiness: {
    lowExplanation:
      "Your biggest gap is rehearsal, not competence. Without practiced answers and mock reps, strong experience can come across unclear in the room.",
    highExplanation:
      "You're able to talk through your experience clearly and with specific examples, which is what interviews actually test.",
    action: "Do one mock interview and prepare specific examples for the 5 most common behavioral questions.",
  },
  jobSearchReadiness: {
    lowExplanation:
      "Your biggest gap is consistency and system, not effort. A scattered, untracked search makes it hard to apply enough, follow up, or learn what's working.",
    highExplanation:
      "You run a consistent, tracked job search, which compounds over time far better than sporadic applications.",
    action: "Set a weekly application target and track it in one place, including one networking outreach.",
  },
  organization: {
    lowExplanation:
      "Your biggest gap is follow-through, not intention. Without a written plan and a way to track it, career prep tends to lose to whatever feels urgent that day.",
    highExplanation:
      "You have a plan you actually track, which is what turns career prep into steady progress instead of good intentions.",
    action: "Write a simple weekly plan for career prep and put it somewhere you'll actually see it.",
  },
  professionalGrowth: {
    lowExplanation:
      "Your biggest gap is feedback and network, not effort. Improving in private, without outside input, is slower and easier to misjudge.",
    highExplanation:
      "You actively seek feedback and build relationships, which accelerates everything else you're working on.",
    action: "Ask one person for specific feedback on your resume, a project, or a practice interview.",
  },
};

/**
 * Builds the "Recommended Next Steps" list (exactly 3) from the weakest
 * categories, and the practical, non-generic explanation text used on the
 * results screen.
 */
export function buildLocalExplanations(scoreResult) {
  const { weaknesses, strengths } = scoreResult;

  const weaknessDetails = weaknesses.map((w) => ({
    ...w,
    explanation: CATEGORY_INSIGHTS[w.id]?.lowExplanation ?? "",
  }));

  const strengthDetails = strengths.map((s) => ({
    ...s,
    explanation: CATEGORY_INSIGHTS[s.id]?.highExplanation ?? "",
  }));

  const recommendedActions = weaknesses
    .slice(0, 3)
    .map((w) => CATEGORY_INSIGHTS[w.id]?.action)
    .filter(Boolean);

  const primaryBottleneckExplanation =
    CATEGORY_INSIGHTS[scoreResult.primaryBottleneck.id]?.lowExplanation ?? "";

  return {
    weaknessDetails,
    strengthDetails,
    recommendedActions,
    primaryBottleneckExplanation,
  };
}
