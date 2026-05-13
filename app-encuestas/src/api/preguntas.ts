import { api } from './axios';
import type { Pregunta, CreatePreguntaDto, UpdatePreguntaDto } from '../types';

export async function getPreguntas(areaId: number): Promise<Pregunta[]> {
  const { data } = await api.get<Pregunta[]>('/preguntas', { params: { areaId } });
  return data;
}

export async function createPregunta(dto: CreatePreguntaDto): Promise<Pregunta> {
  const { data } = await api.post<Pregunta>('/preguntas', dto);
  return data;
}

export async function updatePregunta(id: number, dto: UpdatePreguntaDto): Promise<Pregunta> {
  const { data } = await api.patch<Pregunta>(`/preguntas/${id}`, dto);
  return data;
}

export async function deletePregunta(id: number): Promise<void> {
  await api.delete(`/preguntas/${id}`);
}
