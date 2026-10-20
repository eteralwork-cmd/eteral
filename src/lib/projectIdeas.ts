// src/lib/projectIdeas.ts
// Rule-based project idea generator. No API, no edge function, works offline.
// Ideas are scored against the user's skills and the closest ones are suggested.

export type ProjectIdea = {
  title: string;
  description: string;
  problem_solved: string;
  skills_used: string[];
  approach: string;
  difficulty: string;
  estimated_time: string;
};

type IdeaTemplate = Omit<ProjectIdea, 'skills_used'> & {
  tracks: string[];     // which target_track values this idea suits
  keywords: string[];   // lowercase fragments matched against skill labels
};

const steps = (...s: string[]) => s.map((t, i) => `${i + 1}. ${t}`).join('\n');

const IDEAS: IdeaTemplate[] = [
  // ───────────── AI / ML ─────────────
  {
    tracks: ['aiml', 'data_scientist'],
    keywords: ['regression', 'pandas', 'scikit', 'python', 'preprocess'],
    title: 'House Price Predictor',
    description: 'Train a regression model that estimates property prices from size, location and amenities, and compare several algorithms.',
    problem_solved: 'Buyers and sellers struggle to know whether a listing is fairly priced.',
    approach: steps(
      'Download a housing dataset (Kaggle California or Ames housing).',
      'Clean missing values and encode categorical columns.',
      'Train Linear, Ridge and Random Forest regressors.',
      'Compare them with MAE, RMSE and R-squared using cross-validation.',
      'Plot predicted vs actual prices and write up which features matter most.'
    ),
    difficulty: 'Beginner',
    estimated_time: '1 week',
  },
  {
    tracks: ['aiml', 'data_scientist'],
    keywords: ['classif', 'evaluation', 'feature', 'preprocess'],
    title: 'Customer Churn Classifier',
    description: 'Predict which customers are about to cancel a subscription and explain the main reasons.',
    problem_solved: 'Businesses lose revenue because they notice churn only after the customer has left.',
    approach: steps(
      'Use the Telco Customer Churn dataset.',
      'Engineer features such as tenure buckets and total monthly spend.',
      'Train Logistic Regression and a tree-based model.',
      'Evaluate with precision, recall and F1 rather than accuracy alone.',
      'Report the top churn drivers and suggest retention actions.'
    ),
    difficulty: 'Intermediate',
    estimated_time: '1-2 weeks',
  },
  {
    tracks: ['aiml', 'data_scientist', 'data_analyst'],
    keywords: ['unsupervised', 'statistic', 'pandas', 'python'],
    title: 'Customer Segmentation with K-Means',
    description: 'Group shoppers into segments by recency, frequency and spend, then describe each group in plain language.',
    problem_solved: 'Marketing treats every customer the same, so campaigns are wasteful.',
    approach: steps(
      'Take an online retail transactions dataset.',
      'Compute RFM (recency, frequency, monetary) per customer.',
      'Scale the features and pick k with the elbow method and silhouette score.',
      'Run K-Means and visualise clusters with PCA.',
      'Name each segment and recommend a campaign for it.'
    ),
    difficulty: 'Beginner',
    estimated_time: '1 week',
  },
  {
    tracks: ['aiml'],
    keywords: ['neural', 'vision', 'python'],
    title: 'Handwritten Digit Recognizer',
    description: 'Build and train a small neural network (then a CNN) that reads handwritten digits, with a simple drawing demo.',
    problem_solved: 'Shows end-to-end understanding of how a neural network learns from raw pixels.',
    approach: steps(
      'Load MNIST and normalise the pixel values.',
      'Train a dense network as the baseline.',
      'Train a CNN and compare accuracy and loss curves.',
      'Inspect misclassified digits in a confusion matrix.',
      'Add a small canvas demo that predicts what you draw.'
    ),
    difficulty: 'Intermediate',
    estimated_time: '1-2 weeks',
  },
  {
    tracks: ['aiml'],
    keywords: ['vision', 'neural', 'deploy'],
    title: 'Plant Disease Detector (Transfer Learning)',
    description: 'Fine-tune a pretrained image model to spot diseases from leaf photos.',
    problem_solved: 'Farmers often cannot identify crop disease early enough to treat it.',
    approach: steps(
      'Use the PlantVillage dataset.',
      'Apply data augmentation (flips, crops, brightness).',
      'Fine-tune a pretrained MobileNet or ResNet.',
      'Evaluate per-class accuracy and look at failure cases.',
      'Wrap the model in a simple upload-and-predict page.'
    ),
    difficulty: 'Advanced',
    estimated_time: '2-3 weeks',
  },
  {
    tracks: ['aiml', 'data_scientist'],
    keywords: ['nlp', 'classif', 'python'],
    title: 'Review Sentiment Analyzer',
    description: 'Classify product or movie reviews as positive or negative and show which words drive the prediction.',
    problem_solved: 'Teams cannot read thousands of reviews by hand to learn what customers feel.',
    approach: steps(
      'Use the IMDB reviews or Amazon reviews dataset.',
      'Clean and tokenise the text, then build TF-IDF features.',
      'Train Logistic Regression as a baseline.',
      'Try a pretrained transformer and compare F1 scores.',
      'Show the top positive and negative words and build a small demo form.'
    ),
    difficulty: 'Intermediate',
    estimated_time: '1-2 weeks',
  },
  {
    tracks: ['aiml'],
    keywords: ['llm', 'nlp', 'generative'],
    title: 'Document Q&A Assistant (RAG)',
    description: 'Let users upload a PDF and ask questions that are answered only from its content, with the source passages shown.',
    problem_solved: 'Long documents are slow to search, and plain chatbots make up answers.',
    approach: steps(
      'Split the document into overlapping chunks.',
      'Create embeddings and store them in a vector index (FAISS or Chroma).',
      'Retrieve the top chunks for each question.',
      'Pass the chunks to an LLM with a prompt that forbids guessing.',
      'Display the answer with cited passages and test it with tricky questions.'
    ),
    difficulty: 'Advanced',
    estimated_time: '2 weeks',
  },
  {
    tracks: ['aiml', 'data_scientist'],
    keywords: ['evaluation', 'classif', 'feature'],
    title: 'Credit Card Fraud Detector',
    description: 'Detect rare fraudulent transactions in a heavily imbalanced dataset.',
    problem_solved: 'Fraud is under 1% of transactions, so a naive model that predicts "not fraud" looks accurate but is useless.',
    approach: steps(
      'Use the public credit card fraud dataset.',
      'Show why accuracy is misleading on this data.',
      'Handle imbalance with class weights or SMOTE.',
      'Compare models with precision-recall curves and F1.',
      'Choose a decision threshold and explain the cost trade-off.'
    ),
    difficulty: 'Intermediate',
    estimated_time: '1-2 weeks',
  },
  {
    tracks: ['aiml'],
    keywords: ['mlops', 'deploy', 'scikit', 'python'],
    title: 'Deploy a Model as a Dockerised API',
    description: 'Take a trained scikit-learn model and serve predictions through a REST API running in a container.',
    problem_solved: 'A notebook model helps nobody until other apps can call it reliably.',
    approach: steps(
      'Train and save a model with joblib.',
      'Build a FastAPI app with a /predict endpoint and input validation.',
      'Write a Dockerfile and run the container locally.',
      'Log requests and add a /health endpoint.',
      'Track experiments with MLflow and deploy to a free host.'
    ),
    difficulty: 'Intermediate',
    estimated_time: '1 week',
  },

  // ───────────── Data Analyst ─────────────
  {
    tracks: ['data_analyst'],
    keywords: ['sql', 'excel', 'dashboard', 'visual', 'tableau', 'power bi'],
    title: 'Sales Performance Dashboard',
    description: 'Build an interactive dashboard that tracks revenue, top products, regions and monthly trends.',
    problem_solved: 'Managers wait for manual reports and cannot see what is driving sales.',
    approach: steps(
      'Pick a public sales dataset (Superstore works well).',
      'Clean the data and define KPIs: revenue, profit, growth.',
      'Write SQL or pivot queries for each KPI.',
      'Build the dashboard with filters for date, region and category.',
      'Add a short written summary of three insights and one recommendation.'
    ),
    difficulty: 'Beginner',
    estimated_time: '1 week',
  },
  {
    tracks: ['data_analyst', 'data_scientist'],
    keywords: ['sql', 'statistic', 'python', 'pandas'],
    title: 'User Retention Cohort Analysis',
    description: 'Group users by signup month and measure how many return in later weeks.',
    problem_solved: 'Growth teams cannot tell whether product changes actually improve retention.',
    approach: steps(
      'Use an e-commerce or app events dataset.',
      'Assign each user to a signup cohort with SQL.',
      'Compute retention per cohort per week.',
      'Show a retention heatmap.',
      'Explain which cohorts improved or dropped and why.'
    ),
    difficulty: 'Intermediate',
    estimated_time: '1 week',
  },
  {
    tracks: ['data_analyst', 'data_scientist', 'aiml'],
    keywords: ['statistic', 'probability', 'python', 'excel'],
    title: 'A/B Test Analysis Report',
    description: 'Analyse the results of a website experiment and decide whether the new design should ship.',
    problem_solved: 'Teams often ship changes based on a small difference that is just noise.',
    approach: steps(
      'Use a public A/B test dataset or simulate one.',
      'State the null and alternative hypotheses.',
      'Run a two-proportion z-test and compute the confidence interval.',
      'Check sample size and statistical power.',
      'Write a one-page decision memo for a non-technical reader.'
    ),
    difficulty: 'Intermediate',
    estimated_time: '3-5 days',
  },
  {
    tracks: ['data_analyst', 'data_scientist'],
    keywords: ['excel', 'sql', 'clean', 'python', 'pandas'],
    title: 'Messy Data Cleaning Case Study',
    description: 'Take a real, dirty dataset, clean it step by step, and document every decision.',
    problem_solved: 'Analysts spend most of their time on cleaning, and undocumented cleaning makes results untrustworthy.',
    approach: steps(
      'Pick a messy public dataset (government open data is ideal).',
      'List the problems: duplicates, missing values, inconsistent formats.',
      'Fix each with a reproducible script or documented Excel steps.',
      'Compare key numbers before and after cleaning.',
      'Publish the cleaned data with a data dictionary.'
    ),
    difficulty: 'Beginner',
    estimated_time: '3-5 days',
  },

  // ───────────── Data Scientist ─────────────
  {
    tracks: ['data_scientist', 'aiml'],
    keywords: ['time series', 'forecast', 'regression', 'statistic', 'python'],
    title: 'Demand Forecasting Model',
    description: 'Forecast weekly sales for a store using trends, seasonality and holidays.',
    problem_solved: 'Over- or under-stocking costs money, and guesses are rarely accurate.',
    approach: steps(
      'Use the Walmart or Store Item Demand dataset.',
      'Decompose the series into trend and seasonality.',
      'Build a naive baseline, then an ARIMA or gradient boosting model.',
      'Validate with a time-based split, not a random split.',
      'Show forecasts with uncertainty ranges.'
    ),
    difficulty: 'Advanced',
    estimated_time: '2 weeks',
  },
  {
    tracks: ['data_scientist', 'aiml'],
    keywords: ['recommend', 'unsupervised', 'pandas', 'python'],
    title: 'Movie Recommender System',
    description: 'Suggest movies a user will like using content similarity and collaborative filtering.',
    problem_solved: 'Users face too many choices and abandon the platform.',
    approach: steps(
      'Use the MovieLens dataset.',
      'Build a content-based recommender from genres and tags.',
      'Build a collaborative filter using user-item ratings.',
      'Evaluate with precision@k on held-out ratings.',
      'Create a small demo that returns the top 10 for any user.'
    ),
    difficulty: 'Intermediate',
    estimated_time: '1-2 weeks',
  },

  // ───────────── Fullstack ─────────────
  {
    tracks: ['fullstack'],
    keywords: ['react', 'auth', 'node', 'sql', 'api', 'typescript', 'javascript'],
    title: 'Task Manager with Authentication',
    description: 'A multi-user task app with sign-up, login, task lists, due dates and filters.',
    problem_solved: 'People lose track of work when tasks live in scattered notes.',
    approach: steps(
      'Design the data model: users, lists, tasks.',
      'Build a REST API with secure password handling and JWT or sessions.',
      'Create the React UI with forms, filters and optimistic updates.',
      'Add validation and error states on both client and server.',
      'Deploy the app and write a README with screenshots.'
    ),
    difficulty: 'Beginner',
    estimated_time: '1-2 weeks',
  },
  {
    tracks: ['fullstack'],
    keywords: ['react', 'sql', 'api', 'chart', 'css', 'typescript'],
    title: 'Expense Tracker with Charts',
    description: 'Log income and expenses, categorise them, and view monthly spending charts.',
    problem_solved: 'Most people do not know where their money goes each month.',
    approach: steps(
      'Create tables for transactions and categories.',
      'Build CRUD endpoints with pagination and date filters.',
      'Create a React dashboard with a form and summary cards.',
      'Add pie and line charts for category and monthly trends.',
      'Export a month to CSV.'
    ),
    difficulty: 'Intermediate',
    estimated_time: '2 weeks',
  },
  {
    tracks: ['fullstack'],
    keywords: ['websocket', 'node', 'react', 'api', 'real'],
    title: 'Real-Time Chat Rooms',
    description: 'A chat app with rooms, online presence, typing indicators and message history.',
    problem_solved: 'Teaches how to keep many clients in sync without refreshing the page.',
    approach: steps(
      'Set up a Node server with WebSockets or Socket.IO.',
      'Store rooms and messages in a database.',
      'Build the React chat UI with auto-scroll and unread counts.',
      'Add presence and typing indicators.',
      'Handle reconnects and rate-limit message sending.'
    ),
    difficulty: 'Advanced',
    estimated_time: '2-3 weeks',
  },
  {
    tracks: ['fullstack'],
    keywords: ['sql', 'node', 'api', 'database', 'backend'],
    title: 'URL Shortener with Click Analytics',
    description: 'Create short links, redirect visitors, and show how many clicks each link received.',
    problem_solved: 'Long links are hard to share, and creators want to know what gets clicked.',
    approach: steps(
      'Generate unique short codes and store them with the target URL.',
      'Build the redirect route and record each click with time and referrer.',
      'Add link management with expiry dates and custom aliases.',
      'Show a per-link analytics page with a click chart.',
      'Add caching and basic abuse protection.'
    ),
    difficulty: 'Intermediate',
    estimated_time: '1 week',
  },
  {
    tracks: ['fullstack'],
    keywords: ['react', 'css', 'html', 'javascript', 'typescript'],
    title: 'Personal Portfolio with Blog',
    description: 'A fast, responsive portfolio site with project pages and a markdown-powered blog.',
    problem_solved: 'Recruiters need one place to see your work and how you think.',
    approach: steps(
      'Plan pages: home, projects, blog, contact.',
      'Build a responsive layout and a dark-mode toggle.',
      'Render blog posts from markdown files.',
      'Add SEO tags and optimise images for speed.',
      'Deploy and hit 90+ on Lighthouse.'
    ),
    difficulty: 'Beginner',
    estimated_time: '1 week',
  },
];

