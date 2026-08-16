/**
 * Category + readiness-stage config for the Eteral Career Readiness Assessment.
 *
 * This is the single source of truth for category metadata. Question data
 * (questions.js) references categories by `id`. Scoring (lib/scoring.js)
 * reads `weight` and `resourceId` from here. Nothing else in the app should
 * hard-code category labels or thresholds.
 */

export const CATEGORIES = [
  {
    id: "careerClarity",
    label: "Career Clarity",
    shortLabel: "Clarity",
    description:
      "How clearly you've defined the roles, industries, or paths you're aiming for.",
    weight: 1,
    resourceId: "career-direction-guide",
  },
  {
    id: "skillReadiness",
    label: "Skill Readiness",
    shortLabel: "Skills",
    description:
      "How far your practical, job-relevant skills have progressed beyond coursework.",
    weight: 1,
    resourceId: "skill-roadmap",
  },
  {
    id: "portfolioReadiness",
    label: "Project & Portfolio Readiness",
    shortLabel: "Portfolio",
    description:
      "How much visible, verifiable evidence of your abilities you can show an employer.",
    weight: 1,
    resourceId: "portfolio-guide",
  },
  {
    id: "resumeReadiness",
    label: "Resume Readiness",
    shortLabel: "Resume",
    description: "How complete, current, and targeted your resume is.",
    weight: 1,
    resourceId: "resume-toolkit",
  },
  {
    id: "professionalPresence",
    label: "Professional Presence",
    shortLabel: "Presence",
    description:
      "How discoverable and credible you look online to recruiters and peers.",
    weight: 1,
    resourceId: "personal-brand-guide",
  },
  {
    id: "interviewReadiness",
    label: "Interview Readiness",
    shortLabel: "Interviews",
    description: "How prepared you are to perform well once you get an interview.",
    weight: 1,
    resourceId: "interview-prep-kit",
  },
  {
    id: "jobSearchReadiness",
    label: "Job Search Readiness",
    shortLabel: "Job Search",
    description:
      "How active, targeted, and systematic your actual job search process is.",
    weight: 1,
    resourceId: "job-search-tracker",
  },
  {
    id: "organization",
    label: "Organization & Execution",
    shortLabel: "Organization",
    description:
      "How reliably you plan, track, and follow through on career preparation tasks.",
    weight: 1,
    resourceId: "career-planner",
  },
  {
    id: "professionalGrowth",
    label: "Professional Growth",
    shortLabel: "Growth",
    description:
      "How consistently you're learning, seeking feedback, and building your network.",
    weight: 1,
    resourceId: "growth-habits-guide",
  },
];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

/**
 * Readiness stages. `min` is inclusive; stages are checked from highest
 * to lowest. Keep in sync with the spec: 0-39 / 40-59 / 60-74 / 75-89 / 90-100.
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
