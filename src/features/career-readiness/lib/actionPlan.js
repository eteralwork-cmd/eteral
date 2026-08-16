/**
 * Deterministic 30-day plan, built from the user's 2 weakest categories.
 * Each category has a 4-step progression (Foundation -> Build -> Improve ->
 * Execute) matching the required week structure. No AI dependency.
 */

const CATEGORY_PLAN_STEPS = {
  careerClarity: [
    "List 5 job titles that sound interesting and read 3 real postings for each.",
    "Narrow to 2-3 target roles and write one sentence on why each fits you.",
    "Talk to one person working in a target role about their day-to-day.",
    "Write a one-line pitch of what you're targeting and why — use it going forward.",
  ],
  skillReadiness: [
    "Pick one in-demand skill from a real posting in your target roles.",
    "Complete a focused tutorial or course module on that skill.",
    "Apply the skill in a small, self-contained exercise or task.",
    "Use the skill in a real project and note what you'd still need to learn.",
  ],
  portfolioReadiness: [
    "Pick one project idea that demonstrates a skill employers actually want.",
    "Build the core, functional version of the project.",
    "Add polish: clean up the code/design and write a short explanation.",
    "Publish it publicly and link it from your resume and profile.",
  ],
  resumeReadiness: [
    "Draft or update your resume with your most recent work and projects.",
    "Rewrite bullet points to focus on outcomes, not just responsibilities.",
    "Get feedback from one person and revise based on it.",
    "Tailor the resume to one specific job posting and submit it.",
  ],
  professionalPresence: [
    "Set up or update your LinkedIn (or equivalent) with current basics.",
    "Add a clear headline and summary aligned to your target roles.",
    "Add 2-3 pieces of work or accomplishments with brief descriptions.",
    "Engage once (comment, post, or connect) with 3 people in your field.",
  ],
  interviewReadiness: [
    "List the 10 most common interview questions for your target roles.",
    "Draft specific examples (using a structure like STAR) for 5 of them.",
    "Do one mock interview, live or recorded, and review it critically.",
    "Do a second mock interview focused on your weakest answers from the first.",
  ],
  jobSearchReadiness: [
    "Set up one simple tracker (sheet or tool) for applications.",
    "Apply to a small, specific weekly target of well-matched roles.",
    "Reach out to 2-3 people for informational chats or referrals.",
    "Review what's working (responses, interviews) and adjust your targets.",
  ],
  organization: [
    "Write down your top 3 career-prep goals for the next 30 days.",
    "Break each goal into weekly tasks and put them on a calendar.",
    "Do a short weekly review of what got done and what didn't.",
    "Set your goals and weekly structure for the next 30 days.",
  ],
  professionalGrowth: [
    "Identify one person you could ask for feedback or advice.",
    "Ask them for specific feedback on one piece of your work.",
    "Act on the feedback you received and note what changed.",
    "Reach out to one new person in your target field to build the habit.",
  ],
};

const WEEK_LABELS = ["Week 1 — Foundation", "Week 2 — Build", "Week 3 — Improve", "Week 4 — Execute"];

/**
 * Builds a 4-week plan from up to 2 weakest categories, one task per
 * category per week, so each week has 1-2 concrete, realistic tasks.
 */
export function buildThirtyDayPlan(scoreResult) {
  const focusCategories = scoreResult.weaknesses.slice(0, 2);

  return WEEK_LABELS.map((label, weekIndex) => {
    const tasks = focusCategories
      .map((cat) => CATEGORY_PLAN_STEPS[cat.id]?.[weekIndex])
      .filter(Boolean);

    return { week: label, focusCategories: focusCategories.map((c) => c.label), tasks };
  });
}
