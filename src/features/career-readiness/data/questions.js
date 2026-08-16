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
    id: "cc1",
    category: "careerClarity",
    prompt: "How clearly can you describe the specific roles or job titles you're targeting?",
    options: [
      { label: "I haven't thought about this yet", value: 0 },
      { label: "I have a vague idea but nothing specific", value: 1 },
      { label: "I can name a few target roles", value: 2 },
      { label: "I can clearly name target roles and why they fit me", value: 3 },
    ],
  },
  {
    id: "cc2",
    category: "careerClarity",
    prompt: "How well do you understand what day-to-day work actually looks like in the roles you want?",
    options: [
      { label: "I don't know", value: 0 },
      { label: "I have a rough idea from job titles alone", value: 1 },
      { label: "I've researched it through postings, videos, or blogs", value: 2 },
      { label: "I've talked to people who do this work or shadowed/interned", value: 3 },
    ],
  },
  {
    id: "cc3",
    category: "careerClarity",
    prompt: "How often do you revisit or refine your career direction based on new information?",
    options: [
      { label: "Never", value: 0 },
      { label: "Rarely", value: 1 },
      { label: "Occasionally, when something prompts it", value: 2 },
      { label: "Regularly, as part of how I plan", value: 3 },
    ],
  },

  // ---- Skill Readiness ----
  {
    id: "sk1",
    category: "skillReadiness",
    prompt: "How many of the core skills for your target roles have you actually practiced, not just studied?",
    options: [
      { label: "None yet", value: 0 },
      { label: "One or two, briefly", value: 1 },
      { label: "Several, with some real practice", value: 2 },
      { label: "Multiple, applied repeatedly", value: 3 },
    ],
  },
  {
    id: "sk2",
    category: "skillReadiness",
    prompt: "When you learn a new skill, how do you usually confirm you've actually learned it?",
    options: [
      { label: "I don't — I just move on", value: 0 },
      { label: "I do a few practice exercises", value: 1 },
      { label: "I apply it in a small project", value: 2 },
      { label: "I apply it in a project and get feedback from others", value: 3 },
    ],
  },
  {
    id: "sk3",
    category: "skillReadiness",
    prompt: "How up to date are your skills with what current job postings in your field actually ask for?",
    options: [
      { label: "I haven't checked job postings", value: 0 },
      { label: "I've glanced at a few", value: 1 },
      { label: "I've reviewed several and noted gaps", value: 2 },
      { label: "I actively track postings and adjust what I learn", value: 3 },
    ],
  },

  // ---- Project & Portfolio Readiness ----
  {
    id: "pf1",
    category: "portfolioReadiness",
    prompt: "How many practical projects have you completed that demonstrate skills relevant to the roles you want?",
    options: [
      { label: "I haven't started one yet", value: 0 },
      { label: "I've started but haven't completed one", value: 1 },
      { label: "I've completed one or two basic projects", value: 2 },
      { label: "I've completed multiple projects I'd confidently show an employer", value: 3 },
    ],
  },
  {
    id: "pf2",
    category: "portfolioReadiness",
    prompt: "Can someone find and review your work (code, designs, writing, etc.) online right now?",
    options: [
      { label: "No, nothing is publicly visible", value: 0 },
      { label: "Something exists but it's incomplete or hard to find", value: 1 },
      { label: "Yes, a few pieces are visible and reasonably organized", value: 2 },
      { label: "Yes, a well-organized portfolio is easy to find", value: 3 },
    ],
  },
  {
    id: "pf3",
    category: "portfolioReadiness",
    prompt: "How well does your best project explain the problem it solves and your specific contribution?",
    options: [
      { label: "I don't have a project to point to", value: 0 },
      { label: "It exists but has no real explanation or context", value: 1 },
      { label: "It has a basic description", value: 2 },
      { label: "It clearly explains the problem, my role, and the outcome", value: 3 },
    ],
  },

  // ---- Resume Readiness ----
  {
    id: "rs1",
    category: "resumeReadiness",
    prompt: "How current is your resume?",
    options: [
      { label: "I don't have one", value: 0 },
      { label: "I have one but it's outdated", value: 1 },
      { label: "It's mostly current", value: 2 },
      { label: "It's current and was recently reviewed or updated", value: 3 },
    ],
  },
  {
    id: "rs2",
    category: "resumeReadiness",
    prompt: "When you apply to a role, how tailored is your resume to that specific job?",
    options: [
      { label: "I use the exact same resume everywhere", value: 0 },
      { label: "I make small tweaks occasionally", value: 1 },
      { label: "I usually adjust it per role", value: 2 },
      { label: "I consistently tailor it to match the job description", value: 3 },
    ],
  },

  // ---- Professional Presence ----
  {
    id: "pp1",
    category: "professionalPresence",
    prompt: "How complete and current is your LinkedIn (or equivalent professional profile)?",
    options: [
      { label: "I don't have one", value: 0 },
      { label: "I have one but it's incomplete or outdated", value: 1 },
      { label: "It's mostly complete", value: 2 },
      { label: "It's complete, current, and reflects my target roles", value: 3 },
    ],
  },
  {
    id: "pp2",
    category: "professionalPresence",
    prompt: "If a recruiter searched your name, what would they most likely find?",
    options: [
      { label: "Nothing relevant", value: 0 },
      { label: "Little that's relevant or professional", value: 1 },
      { label: "Some relevant, professional results", value: 2 },
      { label: "Consistent, professional results that support my goals", value: 3 },
    ],
  },

  // ---- Interview Readiness ----
  {
    id: "iv1",
    category: "interviewReadiness",
    prompt: "How many mock or real interviews have you done in the last 6 months?",
    options: [
      { label: "None", value: 0 },
      { label: "One", value: 1 },
      { label: "A few", value: 2 },
      { label: "Several, with reflection or feedback afterward", value: 3 },
    ],
  },
  {
    id: "iv2",
    category: "interviewReadiness",
    prompt: "How prepared are you to answer \"tell me about yourself\" and common behavioral questions with specific examples?",
    options: [
      { label: "I haven't prepared answers", value: 0 },
      { label: "I have rough ideas but nothing rehearsed", value: 1 },
      { label: "I have prepared answers for common questions", value: 2 },
      { label: "I have specific, practiced examples for most likely questions", value: 3 },
    ],
  },
  {
    id: "iv3",
    category: "interviewReadiness",
    prompt: "How comfortable are you explaining your projects or experience out loud, clearly and concisely?",
    options: [
      { label: "Not comfortable at all", value: 0 },
      { label: "Somewhat, but I tend to ramble or lose focus", value: 1 },
      { label: "Fairly comfortable", value: 2 },
      { label: "Very comfortable — clear and concise", value: 3 },
    ],
  },

  // ---- Job Search Readiness ----
  {
    id: "js1",
    category: "jobSearchReadiness",
    prompt: "How many relevant applications have you submitted in the past month?",
    options: [
      { label: "None", value: 0 },
      { label: "A few, inconsistently", value: 1 },
      { label: "A steady handful", value: 2 },
      { label: "A consistent, tracked number each week", value: 3 },
    ],
  },
  {
    id: "js2",
    category: "jobSearchReadiness",
    prompt: "Do you have a system for finding and tracking job opportunities?",
    options: [
      { label: "No system — I search randomly", value: 0 },
      { label: "I look occasionally but don't track anything", value: 1 },
      { label: "I track applications loosely", value: 2 },
      { label: "I have a consistent process and tracker", value: 3 },
    ],
  },
  {
    id: "js3",
    category: "jobSearchReadiness",
    prompt: "How much do you rely on networking or referrals versus applying cold?",
    options: [
      { label: "I only apply cold", value: 0 },
      { label: "I've reached out to a couple of people", value: 1 },
      { label: "I regularly reach out to a few relevant people", value: 2 },
      { label: "Referrals and networking are a core part of my search", value: 3 },
    ],
  },

  // ---- Organization & Execution ----
  {
    id: "og1",
    category: "organization",
    prompt: "Do you have a written plan for your career preparation (goals, timeline, tasks)?",
    options: [
      { label: "No plan at all", value: 0 },
      { label: "Vague goals, nothing written down", value: 1 },
      { label: "A basic written plan", value: 2 },
      { label: "A clear plan I actively track and update", value: 3 },
    ],
  },
  {
    id: "og2",
    category: "organization",
    prompt: "How often do you actually follow through on career-related tasks you set for yourself?",
    options: [
      { label: "Rarely", value: 0 },
      { label: "Sometimes", value: 1 },
      { label: "Often", value: 2 },
      { label: "Consistently", value: 3 },
    ],
  },
  {
    id: "og3",
    category: "organization",
    prompt: "How do you track your progress on career preparation over time?",
    options: [
      { label: "I don't track it", value: 0 },
      { label: "I have a rough mental sense", value: 1 },
      { label: "I track some things informally", value: 2 },
      { label: "I track progress systematically", value: 3 },
    ],
  },

  // ---- Professional Growth ----
  {
    id: "pg1",
    category: "professionalGrowth",
    prompt: "How often do you seek feedback on your work, resume, or interview performance?",
    options: [
      { label: "Never", value: 0 },
      { label: "Rarely", value: 1 },
      { label: "Occasionally", value: 2 },
      { label: "Regularly, and I act on it", value: 3 },
    ],
  },
  {
    id: "pg2",
    category: "professionalGrowth",
    prompt: "How actively are you building relationships with people in your target field (mentors, peers, alumni)?",
    options: [
      { label: "I'm not building any", value: 0 },
      { label: "I have a couple of loose connections", value: 1 },
      { label: "I maintain a few active relationships", value: 2 },
      { label: "I actively build and maintain a network", value: 3 },
    ],
  },
];

export const TOTAL_QUESTIONS = QUESTIONS.length;
