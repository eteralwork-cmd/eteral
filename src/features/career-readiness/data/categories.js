/**
 * Category + readiness-stage config for the Eteral Career Readiness Assessment.
 *
 * This is the single source of truth for category metadata. Question data
 * (questions.js) references categories by `id`. Scoring (lib/scoring.js)
 * reads `weight` and `resourceId` from here. Nothing else in the app should
 * hard-code category labels or thresholds.
 *
 * NOTE: Condensed from 9 categories / 25 questions to 6 categories / 6 questions
 * for onboarding (one question per category, 0-3 scale, max raw score = 18).
 * `organization` and `professionalGrowth` were dropped from the core assessment —
 * they're habit/meta signals rather than current-level signals. Consider
 * resurfacing them as an in-app follow-up nudge after a user's first week,
 * rather than at signup.
 */

export const CATEGORIES = [
  {
    id: "careerClarity",
    label: "Career Clarity",
    shortLabel: "Clarity",
    description:
      "How clearly you've defined the roles, industries, or paths you're aiming for, and how well you understand what the work actually involves.",
    weight: 1,
    resourceId: "career-direction-guide",
  },
  {
    id: "skillReadiness",
    label: "Skill Readiness",
    shortLabel: "Skills",
    description:
      "How far your practical, job-relevant skills have progressed beyond coursework, and how current they are with what the market asks for.",
    weight: 1,
    resourceId: "skill-roadmap",
  },
  {
    id: "portfolioReadiness",
    label: "Project & Portfolio Readiness",
    shortLabel: "Portfolio",
    description:
      "How much visible, verifiable, well-explained evidence of your abilities you can show an employer right now.",
    weight: 1,
    resourceId: "portfolio-guide",
  },
  {
    id: "materialsReadiness",
    label: "Materials Readiness",
    shortLabel: "Materials",
    description:
      "How current, complete, and tailored your resume and professional profile (e.g. LinkedIn) are.",
    weight: 1,
    resourceId: "resume-toolkit",
  },
  {
    id: "interviewReadiness",
    label: "Interview Readiness",
    shortLabel: "Interviews",
    description:
      "How prepared you are to talk through your experience and perform well once you get an interview.",
    weight: 1,
    resourceId: "interview-prep-kit",
  },
  {
    id: "jobSearchMomentum",
    label: "Job Search Momentum",
    shortLabel: "Job Search",
    description:
      "How active, targeted, and systematic your actual job search process is right now.",
    weight: 1,
    resourceId: "job-search-tracker",
  },
];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

/**
 * Readiness stages. `min` is inclusive; stages are checked from highest
 * to lowest. Score is a 0-100 percentage of raw points (max raw = 18,
 * i.e. 6 categories x 0-3 each). Thresholds carried over unchanged from
 * the original 25-question spec (0-39 / 40-59 / 60-74 / 75-89 / 90-100) —
 * revisit these once you have real completion data, since a 6-question
 * assessment has coarser score granularity (each question is worth ~5.6
 * percentage points instead of ~2), so users will cluster more and land on
 * stage boundaries more easily than before.
 */
export const READINESS_STAGES = [
  {
    id: "competitive",
    min: 90,
    label: "Competitive Stage",
    summary:
      "You demonstrate strong preparation across most areas. Focus now on refinement and differentiation, not basics.",
  },
  {
    id: "jobReady",
    min: 75,
    label: "Job-Ready Stage",
    summary:
      "You're substantially prepared. A few targeted improvements will make you meaningfully more competitive.",
  },
  {
    id: "developing",
    min: 60,
    label: "Developing Stage",
    summary:
      "You have a reasonable foundation but need stronger practical execution to convert it into results.",
  },
  {
    id: "building",
    min: 40,
    label: "Building Stage",
    summary:
      "You've started preparing, but there are significant gaps that are likely limiting your results right now.",
  },
  {
    id: "foundation",
    min: 0,
    label: "Foundation Stage",
    summary:
      "You're at the start of building career preparation habits and direction — which is a normal place to begin.",
  },
];

export function getReadinessStage(score) {
  const stage = READINESS_STAGES.find((s) => score >= s.min);
  return stage ?? READINESS_STAGES[READINESS_STAGES.length - 1];
}