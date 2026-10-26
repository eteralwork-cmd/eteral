import { useEffect, useMemo, useState } from 'react';
import {
  Brain,
  Check,
  Code2,
  Database,
  ExternalLink,
  Rocket,
  RotateCcw,
  Sigma,
  Sparkles,
} from 'lucide-react';

type ResourceType = 'free' | 'paid';

type Step = {
  id: string;
  title: string;
  description: string;
  url: string;
  type: ResourceType;
  time: string;
};

type Stage = {
  id: string;
  title: string;
  goal: string;
  icon: React.ReactNode;
  steps: Step[];
};

const STORAGE_KEY = 'learn-ml-pathway-progress';

const PATHWAY: Stage[] = [
  {
    id: 'python',
    title: 'Python basics',
    goal: 'Write small programs comfortably: functions, loops, lists, dictionaries, and reading files.',
    icon: <Code2 className="h-4 w-4" />,
    steps: [
      { id: 'py-kaggle', title: 'Kaggle Learn: Python', description: 'Short, hands-on lessons with exercises you run in the browser.', url: 'https://www.kaggle.com/learn/python', type: 'free', time: '~5 hours' },
      { id: 'py-tutorial', title: 'Official Python tutorial', description: 'Fill in gaps on classes, modules, and error handling.', url: 'https://docs.python.org/3/tutorial/', type: 'free', time: '~8 hours' },
      { id: 'py-practice', title: 'Solve 10 beginner problems', description: 'Practice on freeCodeCamp until loops and functions feel natural.', url: 'https://www.freecodecamp.org', type: 'free', time: '~6 hours' },
    ],
  },
  {
    id: 'math',
    title: 'Math you need',
    goal: 'Understand vectors, matrices, derivatives, and probability well enough to follow how models learn.',
    icon: <Sigma className="h-4 w-4" />,
    steps: [
      { id: 'math-la', title: 'Essence of Linear Algebra', description: 'Visual, intuition-first video series on vectors and matrices.', url: 'https://www.3blue1brown.com/topics/linear-algebra', type: 'free', time: '~3 hours' },
      { id: 'math-calc', title: 'Essence of Calculus', description: 'Build intuition for derivatives, the idea behind gradient descent.', url: 'https://www.3blue1brown.com/topics/calculus', type: 'free', time: '~3 hours' },
      { id: 'math-stats', title: 'Statistics and probability', description: 'Distributions, averages, variance, and basic probability.', url: 'https://www.khanacademy.org/math/statistics-probability', type: 'free', time: '~15 hours' },
      { id: 'math-mml', title: 'Mathematics for Machine Learning (book)', description: 'Optional deeper reference. Free to read online.', url: 'https://mml-book.github.io', type: 'free', time: 'Reference' },
    ],
  },
  {
    id: 'data',
    title: 'Data tools',
    goal: 'Load, clean, explore, and plot a dataset on your own.',
    icon: <Database className="h-4 w-4" />,
    steps: [
      { id: 'data-numpy', title: 'NumPy quickstart', description: 'Arrays and vectorized operations, the base of every ML library.', url: 'https://numpy.org/doc/stable/user/quickstart.html', type: 'free', time: '~2 hours' },
      { id: 'data-pandas', title: 'Kaggle Learn: Pandas', description: 'Select, filter, group, and clean tabular data.', url: 'https://www.kaggle.com/learn/pandas', type: 'free', time: '~4 hours' },
      { id: 'data-viz', title: 'Matplotlib tutorials', description: 'Plot distributions and relationships before you model them.', url: 'https://matplotlib.org/stable/tutorials/index.html', type: 'free', time: '~3 hours' },
    ],
  },
  {
    id: 'core-ml',
    title: 'Core machine learning',
    goal: 'Train, evaluate, and compare classic models, and explain overfitting in your own words.',
    icon: <Brain className="h-4 w-4" />,
    steps: [
      { id: 'ml-crash', title: 'Google Machine Learning Crash Course', description: 'Clear intro to regression, classification, and evaluation.', url: 'https://developers.google.com/machine-learning/crash-course', type: 'free', time: '~15 hours' },
      { id: 'ml-kaggle', title: 'Kaggle Learn: Intro to Machine Learning', description: 'Build your first model, then handle underfitting and overfitting.', url: 'https://www.kaggle.com/learn/intro-to-machine-learning', type: 'free', time: '~3 hours' },
      { id: 'ml-sklearn', title: 'scikit-learn user guide', description: 'Learn the standard fit, predict, and score workflow.', url: 'https://scikit-learn.org/stable/user_guide.html', type: 'free', time: 'Ongoing' },
      { id: 'ml-ng', title: 'Machine Learning Specialization', description: 'Andrew Ng\u2019s structured course. Audit for free or pay for a certificate.', url: 'https://www.coursera.org/specializations/machine-learning-introduction', type: 'paid', time: '~2 months' },
      { id: 'ml-homl', title: 'Hands-On Machine Learning notebooks', description: 'Free code companion to the book. Run the chapters you care about.', url: 'https://github.com/ageron/handson-ml3', type: 'free', time: 'Ongoing' },
    ],
  },
  {
    id: 'deep-learning',
    title: 'Deep learning intro',
    goal: 'Understand how a neural network trains and build one in PyTorch.',
    icon: <Sparkles className="h-4 w-4" />,
    steps: [
      { id: 'dl-3b1b', title: 'Neural Networks (3Blue1Brown)', description: 'See what a neural network does and how backpropagation works.', url: 'https://www.3blue1brown.com/topics/neural-networks', type: 'free', time: '~1.5 hours' },
      { id: 'dl-pytorch', title: 'PyTorch tutorials', description: 'Tensors, autograd, and training your first model.', url: 'https://pytorch.org/tutorials/', type: 'free', time: '~6 hours' },
      { id: 'dl-fastai', title: 'Practical Deep Learning for Coders', description: 'Top-down course: train real image and text models early.', url: 'https://course.fast.ai', type: 'free', time: '~30 hours' },
      { id: 'dl-karpathy', title: 'Neural Networks: Zero to Hero', description: 'Build a neural network from scratch, step by step.', url: 'https://karpathy.ai/zero-to-hero.html', type: 'free', time: '~15 hours' },
    ],
  },
  {
    id: 'projects',
    title: 'Build and show your work',
    goal: 'Finish projects you can link in a portfolio or resume.',
    icon: <Rocket className="h-4 w-4" />,
    steps: [
      { id: 'proj-titanic', title: 'Titanic competition on Kaggle', description: 'Predict survival, submit to the leaderboard, and iterate on features.', url: 'https://www.kaggle.com/competitions/titanic', type: 'free', time: '~6 hours' },
      { id: 'proj-own', title: 'Model a dataset you care about', description: 'Pick your own data, define a question, train, and write up results.', url: 'https://www.kaggle.com/datasets', type: 'free', time: '~15 hours' },
      { id: 'proj-publish', title: 'Publish a project write-up on GitHub', description: 'Add a README that explains the problem, method, and what you learned.', url: 'https://github.com', type: 'free', time: '~3 hours' },
    ],
  },
];

