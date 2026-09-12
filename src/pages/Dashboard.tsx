import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Loader2,
  ArrowLeft,
  Settings,
  TrendingUp,
  Sparkles,
  Clock,
  AlertCircle,
  FileText,
  MessageSquare,
  FolderKanban,
  ListChecks,
} from 'lucide-react';
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
import ScoreBreakdown from '@/components/dashboard/ScoreBreakdown';
import QuestionOfTheDay from '@/components/dashboard/QuestionOfTheDay';
import ConnectionTracker from '@/components/dashboard/ConnectionTracker';
import TrackerSection from '@/components/dashboard/TrackerSection';
import InterviewCards from '@/components/dashboard/InterviewCards';
import ResumeSection from '@/components/dashboard/ResumeSection';
import CareerClarityWorkbook from '@/components/dashboard/CareerClarityWorkbook';
import WeeklyGoalCard from '@/components/dashboard/WeeklyGoalCard';
import EterAlAssistant from '@/components/EterAlAssistant';

type SectionId = 'overview' | 'resume' | 'interview' | 'projects' | 'skills';

const NAV_ITEMS: { id: SectionId; label: string; icon: typeof Sparkles }[] = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'resume', label: 'Resume Builder', icon: FileText },
  { id: 'interview', label: 'Interview Prep', icon: MessageSquare },
  { id: 'projects', label: 'Project Tracker', icon: FolderKanban },
  { id: 'skills', label: 'Skill Set Management', icon: ListChecks },
];

export default function Dashboard() {
  const { isStandard } = useMembership();
  const { user } = useAuth();
  const {
    scores,
    connections,
    trackerEntries,
    interviewQuestions,
    interviewAnswers,
    dailyQuestions,
    loading,
    error,
    refresh,
  } = useDashboardData();
  const [activeSection, setActiveSection] = useState<SectionId>('overview');

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
      <div className="mx-auto max-w-6xl px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slatey hover:text-ink transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Eteral
        </Link>

        {/* Header */}
        <div className="mt-6 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-coral" />
          <span className="text-xs font-semibold uppercase tracking-widest text-coral">
            Your Career Readiness Dashboard
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

        {/* Mobile nav — horizontal pills */}
        <nav className="lg:hidden mt-6 -mx-6 flex gap-2 overflow-x-auto px-6 pb-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active ? 'bg-gradient-accent text-white' : 'border border-mist bg-white text-slatey'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-6 flex gap-8 items-start">
          {/* Desktop side panel */}
          <aside className="hidden lg:flex lg:w-60 lg:shrink-0 lg:flex-col lg:sticky lg:top-8 gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-left transition-colors ${
                    active ? 'bg-ink text-white' : 'text-slatey hover:bg-mist/40 hover:text-ink'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </button>
              );
            })}

            <Link
              to="/membership"
              className="mt-4 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-left text-slatey hover:bg-mist/40 hover:text-ink transition-colors"
            >
              <Settings className="h-4 w-4 shrink-0" />
              Subscription
            </Link>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {activeSection === 'overview' && (
              <>
                {!hasScores ? (
                  <div className="rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/5 via-white to-sky/5 p-8 text-center">
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
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

                    <WeeklyGoalCard />

                    <div className="md:col-span-2">
                      <QuestionOfTheDay question={dailyQuestion} isPaid={isStandard} />
                    </div>
                  </div>
                )}
              </>
            )}

            {activeSection === 'resume' && <ResumeSection />}

            {activeSection === 'interview' && (
              <InterviewCards
                questions={interviewQuestions}
                answers={interviewAnswers}
                isPaid={isStandard}
                onRefresh={refresh}
              />
            )}

            {activeSection === 'projects' && (
              <div className="space-y-5">
                <TrackerSection entries={trackerEntries} isPaid={isStandard} onRefresh={refresh} />
                <ConnectionTracker connections={connections} isPaid={isStandard} onRefresh={refresh} />
              </div>
            )}

            {activeSection === 'skills' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2">
                  <ScoreBreakdown scores={scoreMap} isPaid={isStandard} />
                </div>
                <CareerClarityWorkbook purchased={false} />
              </div>
            )}
          </main>
        </div>
      </div>

      <EterAlAssistant />
    </div>
  );
}