const LEVEL_RANK = (s: string): number => {
  const v = s.toLowerCase();
  if (v.includes('expert') || v.includes('advanced')) return 3;
  if (v.includes('intermediate')) return 2;
  return 1;
};

const matches = (label: string, keywords: string[]) => {
  const l = label.toLowerCase();
  return keywords.some((k) => l.includes(k));
};

export function generateProjectIdea(opts: {
  track: string;
  /** Skills the user has added or verified, with their level/status. */
  skills: { label: string; level: string }[];
  /** Every skill label in the user's track, used to link skills to the project. */
  trackSkillLabels: string[];
  /** Titles already shown, so "Try another idea" gives a new one. */
  exclude?: string[];
}): ProjectIdea {
  const { track, skills, trackSkillLabels, exclude = [] } = opts;

  const userRank = skills.length
    ? Math.round(skills.reduce((sum, s) => sum + LEVEL_RANK(s.level), 0) / skills.length)
    : 1;

  const trackIdeas = IDEAS.filter((i) => i.tracks.includes(track));
  const pool = trackIdeas.length ? trackIdeas : IDEAS;

  const scored = pool.map((idea) => {
    let score = 0;
    // The user's own skills decide the ranking; each matching skill counts once.
    for (const s of skills) if (matches(s.label, idea.keywords)) score += 3;
    score -= Math.abs(LEVEL_RANK(idea.difficulty) - userRank); // prefer a fitting difficulty
    return { idea, score };
  });

  const fresh = scored.filter((x) => !exclude.includes(x.idea.title));
  const ranked = (fresh.length ? fresh : scored).sort((a, b) => b.score - a.score);
  // Choose randomly among up to 3 close-to-best ideas, so repeats feel varied but stay relevant.
  const best = ranked[0].score;
  const top = ranked.slice(0, 3).filter((x) => x.score >= best - 2);
  const chosen = top[Math.floor(Math.random() * top.length)].idea;

  let used = trackSkillLabels.filter((l) => matches(l, chosen.keywords));
  if (used.length === 0) used = skills.slice(0, 2).map((s) => s.label);

  const { tracks: _t, keywords: _k, ...idea } = chosen;
  return { ...idea, skills_used: used };
}