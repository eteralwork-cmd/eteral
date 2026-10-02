/**
 * Category + readiness-stage config for the Eteral Onboarding Quiz.
 *
 * Simplified from the old 9-category readiness assessment to 4
 * onboarding-relevant areas used for the overview screen.
 */

export const CATEGORIES = [
  {
    id: "currentStatus",
    label: "Current Status",
    shortLabel: "Status",
    description: "Where you are right now in your journey.",
  },
  {
    id: "careerDirection",
    label: "Career Direction",
    shortLabel: "Direction",
    description: "Which tech path you want to pursue.",
  },
  {
    id: "skillLevel",
    label: "Skill Level",
    shortLabel: "Skills",
    description: "Your self-reported skill level in your chosen direction.",
  },
  {
    id: "projectEvidence",
    label: "Project Evidence",
    shortLabel: "Projects",
    description: "How much visible work you can show today.",
  },
  {
    id: "startingPoint",
    label: "Starting Point",
    shortLabel: "Start",
    description: "Where you want to begin on Eteral.",
  },
  {
    id: "timeCommitment",
    label: "Time Commitment",
    shortLabel: "Time",
    description: "How many hours per week you can dedicate.",
  },
  {
    id: "timeline",
    label: "Timeline",
    shortLabel: "Timeline",
    description: "How soon you want to be job-ready.",
  },
];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

/**
 * Readiness stages for the onboarding quiz. Based on overall skill
 * and evidence score. `min` is inclusive; checked highest to lowest.
 */
export const READINESS_STAGES = [
  {
    id: "jobReady",
    min: 75,
    label: "Job-Ready",
    summary:
      "You have strong skills and real evidence. Focus on interview prep, polishing your profile, and applying consistently.",
  },
  {
    id: "developing",
    min: 50,
    label: "Developing",
    summary:
      "You have a solid foundation. Now it's about building more projects, practicing consistently, and starting interview prep.",
  },
  {
    id: "buildingFoundation",
    min: 25,
    label: "Building Foundation",
    summary:
      "You're getting started. Focus on learning core skills and completing your first project so you have something to show.",
  },
  {
    id: "gettingStarted",
    min: 0,
    label: "Getting Started",
    summary:
      "You're at the very beginning — and that's fine. Start by picking a direction and learning the basics through guided practice.",
  },
];

export function getReadinessStage(score) {
  const stage = READINESS_STAGES.find((s) => score >= s.min);
  return stage ?? READINESS_STAGES[READINESS_STAGES.length - 1];
}

/**
 * Maps track keys to human-readable labels.
 */
export const TRACK_LABELS = {
  frontend: "Frontend Development",
  backend: "Backend Development",
  fullstack: "Full-Stack Development",
  data: "Data & Analytics",
  design: "UI/UX Design",
  product: "Product Management",
  undecided: "Still exploring",
};

/**
 * Maps starting-point keys to dashboard feature labels.
 */
export const START_POINT_LABELS = {
  learn: "Learn the Skills",
  practice: "Practice Coding Challenges",
  projects: "Build Projects",
  interviews: "Prepare for Interviews",
  resume: "Fix Resume & Profile",
};

/**
 * Weekly pace labels derived from hours commitment.
 */
export const WEEKLY_PACE_LABELS = {
  few_hours: "Casual",
  "5_10_hours": "Steady",
  "10_20_hours": "Intensive",
  "20_plus_hours": "Full-speed",
};
