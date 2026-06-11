import { Suspense } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { SeleccionArea } from '../pages/public/SeleccionArea';
import { Encuesta } from '../pages/public/Encuesta';
import { Gracias } from '../pages/public/Gracias';
import { Spinner } from '../components/ui/Spinner';
import { PrivateRoute, RoleRoute } from './guards';
import { Login, Dashboard, GestionAreas, GestionColaboradores } from './adminPages';

const cargandoAdmin = (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <Spinner size="lg" className="text-[#063E7B]" />
  </div>
);

export const routes: RouteObject[] = [
  { path: '/', element: <SeleccionArea /> },
  { path: '/encuesta', element: <Encuesta /> },
  { path: '/gracias', element: <Gracias /> },
  {
    path: '/gestion-clc/login',
    element: <Suspense fallback={cargandoAdmin}><Login /></Suspense>,
  },
  {
    path: '/gestion-clc/dashboard',
    element: (
      <Suspense fallback={cargandoAdmin}>
        <PrivateRoute><Dashboard /></PrivateRoute>
      </Suspense>
    ),
  },
  {
    path: '/gestion-clc/areas',
    element: (
      <Suspense fallback={cargandoAdmin}>
        <RoleRoute roles={['ADMIN']}><GestionAreas /></RoleRoute>
      </Suspense>
    ),
  },
  {
    path: '/gestion-clc/colaboradores',
    element: (
      <Suspense fallback={cargandoAdmin}>
        <RoleRoute roles={['ADMIN']}><GestionColaboradores /></RoleRoute>
      </Suspense>
    ),
  },
  { path: '/gestion-clc', element: <Navigate to="/gestion-clc/dashboard" replace /> },
  { path: '*', element: <Navigate to="/" replace /> },
];
