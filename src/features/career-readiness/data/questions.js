/**
 * Question bank for the Eteral Onboarding Quiz.
 *
 * 7 short questions answerable in ~30 seconds. Each question has 4
 * single-select options. Options carry a `value` from 0-3.
 *
 * Unlike the old 24-question assessment, some questions also carry
 * an extra metadata field (e.g. `track`, `startPoint`, `hoursKey`)
 * used by the scoring/recommendation layer.
 */

export const QUESTIONS = [
  {
    id: "q1",
    category: "currentStatus",
    prompt: "Where are you right now?",
    options: [
      { label: "Student", value: 0 },
      { label: "Recent graduate", value: 1 },
      { label: "Career switcher", value: 1 },
      { label: "Already working, want to level up", value: 2 },
    ],
  },
  {
    id: "q2",
    category: "careerDirection",
    prompt: "Which direction interests you most?",
    options: [
      { label: "Frontend Development", value: 0, track: "frontend" },
      { label: "Backend Development", value: 1, track: "backend" },
      { label: "Full-Stack Development", value: 2, track: "fullstack" },
      { label: "Data & Analytics", value: 1, track: "data" },
    ],
  },
  {
    id: "q2b",
    category: "careerDirection",
    prompt: "Any of these also interest you?",
    options: [
      { label: "UI/UX Design", value: 0, track: "design" },
      { label: "Product Management", value: 1, track: "product" },
      { label: "Not sure yet — help me figure it out", value: 0, track: "undecided" },
      { label: "I picked my direction above", value: 2, track: null },
    ],
  },
  {
    id: "q3",
    category: "skillLevel",
    prompt: "How would you rate your current skills in that area?",
    options: [
      { label: "Just starting, no real experience yet", value: 0 },
      { label: "I know some basics", value: 1 },
      { label: "Intermediate — I can build things on my own", value: 2 },
      { label: "Advanced and confident", value: 3 },
    ],
  },
  {
    id: "q4",
    category: "projectEvidence",
    prompt: "Have you built any projects you can show?",
    options: [
      { label: "None yet", value: 0 },
      { label: "Started but nothing finished", value: 1 },
      { label: "One or two basic ones", value: 2 },
      { label: "Multiple I'm proud of", value: 3 },
    ],
  },
  {
    id: "q5",
    category: "startingPoint",
    prompt: "Where do you want to start?",
    options: [
      { label: "Learn the skills", value: 0, startPoint: "learn" },
      { label: "Practice coding challenges", value: 1, startPoint: "practice" },
      { label: "Build projects", value: 2, startPoint: "projects" },
      { label: "Prepare for interviews", value: 3, startPoint: "interviews" },
    ],
  },
  {
    id: "q6",
    category: "timeCommitment",
    prompt: "How much time can you spend per week on career building?",
    options: [
      { label: "A few hours", value: 0, hoursKey: "few_hours" },
      { label: "5–10 hours", value: 1, hoursKey: "5_10_hours" },
      { label: "10–20 hours", value: 2, hoursKey: "10_20_hours" },
      { label: "20+ hours", value: 3, hoursKey: "20_plus_hours" },
    ],
  },
  {
    id: "q7",
    category: "timeline",
    prompt: "How soon do you want to be job-ready?",
    options: [
      { label: "No rush, I'm exploring", value: 0, timelineKey: "no_rush" },
      { label: "3–6 months", value: 1, timelineKey: "3_6_months" },
      { label: "1–3 months", value: 2, timelineKey: "1_3_months" },
      { label: "I'm already applying", value: 3, timelineKey: "already_applying" },
    ],
  },
];

export const TOTAL_QUESTIONS = QUESTIONS.length;
