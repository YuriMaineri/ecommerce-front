import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Spinner } from './Spinner';

interface ProtectedRouteProps {
  children: ReactNode;
  /** Se definido, exige que o usuario tenha este papel. */
  requireRole?: 'ADMIN' | 'CUSTOMER';
}

export function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Spinner label="Verificando sessao..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireRole === 'ADMIN' && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireRole === 'CUSTOMER' && user?.role !== 'CUSTOMER') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
