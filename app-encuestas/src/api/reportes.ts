import { api } from './axios';
import type { ReporteResumen, EncuestasPaginadasResponse, ReporteFiltros } from '../types';

function buildParams(filtros: ReporteFiltros) {
  const params: Record<string, string | number> = {};
  if (filtros.areaId) params.areaId = filtros.areaId;
  if (filtros.colaboradorId) params.colaboradorId = filtros.colaboradorId;
  if (filtros.fechaDesde) params.fechaDesde = filtros.fechaDesde;
  if (filtros.fechaHasta) params.fechaHasta = filtros.fechaHasta;
  if (filtros.nombreSocio) params.nombreSocio = filtros.nombreSocio;
  return params;
}

export async function getResumen(filtros: ReporteFiltros): Promise<ReporteResumen> {
  const { data } = await api.get<ReporteResumen>('/reportes/resumen', { params: buildParams(filtros) });
  return data;
}

export async function getEncuestas(filtros: ReporteFiltros): Promise<EncuestasPaginadasResponse> {
  const params = {
    ...buildParams(filtros),
    ...(filtros.page ? { page: filtros.page } : {}),
    ...(filtros.limit ? { limit: filtros.limit } : {}),
  };
  const { data } = await api.get<EncuestasPaginadasResponse>('/reportes/encuestas', { params });
  return data;
}

export async function exportarExcel(filtros: ReporteFiltros): Promise<void> {
  const response = await api.get('/reportes/exportar', {
    params: buildParams(filtros),
    responseType: 'blob',
  });
  const url = URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'reporte-encuestas.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
