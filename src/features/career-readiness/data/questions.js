/**
 * Question bank for the Eteral Career Readiness Assessment.
 *
 * Each question:
 *  - belongs to exactly one category (by id, matching data/categories.js)
 *  - has 4 single-select options
 *  - each option carries a `value` from 0-3 representing readiness level
 *    (0 = not started, 3 = consistently/fully doing this)
 *
 * Scoring is entirely derived from these `value`s — see lib/scoring.js.
 * No randomness, no hidden weighting beyond what's declared here.
 */

export const QUESTIONS = [
  // ---- Career Clarity ----
  
  {
    id: "q1",
    category: "careerClarity",
    prompt: "How clear are you on the specific roles you're targeting and what the day-to-day work actually looks like?",
    options: [
      { label: "Not clear at all — still exploring", value: 0 },
      { label: "I have a rough idea of the field, not specific roles", value: 1 },
      { label: "I can name target roles and roughly what they involve", value: 2 },
      { label: "Very clear — specific roles, and I've talked to people who do this work", value: 3 },
    ],
  },
  {
    id: "q2",
    category: "skillReadiness",
    prompt: "How would you describe your current skill level for the roles you want?",
    options: [
      { label: "Just starting to learn the basics", value: 0 },
      { label: "I know some concepts but haven't applied them much", value: 1 },
      { label: "I've applied several skills in real practice or small projects", value: 2 },
      { label: "I've applied multiple skills repeatedly and stay current with what the market asks for", value: 3 },
    ],
  },
  {
    id: "q3",
    category: "portfolioReadiness",
    prompt: "Do you have projects or work an employer could actually look at right now?",
    options: [
      { label: "Nothing built or shareable yet", value: 0 },
      { label: "Something exists but it's incomplete, unexplained, or hard to find", value: 1 },
      { label: "A few organized pieces that show what I can do", value: 2 },
      { label: "A strong, well-documented portfolio I'd confidently show an employer", value: 3 },
    ],
  },
  {
    id: "q4",
    category: "materialsReadiness",
    prompt: "How ready are your resume and professional profile (LinkedIn, etc.) for someone to review today?",
    options: [
      { label: "I don't have these, or they're badly outdated", value: 0 },
      { label: "They exist but need real work", value: 1 },
      { label: "Mostly solid, maybe need tailoring per job", value: 2 },
      { label: "Current, tailored, and reviewed recently", value: 3 },
    ],
  },
  {
    id: "q5",
    category: "interviewReadiness",
    prompt: "How prepared do you feel to talk through your experience in an interview?",
    options: [
      { label: "Never done one, no prepared answers", value: 0 },
      { label: "Some rough ideas, nothing rehearsed", value: 1 },
      { label: "Prepared answers for common questions", value: 2 },
      { label: "Practiced, specific examples and I'm comfortable speaking to them", value: 3 },
    ],
  },
  {
    id: "q6",
    category: "jobSearchMomentum",
    prompt: "How active and organized is your job search right now?",
    options: [
      { label: "Not searching yet / no system", value: 0 },
      { label: "Applying occasionally, no tracking", value: 1 },
      { label: "Steady applications, loosely tracked", value: 2 },
      { label: "Consistent applications, tracked, plus networking/referrals", value: 3 },
    ],
  },
];

export const TOTAL_QUESTIONS = QUESTIONS.length;
