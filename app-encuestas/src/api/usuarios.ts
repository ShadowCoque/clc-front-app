import { api } from './axios';
import type { CreateUsuarioDto, UpdateUsuarioDto, UsuarioAdmin } from '../types';

// Todos estos endpoints requieren rol ADMIN; el backend responde 403 si no.
export async function getUsuarios(): Promise<UsuarioAdmin[]> {
  const { data } = await api.get<UsuarioAdmin[]>('/usuarios');
  return data;
}

export async function createUsuario(dto: CreateUsuarioDto): Promise<UsuarioAdmin> {
  const { data } = await api.post<UsuarioAdmin>('/usuarios', dto);
  return data;
}

export async function updateUsuario(id: number, dto: UpdateUsuarioDto): Promise<UsuarioAdmin> {
  const { data } = await api.patch<UsuarioAdmin>(`/usuarios/${id}`, dto);
  return data;
}

export async function updateUsuarioPassword(id: number, password: string): Promise<{ ok: true }> {
  const { data } = await api.patch<{ ok: true }>(`/usuarios/${id}/password`, { password });
  return data;
}
