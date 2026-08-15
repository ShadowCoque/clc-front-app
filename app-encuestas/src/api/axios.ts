import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('clc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url: string = error.config?.url ?? '';
    // 401 de sesión expirada/revocada: cerrar sesión y volver al login.
    // El 401 del propio /auth/login (credenciales incorrectas) lo maneja el
    // formulario; redirigir aquí recargaría la página y borraría el mensaje.
    if (error.response?.status === 401 && !url.includes('/auth/login')) {
      localStorage.removeItem('clc_token');
      localStorage.removeItem('clc_usuario');
      window.location.href = '/gestion-clc/login';
    }
    return Promise.reject(error);
  },
);
