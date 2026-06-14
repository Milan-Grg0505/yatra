import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/hooks';
import { ROUTES } from '@/lib/constant';
import { LoadingPage } from '@/pages/LoadingPage';
import type { Role } from '@/types';

interface ProtectedRouteProps {
  children: ReactNode;
  allow?: Role[];
}

export function ProtectedRoute({ children, allow }: ProtectedRouteProps) {
  const { user, token } = useAuth();
  const location = useLocation();

  // Token exists but user not loaded yet → wait with branded loader
  if (token && !user) {
    return <LoadingPage message="Verifying your session…" />;
  }

  if (!token || !user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location.pathname }} replace />;
  }

  if (allow && !allow.includes(user.role)) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
}

interface GuestOnlyRouteProps {
  children: ReactNode;
}

/** Redirect away from auth pages if already logged in. */
export function GuestOnlyRoute({ children }: GuestOnlyRouteProps) {
  const { user } = useAuth();
  if (user) {
    if (user.role === 'admin') return <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />;
    if (user.role === 'owner') return <Navigate to={ROUTES.OWNER.DASHBOARD} replace />;
    return <Navigate to={ROUTES.HOME} replace />;
  }
  return <>{children}</>;
}
