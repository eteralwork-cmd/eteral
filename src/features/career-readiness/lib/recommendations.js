import {
  TRACK_LABELS,
  START_POINT_LABELS,
  WEEKLY_PACE_LABELS,
} from "../data/categories.js";

/**
 * Builds human-readable insight text for the onboarding quiz results screen.
 * All deterministic and local — no AI dependency.
 */

export function buildLocalExplanations(scoreResult) {
  const trackLabel = TRACK_LABELS[scoreResult.targetTrack] ?? "your chosen direction";

  const stageExplanation = scoreResult.readinessStageSummary;

  // --- Starting point explanation ---
  const startPointLabel = START_POINT_LABELS[scoreResult.recommendedStart] ?? "Get started";
  const startPointExplanation = buildStartPointExplanation(
    scoreResult.recommendedStart,
    scoreResult.skillLevel,
    trackLabel
  );

  // --- Weekly pace ---
  const weeklyPace = WEEKLY_PACE_LABELS[scoreResult.weeklyHours] ?? "Steady";
  const paceExplanation = buildPaceExplanation(scoreResult.weeklyHours);

  // --- Recommended actions (3-4 for first week) ---
  const recommendedActions = buildRecommendedActions(
    scoreResult.recommendedStart,
    scoreResult.skillLevel,
    trackLabel
  );

  return {
    trackLabel,
    startPointLabel,
    startPointExplanation,
    weeklyPace,
    paceExplanation,
    stageExplanation,
    recommendedActions,
  };
}

function buildStartPointExplanation(startPoint, skillLevel, trackLabel) {
  switch (startPoint) {
    case "learn":
      return skillLevel === 0
        ? `Start with guided learning in ${trackLabel}. You'll build the core skills you need before moving on to projects and practice.`
        : `Brush up on key ${trackLabel} skills through guided resources, then jump into practice challenges to test what you know.`;
    case "practice":
      return `Jump into coding challenges tuned for ${trackLabel}. Each one sharpens a specific skill and earns you XP. Start easy and work your way up.`;
    case "projects":
      return `Start building real projects in ${trackLabel}. Pick an idea, build it, document it, and add it to your portfolio as proof of what you can do.`;
    case "interviews":
      return `You're ready to focus on interview prep. Practice explaining your projects and answering common ${trackLabel} interview questions out loud.`;
    default:
      return `Start with the basics in ${trackLabel} and build from there.`;
  }
}

function buildPaceExplanation(hoursKey) {
  switch (hoursKey) {
    case "few_hours":
      return "Aim for 2-3 short sessions per week. Consistency matters more than volume — even 30 focused minutes moves you forward.";
    case "5_10_hours":
      return "Aim for 4-5 sessions per week. This is a steady pace that builds real momentum without burning you out.";
    case "10_20_hours":
      return "You're committing seriously. Aim for daily practice with a mix of learning, building, and reviewing. Track your progress weekly.";
    case "20_plus_hours":
      return "Full-speed mode. Treat this like a part-time job — daily learning, daily building, and weekly reviews. You can move fast at this pace.";
    default:
      return "Aim for consistent weekly sessions and track your progress.";
  }
}

function buildRecommendedActions(startPoint, skillLevel, trackLabel) {
  const actions = [];

  switch (startPoint) {
    case "learn":
      actions.push(`Open the Skill Track for ${trackLabel} and add 2-3 core skills to your learning path.`);
      actions.push("Complete one learning resource or tutorial this week.");
      if (skillLevel === 0) {
        actions.push("Try your first easy coding challenge to get a feel for practical practice.");
      } else {
        actions.push("Take a coding challenge at your level to verify what you already know.");
      }
      break;
    case "practice":
      actions.push("Open the Coding Space and complete 3 challenges at your current difficulty level.");
      actions.push("Review any challenges you fail and retry them before moving on.");
      actions.push(`Add one ${trackLabel} skill you struggled with to your Skill Track for focused learning.`);
      break;
    case "projects":
      actions.push("Open the Projects page and start your first project with a clear scope.");
      actions.push("Document the problem you're solving and your role as you build.");
      actions.push("Push your work to GitHub so it's visible and linkable from your profile.");
      break;
    case "interviews":
      actions.push("Open the Interview Prep section and answer your first practice question out loud.");
      actions.push("Review your recording — note filler words, clarity, and structure.");
      actions.push("Prepare a 60-second 'tell me about yourself' using your projects as evidence.");
      break;
    default:
      actions.push("Start with the Skill Track to map out what to learn first.");
  }

  actions.push("Check your dashboard tomorrow for your daily task and keep your streak alive.");
  return actions;
}
