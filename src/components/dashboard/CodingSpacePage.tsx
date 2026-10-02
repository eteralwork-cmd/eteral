import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Code2,
  Lock,
  Loader2,
  Play,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  Sparkles,
  Gauge,
  Zap,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useMembership } from '@/lib/membership';
import { useDashboard } from '@/lib/useDashboard';
import { XP_REWARDS } from '@/lib/gamification';
import PaywallCard from './PaywallCard';

type Language = { label: string; value: string; judge0Id: number };
type Level = { label: string; value: string };
type Mode = { label: string; value: string; minutes: number };

const LANGUAGES: Language[] = [
  { label: 'JavaScript', value: 'javascript', judge0Id: 63 },
  { label: 'Python', value: 'python', judge0Id: 71 },
  { label: 'Java', value: 'java', judge0Id: 62 },
  { label: 'C++', value: 'cpp', judge0Id: 76 },
  { label: 'C', value: 'c', judge0Id: 50 },
  { label: 'TypeScript', value: 'typescript', judge0Id: 94 },
  { label: 'Ruby', value: 'ruby', judge0Id: 72 },
  { label: 'Go', value: 'go', judge0Id: 60 },
  { label: 'Rust', value: 'rust', judge0Id: 91 },
  { label: 'PHP', value: 'php', judge0Id: 68 },
];

const LEVELS: Level[] = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Pro', value: 'pro' },
  { label: 'Master', value: 'master' },
];

const MODES: Mode[] = [
  { label: 'Quick', value: 'quick', minutes: 5 },
  { label: 'Standard', value: 'standard', minutes: 15 },
  { label: 'Deep', value: 'deep', minutes: 30 },
];

const JUDGE0_LIMIT = 1000;
const GEMINI_LIMIT = 5000000;

type Challenge = {
  title: string;
  description: string;
  starterCode: string;
  solution: string;
  testCases: { input: string; expectedOutput: string }[];
  language: string;
  judge0LanguageId: number;
  level: string;
  mode: string;
};

type TestResult = { passed: boolean; input: string; expected: string; actual: string; stderr: string };

type Phase = 'setup' | 'loading' | 'challenge' | 'results';

