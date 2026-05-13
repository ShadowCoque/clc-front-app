import { api } from './axios';
import type { Colaborador, CreateColaboradorDto, UpdateColaboradorDto } from '../types';

export async function getColaboradores(areaId?: number): Promise<Colaborador[]> {
  const params = areaId ? { areaId } : {};
  const { data } = await api.get<Colaborador[]>('/colaboradores', { params });
  return data;
}

export async function createColaborador(dto: CreateColaboradorDto): Promise<Colaborador> {
  const { data } = await api.post<Colaborador>('/colaboradores', dto);
  return data;
}

export async function updateColaborador(id: number, dto: UpdateColaboradorDto): Promise<Colaborador> {
  const { data } = await api.patch<Colaborador>(`/colaboradores/${id}`, dto);
  return data;
}
