import { Link } from 'react-router-dom';
import { Loader2, ArrowLeft, Settings, TrendingUp, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { useMembership } from '@/lib/membership';
import { useDashboardData } from '@/lib/useDashboardData';
import { useAuth } from '@/lib/auth';
import {
  DASHBOARD_CATEGORIES,
  computeOverallScore,
  getCurrentStrength,
  isStale,
  getOldestUpdate,
  getDailyQuestion,
} from '@/lib/dashboard-data';
import ScoreBar from '@/components/dashboard/ScoreBar';
import ScoreBreakdown from '@/components/dashboard/ScoreBreakdown';
import QuestionOfTheDay from '@/components/dashboard/QuestionOfTheDay';
import ConnectionTracker from '@/components/dashboard/ConnectionTracker';
import TrackerSection from '@/components/dashboard/TrackerSection';
import InterviewCards from '@/components/dashboard/InterviewCards';
import ResumeSection from '@/components/dashboard/ResumeSection';
import CareerClarityWorkbook from '@/components/dashboard/CareerClarityWorkbook';

export default function Dashboard() {
  const { isStandard } = useMembership();
  const { user } = useAuth();
  const { scores, connections, trackerEntries, interviewQuestions, interviewAnswers, dailyQuestions, loading, error, refresh } = useDashboardData();

  const scoreMap: Record<string, number> = {};
  for (const s of scores) {
    scoreMap[s.category] = s.score;
  }

  const hasScores = DASHBOARD_CATEGORIES.some((c) => typeof scoreMap[c.id] === 'number');
  const overallScore = computeOverallScore(scoreMap);
  const currentStrength = getCurrentStrength(scoreMap);
  const oldestUpdate = getOldestUpdate(scores);
  const stale = hasScores && isStale(oldestUpdate);
  const dailyQuestion = getDailyQuestion(dailyQuestions);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <Loader2 className="h-6 w-6 animate-spin text-slatey" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slatey hover:text-ink transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Eteral
        </Link>

        {/* Header */}
        <div className="mt-6 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-coral" />
          <span className="text-xs font-semibold uppercase tracking-widest text-coral">
            Career Readiness Dashboard
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
          {user?.email ? `Welcome back` : 'Your dashboard'}
        </h1>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-600 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Empty state — no quiz taken yet */}
        {!hasScores && (
          <div className="mt-8 rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/5 via-white to-sky/5 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-accent text-white">
              <TrendingUp className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-ink">Not yet assessed</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slatey">
              Take the Career Readiness Quiz to get your scores across 8 categories and a personalized action plan.
            </p>
            <Link
              to="/career-readiness"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-accent px-6 py-3 text-sm font-medium text-white transition-all hover:scale-[1.03]"
            >
              <Sparkles className="h-4 w-4" />
              Take the readiness quiz
            </Link>
          </div>
        )}

        {/* Above the fold: Overall score + Question of the Day */}
        {hasScores && (
          <>
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Overall progress bar + current strength */}
              <div className="rounded-2xl border border-mist bg-white p-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-coral" />
                  <h3 className="text-base font-semibold text-ink">Overall Career Readiness</h3>
                </div>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-4xl font-semibold text-ink tabular-nums">{overallScore}</span>
                  <span className="text-sm text-slatey mb-1">/ 100</span>
                </div>
                <div className="mt-3 h-3 rounded-full bg-mist/60 overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-gradient-accent transition-all duration-700 ease-out"
                    style={{ width: `${overallScore}%` }}
                  />
                </div>
                {currentStrength && (
                  <p className="mt-4 text-sm text-slatey">
                    Your current strength: <span className="font-medium text-ink">{currentStrength.label}</span> ({currentStrength.score}/100)
                  </p>
                )}
                {stale && (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-coral">
                    <Clock className="h-3.5 w-3.5" />
                    Scores are over 30 days old — retake the quiz to refresh
                  </p>
                )}
              </div>

              {/* Question of the Day */}
              <QuestionOfTheDay question={dailyQuestion} isPaid={isStandard} />
            </div>

            {/* Main body: trackers side by side */}
            <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ConnectionTracker connections={connections} isPaid={isStandard} onRefresh={refresh} />
              <TrackerSection entries={trackerEntries} isPaid={isStandard} onRefresh={refresh} />
            </div>

            {/* Interview cards (full width) */}
            <div className="mt-5">
              <InterviewCards questions={interviewQuestions} answers={interviewAnswers} isPaid={isStandard} onRefresh={refresh} />
            </div>

            {/* Score breakdown + contextual upsells */}
            <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <ScoreBreakdown scores={scoreMap} isPaid={isStandard} />
              </div>
              <div className="space-y-5">
                {/* Career Clarity Workbook — near career clarity score */}
                <CareerClarityWorkbook purchased={false} />
                {/* Resume section — near resume score */}
                <ResumeSection isPaid={isStandard} />
              </div>
            </div>

            {/* Subscription management */}
            <div className="mt-8 rounded-2xl border border-mist bg-white/60 p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-base font-semibold text-ink flex items-center gap-2">
                    <Settings className="h-4 w-4 text-slatey" />
                    Subscription
                  </h3>
                  <p className="mt-1 text-sm text-slatey">
                    Manage your payment method, billing info, or cancel your subscription.
                  </p>
                </div>
                <Link
                  to="/membership"
                  className="rounded-full border border-mist bg-white px-5 py-2.5 text-sm font-medium text-ink transition-all hover:border-ink/20"
                >
                  Manage membership
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
