import { lazy } from 'react';

// El panel administrativo (incluye Recharts, ~media tonelada de JS) se carga
// bajo demanda para que el bundle público que abren los socios desde el QR
// sea liviano. Las páginas usan exports nombrados, de ahí el .then().
export const Login = lazy(() => import('../pages/admin/Login').then((m) => ({ default: m.Login })));
export const Dashboard = lazy(() => import('../pages/admin/Dashboard').then((m) => ({ default: m.Dashboard })));
export const GestionAreas = lazy(() => import('../pages/admin/GestionAreas').then((m) => ({ default: m.GestionAreas })));
export const GestionColaboradores = lazy(() => import('../pages/admin/GestionColaboradores').then((m) => ({ default: m.GestionColaboradores })));
export const GestionUsuarios = lazy(() => import('../pages/admin/GestionUsuarios').then((m) => ({ default: m.GestionUsuarios })));
