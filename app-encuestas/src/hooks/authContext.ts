import { createContext } from 'react';
import type { Usuario } from '../types';

export interface AuthContextValue {
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
