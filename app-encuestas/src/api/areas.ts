import { api } from './axios';
import type { Area, CreateAreaDto, UpdateAreaDto } from '../types';

export async function getAreas(): Promise<Area[]> {
  const { data } = await api.get<Area[]>('/areas');
  return data;
}

export async function getAreasAdmin(): Promise<Area[]> {
  const { data } = await api.get<Area[]>('/areas/admin/list');
  return data;
}

export async function getAreaBySlug(slug: string): Promise<Area> {
  const { data } = await api.get<Area>(`/areas/${slug}`);
  return data;
}

export async function createArea(dto: CreateAreaDto): Promise<Area> {
  const { data } = await api.post<Area>('/areas', dto);
  return data;
}

export async function updateArea(id: number, dto: UpdateAreaDto): Promise<Area> {
  const { data } = await api.patch<Area>(`/areas/${id}`, dto);
  return data;
}
