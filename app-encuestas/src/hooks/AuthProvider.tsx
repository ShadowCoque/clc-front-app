import { useState, useCallback, useEffect, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { login as apiLogin, me as apiMe } from '../api/auth';
import { AuthContext } from './authContext';
import type { Usuario } from '../types';

function getStoredUser(): Usuario | null {
  try {
    const raw = localStorage.getItem('clc_usuario');
    return raw ? (JSON.parse(raw) as Usuario) : null;
  } catch {
    return null;
  }
}

function isTokenValid(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const storedToken = localStorage.getItem('clc_token');
  const validToken = storedToken && isTokenValid(storedToken) ? storedToken : null;

  const [token, setToken] = useState<string | null>(validToken);
  const [user, setUser] = useState<Usuario | null>(validToken ? getStoredUser() : null);

  // Con sesión activa, refresca el perfil desde el backend: si un admin cambió
  // rol/áreas del usuario, la UI lo refleja sin exigir re-login. Si el token ya
  // no sirve (usuario desactivado), el interceptor de axios cierra la sesión.
  useEffect(() => {
    if (!token) return;
    let cancelado = false;
    apiMe()
      .then((usuario) => {
        if (cancelado) return;
        localStorage.setItem('clc_usuario', JSON.stringify(usuario));
        setUser(usuario);
      })
      .catch(() => {
        // Sin conexión u otro error: se conserva el usuario almacenado.
      });
    return () => {
      cancelado = true;
    };
  }, [token]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiLogin(email, password);
      // La caché de React Query puede contener reportes del usuario anterior
      // (u obtenidos con permisos que ya cambiaron): nunca debe sobrevivir a
      // un cambio de sesión en la misma pestaña.
      queryClient.clear();
      localStorage.setItem('clc_token', res.access_token);
      localStorage.setItem('clc_usuario', JSON.stringify(res.usuario));
      setToken(res.access_token);
      setUser(res.usuario);
    },
    [queryClient],
  );

  const logout = useCallback(() => {
    localStorage.removeItem('clc_token');
    localStorage.removeItem('clc_usuario');
    queryClient.clear();
    setToken(null);
    setUser(null);
  }, [queryClient]);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