const FILTERS = [
  { label: 'All resources', value: 'all' },
  { label: 'Free only', value: 'free' },
] as const;

type FilterValue = (typeof FILTERS)[number]['value'];

function loadProgress(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

export function LearnResourcesPage() {
  const [filter, setFilter] = useState<FilterValue>('all');
  const [done, setDone] = useState<Record<string, boolean>>(loadProgress);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(done));
    } catch {
      // Storage can be unavailable; progress then lasts for this session only.
    }
  }, [done]);

  const stages = useMemo(
    () =>
      PATHWAY.map((stage) => ({
        ...stage,
        steps: stage.steps.filter((s) => filter === 'all' || s.type === filter),
      })).filter((stage) => stage.steps.length > 0),
    [filter],
  );

  const allSteps = stages.flatMap((s) => s.steps);
  const completed = allSteps.filter((s) => done[s.id]).length;
  const percent = allSteps.length ? Math.round((completed / allSteps.length) * 100) : 0;

  const toggle = (id: string) => setDone((prev) => ({ ...prev, [id]: !prev[id] }));
  const reset = () => setDone({});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Machine learning pathway</h1>
        <p className="mt-1 text-sm text-slatey">
          A step-by-step route from your first Python script to a portfolio project. Work through the stages in order and check off each step as you finish it.
        </p>
      </div>

      <div className="rounded-2xl border border-mist bg-white p-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-semibold text-ink">
            {completed} of {allSteps.length} steps complete
          </p>
          <p className="text-sm text-slatey">{percent}%</p>
        </div>
        <div
          className="mt-3 h-2 w-full overflow-hidden rounded-full bg-mist"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Overall pathway progress"
        >
          <div className="h-full rounded-full bg-gradient-accent transition-all" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              filter === f.value
                ? 'bg-gradient-accent text-white'
                : 'border border-mist bg-white text-slatey hover:border-ink/20 hover:text-ink'
            }`}
          >
            {f.label}
          </button>
        ))}
        <button
          onClick={reset}
          disabled={completed === 0}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-mist bg-white px-4 py-2 text-sm font-medium text-slatey transition-all hover:border-ink/20 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset progress
        </button>
      </div>

      <ol className="space-y-8">
        {stages.map((stage, index) => {
          const stageDone = stage.steps.filter((s) => done[s.id]).length;
          const stageComplete = stageDone === stage.steps.length;

          return (
            <li key={stage.id} className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-accent text-white">
                  {stageComplete ? <Check className="h-4 w-4" /> : stage.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <h2 className="text-base font-semibold text-ink">
                      Stage {index + 1}: {stage.title}
                    </h2>
                    <span className="text-xs text-slatey">
                      {stageDone}/{stage.steps.length} done
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-slatey">
                    <span className="font-medium text-ink">Goal:</span> {stage.goal}
                  </p>
                </div>
              </div>

              <ul className="space-y-2">
                {stage.steps.map((step) => {
                  const checked = !!done[step.id];
                  return (
                    <li
                      key={step.id}
                      className={`flex items-start gap-3 rounded-2xl border border-mist bg-white p-4 transition-all hover:border-ink/20 ${
                        checked ? 'opacity-70' : ''
                      }`}
                    >
                      <button
                        role="checkbox"
                        aria-checked={checked}
                        aria-label={`Mark "${step.title}" as ${checked ? 'not done' : 'done'}`}
                        onClick={() => toggle(step.id)}
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-coral ${
                          checked ? 'border-transparent bg-gradient-accent text-white' : 'border-ink/30 bg-white hover:border-ink/60'
                        }`}
                      >
                        {checked && <Check className="h-3.5 w-3.5" />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <a
                          href={step.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-1.5"
                        >
                          <span className={`text-sm font-semibold text-ink ${checked ? 'line-through' : ''}`}>{step.title}</span>
                          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slatey transition-colors group-hover:text-coral" />
                        </a>
                        <p className="mt-1 text-xs leading-relaxed text-slatey">{step.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium ${
                              step.type === 'free' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {step.type === 'free' ? 'Free' : 'Paid'}
                          </span>
                          <span className="text-[11px] text-slatey">{step.time}</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