export function CodingSpacePage({ dashboard }: { dashboard: ReturnType<typeof useDashboard> }) {
  const { isStandard } = useMembership();
  const { user } = useAuth();
  const { awardXp, refresh, codingChallenges } = dashboard;
  const [phase, setPhase] = useState<Phase>('setup');
  const [language, setLanguage] = useState<Language | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState('');
  const [running, setRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quotaError, setQuotaError] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Quota data from the hook
  const quota = dashboard.aiUsageQuota;

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => () => stopTimer(), [stopTimer]);

  const startTimer = useCallback((minutes: number) => {
    stopTimer();
    setTimeLeft(minutes * 60);
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stopTimer]);

  const handleGenerate = async () => {
    if (!language || !level || !mode) return;
    setPhase('loading');
    setError(null);
    setQuotaError(false);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('coding-challenge-generate', {
        body: { language: language.value, level: level.value, mode: mode.value },
      });

      if (fnError || !data) {
        throw new Error(fnError?.message ?? 'Failed to generate challenge');
      }

      const result = data as Challenge;
      setChallenge(result);
      setCode(result.starterCode || '');
      setTestResults(null);
      setPhase('challenge');
      startTimer(mode.minutes);
      await refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate challenge';
      setError(msg);
      setQuotaError(msg.includes('limit reached') || msg.includes('quota'));
      setPhase('setup');
    }
  };

  const handleRunCode = async () => {
    if (!challenge || !code) return;
    setRunning(true);
    setError(null);
    setQuotaError(false);

    try {
      const results: TestResult[] = [];

      for (const testCase of challenge.testCases) {
        const { data, error: fnError } = await supabase.functions.invoke('judge0-run', {
          body: {
            sourceCode: code,
            languageId: challenge.judge0LanguageId,
            stdin: testCase.input,
          },
        });

        if (fnError || !data) {
          results.push({
            passed: false,
            input: testCase.input || '(none)',
            expected: testCase.expectedOutput,
            actual: '',
            stderr: fnError?.message ?? 'Execution failed',
          });
          continue;
        }

        const actual = (data.stdout ?? '').trim();
        const expected = (testCase.expectedOutput ?? '').trim();
        const stderr = data.stderr ?? data.compileOutput ?? '';

        results.push({
          passed: actual === expected && !stderr,
          input: testCase.input || '(none)',
          expected,
          actual,
          stderr,
        });
      }

      setTestResults(results);
      const allPassed = results.every((r) => r.passed);

      if (user) {
        await supabase.from('coding_challenges').insert({
          user_id: user.id,
          language: challenge.language,
          level: challenge.level,
          mode: challenge.mode,
          problem_title: challenge.title,
          problem_description: challenge.description,
          starter_code: challenge.starterCode,
          solution_code: challenge.solution,
          test_cases: challenge.testCases,
          user_code: code,
          passed: allPassed,
          test_results: results,
          time_taken_seconds: Math.round((Date.now() - startTimeRef.current) / 1000),
        });

        await awardXp(
          allPassed ? 'complete_coding_challenge' : 'fail_coding_challenge',
          allPassed ? `Solved coding challenge: ${challenge.title}` : `Attempted coding challenge: ${challenge.title}`,
          allPassed ? XP_REWARDS.complete_coding_challenge : XP_REWARDS.fail_coding_challenge,
        );
      }

      stopTimer();
      setPhase('results');
      await refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to run code';
      setError(msg);
      setQuotaError(msg.includes('limit reached') || msg.includes('quota'));
    } finally {
      setRunning(false);
    }
  };

  const handleReset = () => {
    setPhase('setup');
    setChallenge(null);
    setCode('');
    setTestResults(null);
    setError(null);
    setQuotaError(false);
    stopTimer();
  };

  // Paywall for free users
  if (!isStandard) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Coding Space</h1>
          <p className="mt-1 text-sm text-slatey">Practice with AI-generated coding challenges and run your code in real time.</p>
        </div>
        <PaywallCard teaser="Coding Space generates personalized coding challenges with AI and runs your code instantly. Upgrade to Standard to unlock it.">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Code2 className="h-5 w-5 text-coral" />
              <span className="text-sm font-medium text-ink">Take a Challenge</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {['JavaScript', 'Python', 'Java'].map((l) => (
                <div key={l} className="rounded-xl border border-mist bg-paper px-3 py-2 text-center text-xs font-medium text-slatey">{l}</div>
              ))}
            </div>
            <div className="rounded-xl border border-mist bg-paper p-4 font-mono text-xs text-slatey">
              <p>{'// Your AI-generated challenge appears here'}</p>
              <p className="mt-2">{'function solve() {'}</p>
              <p>{'  // Write your solution'}</p>
              <p>{'}'}</p>
            </div>
          </div>
        </PaywallCard>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const judge0Used = quota?.judge0_executions ?? 0;
  const judge0Remaining = JUDGE0_LIMIT - judge0Used;
  const geminiUsed = quota?.gemini_tokens_used ?? 0;
  const geminiRemaining = GEMINI_LIMIT - geminiUsed;
  const judge0Pct = Math.min(100, (judge0Used / JUDGE0_LIMIT) * 100);
  const geminiPct = Math.min(100, (geminiUsed / GEMINI_LIMIT) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Coding Space</h1>
          <p className="mt-1 text-sm text-slatey">AI-generated challenges tailored to your level. Run code and get instant feedback.</p>
        </div>
        {phase !== 'setup' && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-full border border-mist bg-white px-4 py-2 text-xs font-medium text-slatey hover:text-ink transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New Challenge
          </button>
        )}
      </div>

      {/* Quota usage bars */}
      {phase === 'setup' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-mist bg-white p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-coral" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slatey">Code Executions</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-lg font-semibold text-ink tabular-nums">{judge0Remaining}</span>
              <span className="text-xs text-slatey">/ {JUDGE0_LIMIT} remaining</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-mist/60 overflow-hidden">
              <div className={`h-1.5 rounded-full transition-all ${judge0Pct > 80 ? 'bg-red-400' : 'bg-gradient-accent'}`} style={{ width: `${judge0Pct}%` }} />
            </div>
          </div>
          <div className="rounded-2xl border border-mist bg-white p-4">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-coral" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slatey">AI Tokens</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-lg font-semibold text-ink tabular-nums">{(geminiRemaining / 1000000).toFixed(2)}M</span>
              <span className="text-xs text-slatey">/ {(GEMINI_LIMIT / 1000000).toFixed(0)}M remaining</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-mist/60 overflow-hidden">
              <div className={`h-1.5 rounded-full transition-all ${geminiPct > 80 ? 'bg-red-400' : 'bg-gradient-accent'}`} style={{ width: `${geminiPct}%` }} />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${quotaError ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-red-200 bg-red-50 text-red-600'}`}>
          {error}
        </div>
      )}

      {/* Phase: Setup */}
      {phase === 'setup' && (
        <div className="rounded-2xl border border-mist bg-white p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-coral" />
            <h2 className="text-base font-semibold text-ink">Take a Challenge</h2>
          </div>

          <SetupStep number={1} label="What language?" selected={language?.label}>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => setLanguage(lang)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    language?.value === lang.value
                      ? 'bg-gradient-accent text-white'
                      : 'border border-mist bg-paper text-slatey hover:border-ink/20 hover:text-ink'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </SetupStep>

          <SetupStep number={2} label="What level?" selected={level?.label} disabled={!language}>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl.value}
                  onClick={() => setLevel(lvl)}
                  disabled={!language}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all disabled:opacity-40 ${
                    level?.value === lvl.value
                      ? 'bg-gradient-accent text-white'
                      : 'border border-mist bg-paper text-slatey hover:border-ink/20 hover:text-ink'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </SetupStep>

          <SetupStep number={3} label="What mode?" selected={mode?.label ? `${mode.label} (${mode.minutes} min)` : undefined} disabled={!level}>
            <div className="flex flex-wrap gap-2">
              {MODES.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMode(m)}
                  disabled={!level}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all disabled:opacity-40 ${
                    mode?.value === m.value
                      ? 'bg-gradient-accent text-white'
                      : 'border border-mist bg-paper text-slatey hover:border-ink/20 hover:text-ink'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  {m.label} · {m.minutes} min
                </button>
              ))}
            </div>
          </SetupStep>

          <button
            onClick={handleGenerate}
            disabled={!language || !level || !mode}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-accent px-6 py-3.5 text-sm font-medium text-white transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles className="h-4 w-4" />
            Generate Challenge
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Phase: Loading */}
      {phase === 'loading' && (
        <div className="rounded-2xl border border-mist bg-white p-12 flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-coral" />
          <p className="text-sm text-slatey">Generating your {level?.label} {language?.label} challenge...</p>
        </div>
      )}

      {/* Phase: Challenge */}
      {phase === 'challenge' && challenge && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-mist bg-white px-5 py-3">
            <div className="flex items-center gap-2">
              <Clock className={`h-4 w-4 ${timeLeft <= 60 ? 'text-red-500' : 'text-coral'}`} />
              <span className={`text-sm font-semibold tabular-nums ${timeLeft <= 60 ? 'text-red-500' : 'text-ink'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-mist/60 px-3 py-1 text-xs font-medium text-slatey">{language?.label}</span>
              <span className="rounded-full bg-mist/60 px-3 py-1 text-xs font-medium text-slatey">{level?.label}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-mist bg-white p-5">
            <h2 className="text-base font-semibold text-ink">{challenge.title}</h2>
            <p className="mt-2 text-sm text-slatey leading-relaxed whitespace-pre-wrap">{challenge.description}</p>
          </div>

          <div className="rounded-2xl border border-mist bg-[#1e1e2e] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-stone-400">Your Code</span>
              <span className="text-xs text-stone-500">{language?.label}</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="w-full h-64 bg-transparent font-mono text-sm text-stone-200 resize-none focus:outline-none"
              placeholder="Write your solution here..."
            />
          </div>

          <button
            onClick={handleRunCode}
            disabled={running || !code.trim()}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-accent px-6 py-3.5 text-sm font-medium text-white transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {running ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running test cases...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Code
              </>
            )}
          </button>
        </div>
      )}

      {/* Phase: Results */}
      {phase === 'results' && testResults && (
        <div className="space-y-4">
          {(() => {
            const allPassed = testResults.every((r) => r.passed);
            const passedCount = testResults.filter((r) => r.passed).length;
            return (
              <>
                <div className={`rounded-2xl border p-6 flex flex-col items-center gap-3 ${
                  allPassed ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'
                }`}>
                  {allPassed ? (
                    <Trophy className="h-10 w-10 text-green-600" />
                  ) : (
                    <Sparkles className="h-10 w-10 text-amber-600" />
                  )}
                  <h2 className="text-lg font-semibold text-ink">
                    {allPassed ? 'Challenge Complete!' : 'Almost there!'}
                  </h2>
                  <p className="text-sm text-slatey">
                    {passedCount} of {testResults.length} test cases passed · +{allPassed ? XP_REWARDS.complete_coding_challenge : XP_REWARDS.fail_coding_challenge} XP
                  </p>
                  <button
                    onClick={handleReset}
                    className="mt-2 inline-flex items-center gap-2 rounded-full bg-gradient-accent px-5 py-2.5 text-sm font-medium text-white transition-all hover:scale-[1.02]"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Try Another Challenge
                  </button>
                </div>

                <div className="space-y-3">
                  {testResults.map((result, i) => (
                    <div key={i} className={`rounded-xl border p-4 ${
                      result.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}>
                      <div className="flex items-center gap-2">
                        {result.passed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                        )}
                        <span className="text-sm font-medium text-ink">Test Case {i + 1}</span>
                      </div>
                      <div className="mt-3 space-y-1.5 text-xs">
                        <div>
                          <span className="font-medium text-slatey">Input: </span>
                          <code className="text-ink">{result.input}</code>
                        </div>
                        <div>
                          <span className="font-medium text-slatey">Expected: </span>
                          <code className="text-ink">{result.expected}</code>
                        </div>
                        <div>
                          <span className="font-medium text-slatey">Your output: </span>
                          <code className={result.passed ? 'text-green-700' : 'text-red-600'}>{result.actual || '(empty)'}</code>
                        </div>
                        {result.stderr && (
                          <div className="mt-2 rounded-lg bg-red-100 p-2">
                            <span className="font-medium text-red-700">Error: </span>
                            <code className="text-red-600">{result.stderr}</code>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Recent challenge history */}
      {phase === 'setup' && codingChallenges.length > 0 && (
        <div className="rounded-2xl border border-mist bg-white p-5">
          <h2 className="text-base font-semibold text-ink">Recent Challenges</h2>
          <div className="mt-4 space-y-2">
            {codingChallenges.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-mist bg-paper px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{c.problem_title}</p>
                  <p className="text-xs text-slatey">{c.language} · {c.level} · {c.mode}</p>
                </div>
                {c.passed ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SetupStep({ number, label, selected, disabled, children }: {
  number: number;
  label: string;
  selected?: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={disabled ? 'opacity-40' : ''}>
      <div className="flex items-center gap-2 mb-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-accent text-xs font-semibold text-white">{number}</span>
        <span className="text-sm font-medium text-ink">{label}</span>
        {selected && (
          <span className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-coral">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {selected}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
