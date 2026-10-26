import { useEffect, useState } from 'react';
import {
  Brain,
  Check,
  ChevronDown,
  Code2,
  Database,
  Lock,
  RotateCcw,
  Rocket,
  Sigma,
  TrendingUp,
} from 'lucide-react';

type RequirementKind = 'Challenges' | 'Quiz' | 'Project';

type Requirement = {
  id: string;
  label: string;
  kind: RequirementKind;
};

type Level = {
  id: string;
  title: string;
  outcome: string;
  icon: React.ReactNode;
  requirements: Requirement[];
};

const STORAGE_KEY = 'eteral-ml-pathway-progress';

const LEVELS: Level[] = [
  {
    id: 'l1',
    title: 'Python foundation',
    outcome: 'You can write and debug small Python programs on your own.',
    icon: <Code2 className="h-4 w-4" />,
    requirements: [
      { id: 'l1-basics', label: 'Solve 10 challenges on variables, conditionals, and loops', kind: 'Challenges' },
      { id: 'l1-functions', label: 'Solve 6 challenges on writing and calling functions', kind: 'Challenges' },
      { id: 'l1-collections', label: 'Solve 8 challenges on lists, dictionaries, and comprehensions', kind: 'Challenges' },
      { id: 'l1-project', label: 'Build a text analyzer that counts words and finds the most common ones', kind: 'Project' },
      { id: 'l1-quiz', label: 'Score 80% or higher on the Level 1 quiz', kind: 'Quiz' },
    ],
  },
  {
    id: 'l2',
    title: 'Math for machine learning',
    outcome: 'You can work with vectors, matrices, gradients, and probability in code.',
    icon: <Sigma className="h-4 w-4" />,
    requirements: [
      { id: 'l2-vectors', label: 'Solve 8 challenges on vectors and matrices (dot product, matrix multiplication)', kind: 'Challenges' },
      { id: 'l2-stats', label: 'Solve 8 challenges on mean, variance, standard deviation, and probability', kind: 'Challenges' },
      { id: 'l2-gradient', label: 'Solve 5 challenges on derivatives and finding a minimum with gradient descent', kind: 'Challenges' },
      { id: 'l2-project', label: 'Build a function that finds the minimum of a curve using gradient descent', kind: 'Project' },
      { id: 'l2-quiz', label: 'Score 80% or higher on the Level 2 quiz', kind: 'Quiz' },
    ],
  },
  {
    id: 'l3',
    title: 'Data with NumPy and Pandas',
    outcome: 'You can load, clean, and summarize a real dataset.',
    icon: <Database className="h-4 w-4" />,
    requirements: [
      { id: 'l3-numpy', label: 'Solve 10 challenges on NumPy arrays and vectorized operations', kind: 'Challenges' },
      { id: 'l3-pandas', label: 'Solve 10 challenges on Pandas: select, filter, sort, and group data', kind: 'Challenges' },
      { id: 'l3-cleaning', label: 'Solve 6 challenges on missing values, duplicates, and wrong data types', kind: 'Challenges' },
      { id: 'l3-project', label: 'Clean a messy dataset and report three findings from it', kind: 'Project' },
      { id: 'l3-quiz', label: 'Score 80% or higher on the Level 3 quiz', kind: 'Quiz' },
    ],
  },
  {
    id: 'l4',
    title: 'Your first models',
    outcome: 'You can train a model, measure it honestly, and explain why it over- or underfits.',
    icon: <TrendingUp className="h-4 w-4" />,
    requirements: [
      { id: 'l4-split', label: 'Solve 5 challenges on splitting data into training and test sets', kind: 'Challenges' },
      { id: 'l4-regression', label: 'Write linear regression from scratch with NumPy (6 challenges)', kind: 'Challenges' },
      { id: 'l4-classification', label: 'Write logistic regression for classification from scratch (6 challenges)', kind: 'Challenges' },
      { id: 'l4-metrics', label: 'Calculate accuracy, precision, recall, and error by hand (6 challenges)', kind: 'Challenges' },
      { id: 'l4-project', label: 'Predict a numeric value end to end, from raw data to evaluated model', kind: 'Project' },
      { id: 'l4-quiz', label: 'Score 80% or higher on the Level 4 quiz', kind: 'Quiz' },
    ],
  },
  {
    id: 'l5',
    title: 'Neural networks',
    outcome: 'You can explain how a neural network learns and build a small one yourself.',
    icon: <Brain className="h-4 w-4" />,
    requirements: [
      { id: 'l5-neuron', label: 'Solve 6 challenges on a single neuron and activation functions', kind: 'Challenges' },
      { id: 'l5-forward', label: 'Solve 6 challenges on the forward pass through multiple layers', kind: 'Challenges' },
      { id: 'l5-backprop', label: 'Solve 6 challenges on backpropagation and weight updates', kind: 'Challenges' },
      { id: 'l5-project', label: 'Train a two-layer neural network from scratch that solves XOR', kind: 'Project' },
      { id: 'l5-quiz', label: 'Score 80% or higher on the Level 5 quiz', kind: 'Quiz' },
    ],
  },
  {
    id: 'l6',
    title: 'Capstone project',
    outcome: 'You have one finished ML project that proves you can do the work.',
    icon: <Rocket className="h-4 w-4" />,
    requirements: [
      { id: 'l6-frame', label: 'Choose a dataset and write the problem you are solving in two sentences', kind: 'Project' },
      { id: 'l6-baseline', label: 'Build a simple baseline model and record its score', kind: 'Project' },
      { id: 'l6-improve', label: 'Improve on the baseline and show what changed the score', kind: 'Project' },
      { id: 'l6-writeup', label: 'Write up the problem, method, results, and limits in plain language', kind: 'Project' },
      { id: 'l6-quiz', label: 'Pass the final assessment with 80% or higher', kind: 'Quiz' },
    ],
  },
];

