import { Navigate } from 'react-router-dom';
import { type ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { RolUsuario } from '../types';

export function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/gestion-clc/login" replace />;
}

export function RoleRoute({ roles, children }: { roles: RolUsuario[]; children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/gestion-clc/login" replace />;
  if (!user || !roles.includes(user.rol)) {
    return <Navigate to="/gestion-clc/dashboard" replace />;
  }
  return <>{children}</>;
}
