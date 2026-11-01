import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useMembership } from '@/lib/membership';
import {
  Home,
  Award,
  FolderKanban,
  Mic,
  Settings,
  LogOut,
  Menu,
  X,
  Flame,
  Loader2,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Overview', icon: Home },
  { path: '/dashboard/skills', label: 'Skill Track', icon: Award },
  { path: '/dashboard/projects', label: 'Projects', icon: FolderKanban },
  { path: '/dashboard/clarity', label: 'Clarity', icon: Mic },
];

type Props = {
  children: ReactNode;
  streak: number;
  level: number;
  levelLabel: string;
};

export function DashboardLayout({ children, streak, level, levelLabel }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isStandard } = useMembership();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-paper flex">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r border-mist bg-white/60 fixed inset-y-0 left-0 z-30">
        <SidebarContent
          location={location.pathname}
          streak={streak}
          level={level}
          levelLabel={levelLabel}
          isStandard={isStandard}
          onSignOut={handleSignOut}
        />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 inset-y-0 w-64 bg-white border-r border-mist flex flex-col">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-slatey hover:text-ink">
              <X className="h-5 w-5" />
            </button>
            <SidebarContent
              location={location.pathname}
              streak={streak}
              level={level}
              levelLabel={levelLabel}
              isStandard={isStandard}
              onSignOut={handleSignOut}
            />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-64">
        {/* Mobile header */}
        <header className="md:hidden sticky top-0 z-20 bg-paper/80 backdrop-blur-xl border-b border-mist px-4 py-3 flex items-center justify-between">
          <button onClick={() => setMobileOpen(true)} className="text-ink">
            <Menu className="h-6 w-6" />
          </button>
          <span className="text-sm font-semibold text-ink">Eteral Dashboard</span>
          <div className="flex items-center gap-1 text-sm font-medium text-coral">
            <Flame className="h-4 w-4" />
            {streak}
          </div>
        </header>

        <main className="px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  location,
  streak,
  level,
  levelLabel,
  isStandard,
  onSignOut,
}: {
  location: string;
  streak: number;
  level: number;
  levelLabel: string;
  isStandard: boolean;
  onSignOut: () => void;
}) {
  return (
    <>
      <div className="p-5 border-b border-mist">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="text-[1.15rem] font-medium tracking-tight text-ink lowercase">eteral</span>
        </Link>
      </div>

      {/* Streak + Level badge */}
      <div className="px-4 py-4 space-y-2">
        <div className="flex items-center justify-between rounded-xl border border-mist bg-paper px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-coral" />
            <span className="text-xs font-medium text-slatey">Streak</span>
          </div>
          <span className="text-sm font-semibold text-ink tabular-nums">{streak} day{streak === 1 ? '' : 's'}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-mist bg-paper px-3 py-2.5">
          <span className="text-xs font-medium text-slatey">Level {level}</span>
          <span className="text-xs font-semibold text-ink truncate ml-2">{levelLabel}</span>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = location === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-gradient-accent text-white'
                  : 'text-slatey hover:text-ink hover:bg-mist/40'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-mist space-y-1">
        {!isStandard && (
          <Link
            to="/membership"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-coral hover:bg-coral/5 transition-colors"
          >
            <Settings className="h-4 w-4 shrink-0" />
            Upgrade to Pro
          </Link>
        )}
        <Link
          to="/membership"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slatey hover:text-ink hover:bg-mist/40 transition-colors"
        >
          <Settings className="h-4 w-4 shrink-0" />
          Membership
        </Link>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slatey hover:text-ink hover:bg-mist/40 transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </div>
    </>
  );
}

export function DashboardLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <Loader2 className="h-6 w-6 animate-spin text-slatey" />
    </div>
  );
}