function loadProgress(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

export function LearnResourcesPage() {
  const [done, setDone] = useState<Record<string, boolean>>(loadProgress);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(done));
    } catch {
      // Storage can be unavailable; progress then lasts for this session only.
    }
  }, [done]);

  const passed = LEVELS.map((level) => level.requirements.every((r) => done[r.id]));
  const currentIndex = passed.findIndex((p) => !p);
  const levelsPassed = passed.filter(Boolean).length;
  const percent = Math.round((levelsPassed / LEVELS.length) * 100);

  const toggle = (id: string) => setDone((prev) => ({ ...prev, [id]: !prev[id] }));
  const reset = () => {
    setDone({});
    setOpen({});
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Machine learning pathway</h1>
        <p className="mt-1 text-sm text-slatey">
          Six levels from your first line of Python to a finished ML project. Complete every requirement in a level to pass it and unlock the next one.
        </p>
      </div>

      <div className="rounded-2xl border border-mist bg-white p-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-semibold text-ink">
            {levelsPassed === LEVELS.length
              ? 'All levels passed'
              : `Level ${currentIndex + 1} of ${LEVELS.length} in progress`}
          </p>
          <p className="text-sm text-slatey">
            {levelsPassed} of {LEVELS.length} passed
          </p>
        </div>
        <div
          className="mt-3 h-2 w-full overflow-hidden rounded-full bg-mist"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Levels passed"
        >
          <div className="h-full rounded-full bg-gradient-accent transition-all" style={{ width: `${percent}%` }} />
        </div>
        <div className="mt-3 flex justify-end">
          <button
            onClick={reset}
            disabled={Object.values(done).every((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full border border-mist bg-white px-3 py-1.5 text-xs font-medium text-slatey transition-all hover:border-ink/20 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw className="h-3 w-3" />
            Reset progress
          </button>
        </div>
      </div>

      <ol className="space-y-4">
        {LEVELS.map((level, index) => {
          const isPassed = passed[index];
          const isLocked = index > 0 && !passed[index - 1];
          const isCurrent = index === currentIndex;
          const doneCount = level.requirements.filter((r) => done[r.id]).length;
          const isOpen = !isLocked && (open[level.id] ?? isCurrent);

          return (
            <li
              key={level.id}
              className={`rounded-2xl border bg-white transition-all ${
                isCurrent ? 'border-ink/20 shadow-md' : 'border-mist'
              } ${isLocked ? 'opacity-60' : ''}`}
            >
              <button
                onClick={() => !isLocked && setOpen((prev) => ({ ...prev, [level.id]: !isOpen }))}
                disabled={isLocked}
                aria-expanded={isOpen}
                className="flex w-full items-start gap-3 p-5 text-left disabled:cursor-not-allowed"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-accent text-white">
                  {isLocked ? <Lock className="h-4 w-4" /> : isPassed ? <Check className="h-4 w-4" /> : level.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h2 className="text-base font-semibold text-ink">
                      Level {index + 1}: {level.title}
                    </h2>
                    {isPassed && (
                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-medium text-green-700">Passed</span>
                    )}
                    {isLocked && (
                      <span className="text-xs text-slatey">Pass Level {index} to unlock</span>
                    )}
                    {!isLocked && !isPassed && (
                      <span className="text-xs text-slatey">
                        {doneCount} of {level.requirements.length} done
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-slatey">{level.outcome}</p>
                </div>
                {!isLocked && (
                  <ChevronDown
                    className={`mt-1 h-4 w-4 shrink-0 text-slatey transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                )}
              </button>

              {isOpen && (
                <div className="border-t border-mist px-5 pb-5 pt-4">
                  <p className="mb-3 text-xs font-medium text-ink">To pass this level, complete:</p>
                  <ul className="space-y-2">
                    {level.requirements.map((req) => {
                      const checked = !!done[req.id];
                      return (
                        <li key={req.id} className="flex items-start gap-3">
                          <button
                            role="checkbox"
                            aria-checked={checked}
                            aria-label={`Mark "${req.label}" as ${checked ? 'not done' : 'done'}`}
                            onClick={() => toggle(req.id)}
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-coral ${
                              checked
                                ? 'border-transparent bg-gradient-accent text-white'
                                : 'border-ink/30 bg-white hover:border-ink/60'
                            }`}
                          >
                            {checked && <Check className="h-3.5 w-3.5" />}
                          </button>
                          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
                            <span className={`text-sm text-ink ${checked ? 'text-slatey line-through' : ''}`}>{req.label}</span>
                            <span className="rounded-full bg-mist px-2 py-0.5 text-[10px] font-medium text-slatey">{req.kind}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
