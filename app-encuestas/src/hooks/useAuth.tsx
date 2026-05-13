import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { login as apiLogin } from '../api/auth';
import type { Usuario } from '../types';

interface AuthContextValue {
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

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
  const storedToken = localStorage.getItem('clc_token');
  const validToken = storedToken && isTokenValid(storedToken) ? storedToken : null;

  const [token, setToken] = useState<string | null>(validToken);
  const [user, setUser] = useState<Usuario | null>(validToken ? getStoredUser() : null);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    localStorage.setItem('clc_token', res.access_token);
    localStorage.setItem('clc_usuario', JSON.stringify(res.usuario));
    setToken(res.access_token);
    setUser(res.usuario);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('clc_token');
    localStorage.removeItem('clc_usuario');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
