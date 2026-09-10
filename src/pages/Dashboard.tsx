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
  Search,
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
import ScoreBar from '@/components/dashboard/ScoreBar';
import ScoreBreakdown from '@/components/dashboard/ScoreBreakdown';
import QuestionOfTheDay from '@/components/dashboard/QuestionOfTheDay';
import ConnectionTracker from '@/components/dashboard/ConnectionTracker';
import TrackerSection from '@/components/dashboard/TrackerSection';
import InterviewCards from '@/components/dashboard/InterviewCards';
/*import ResumeSection from '@/components/dashboard/ResumeSection';
import CareerClarityWorkbook from '@/components/dashboard/CareerClarityWorkbook';*/

type SectionId = 'overview' | 'resume' | 'interview' | 'projects' | 'skills' | 'career-search';

const NAV_ITEMS: { id: SectionId; label: string; icon: typeof Sparkles }[] = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'resume', label: 'Resume Builder', icon: FileText },
  { id: 'interview', label: 'Interview Prep', icon: MessageSquare },
  { id: 'projects', label: 'Project Tracker', icon: FolderKanban },
  { id: 'skills', label: 'Skill Set Management', icon: ListChecks },
  /*{ id: 'career-search', label: 'Find Career Skills', icon: Search },*/
];

export default function Dashboard() {
  const { isStandard } = useMembership();
  const { user } = useAuth();
  const { scores, connections, trackerEntries, interviewQuestions, interviewAnswers, dailyQuestions, loading, error, refresh } = useDashboardData();
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
                    active
                      ? 'bg-ink text-white'
                      : 'text-slatey hover:bg-mist/40 hover:text-ink'
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
          <main className="min-w-0 flex-1">
            {activeSection === 'overview' && (
              <>
                <ScoreBar score={overallScore} category={''} />
                <ScoreBreakdown scores={scoreMap} isPaid={false} />
                <QuestionOfTheDay question={dailyQuestion} isPaid={false} />
                <ConnectionTracker connections={connections} isPaid={false} onRefresh={function (): void {
                  throw new Error('Function not implemented.');
                } } />
                <TrackerSection entries={trackerEntries} isPaid={false} onRefresh={function (): void {
                  throw new Error('Function not implemented.');
                } } />
              </>
            )}
            {activeSection === 'interview' && (
              <InterviewCards questions={interviewQuestions} answers={interviewAnswers} isPaid={false} onRefresh={function (): void {
                throw new Error('Function not implemented.');
              } } />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}