import { Navigate, type RouteObject } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { type ReactNode } from 'react';
import { SeleccionArea } from '../pages/public/SeleccionArea';
import { Encuesta } from '../pages/public/Encuesta';
import { Gracias } from '../pages/public/Gracias';
import { Login } from '../pages/admin/Login';
import { Dashboard } from '../pages/admin/Dashboard';
import { GestionAreas } from '../pages/admin/GestionAreas';
import { GestionColaboradores } from '../pages/admin/GestionColaboradores';
import type { RolUsuario } from '../types';

function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/gestion-clc/login" replace />;
}

function RoleRoute({ roles, children }: { roles: RolUsuario[]; children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/gestion-clc/login" replace />;
  if (!user || !roles.includes(user.rol)) {
    return <Navigate to="/gestion-clc/dashboard" replace />;
  }
  return <>{children}</>;
}

export const routes: RouteObject[] = [
  { path: '/', element: <SeleccionArea /> },
  { path: '/encuesta', element: <Encuesta /> },
  { path: '/gracias', element: <Gracias /> },
  { path: '/gestion-clc/login', element: <Login /> },
  {
    path: '/gestion-clc/dashboard',
    element: <PrivateRoute><Dashboard /></PrivateRoute>,
  },
  {
    path: '/gestion-clc/areas',
    element: <RoleRoute roles={['ADMIN']}><GestionAreas /></RoleRoute>,
  },
  {
    path: '/gestion-clc/colaboradores',
    element: <RoleRoute roles={['ADMIN']}><GestionColaboradores /></RoleRoute>,
  },
  { path: '/gestion-clc', element: <Navigate to="/gestion-clc/dashboard" replace /> },
  { path: '*', element: <Navigate to="/" replace /> },
];
