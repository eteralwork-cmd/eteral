import { ReactNode, useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from './auth';
import { useMembership } from './membership';

type Props = {
  children: ReactNode;
  requirePaid?: boolean;
};

export default function ProtectedRoute({ children, requirePaid = false }: Props) {
  const { user, loading: authLoading } = useAuth();
  const { isStandard, loading: membershipLoading } = useMembership();
  const location = useLocation();
  const intendedDest = useRef(location.pathname);

  useEffect(() => {
    intendedDest.current = location.pathname;
  }, [location.pathname]);

  if (authLoading || (requirePaid && membershipLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <Loader2 className="h-6 w-6 animate-spin text-slatey" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: intendedDest.current }} replace />;
  }

  if (requirePaid && !isStandard) {
    return <Navigate to="/membership" replace />;
  }

  return <>{children}</>;
}