import { api } from './axios';
import type { EncuestaSubmit } from '../types';

export async function submitEncuesta(dto: EncuestaSubmit): Promise<void> {
  await api.post('/encuestas', dto);
}
