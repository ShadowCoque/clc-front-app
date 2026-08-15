import { api } from './axios';
import type { LoginResponse, Usuario } from '../types';

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
  return data;
}

// Perfil vigente (rol y áreas frescos desde BD). Sirve para reflejar cambios
// de permisos hechos por un admin sin exigir re-login.
export async function me(): Promise<Usuario> {
  const { data } = await api.get<Usuario>('/auth/me');
  return data;
}
