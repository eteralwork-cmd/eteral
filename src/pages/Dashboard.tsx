import { useState, useEffect } from 'react';
import { useDashboard } from '@/lib/useDashboard';
import { useMembership } from '@/lib/membership';
import { DashboardLayout, DashboardLoader } from '@/components/dashboard/DashboardLayout';
import { Onboarding } from '@/components/dashboard/Onboarding';
import { OverviewPage } from '@/components/dashboard/OverviewPage';
import { SkillTrackPage } from '@/components/dashboard/SkillTrackPage';
import { ProjectsPage } from '@/components/dashboard/ProjectsPage';
import { ClarityPage } from '@/components/dashboard/ClarityPage';
import { getLevelForXp } from '@/lib/gamification';
import { useLocation } from 'react-router-dom';

type DashboardView = 'overview' | 'skills' | 'projects' | 'clarity';

function getViewById(path: string): DashboardView {
  if (path.includes('/skills')) return 'skills';
  if (path.includes('/projects')) return 'projects';
  if (path.includes('/clarity')) return 'clarity';
  return 'overview';
}

export default function Dashboard() {
  const dashboard = useDashboard();
  const { isStandard } = useMembership();
  const location = useLocation();
  const [view, setView] = useState<DashboardView>('overview');

  useEffect(() => {
    setView(getViewById(location.pathname));
  }, [location.pathname]);

  if (dashboard.loading) {
    return <DashboardLoader />;
  }

  // Show onboarding if profile doesn't exist or isn't completed
  if (!dashboard.profile || !dashboard.profile.onboarding_completed) {
    return <Onboarding onComplete={dashboard.completeOnboarding} />;
  }

  const levelLabel = getLevelForXp(dashboard.profile.xp).label;

  return (
    <DashboardLayout
      streak={dashboard.profile.current_streak}
      level={dashboard.profile.level}
      levelLabel={levelLabel}
    >
      {view === 'overview' && <OverviewPage dashboard={dashboard} />}
      {view === 'skills' && <SkillTrackPage dashboard={dashboard} />}
      {view === 'projects' && <ProjectsPage dashboard={dashboard} />}
      {view === 'clarity' && <ClarityPage dashboard={dashboard} />}
    </DashboardLayout>
  );
}
