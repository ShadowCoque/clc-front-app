import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, EyeIcon, XIcon, UserIcon, BuildingIcon, CalendarIcon, ThumbsUpIcon, ThumbsDownIcon, StarIcon } from 'lucide-react';
import type { EncuestaReporte, PaginacionMeta } from '../../types';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

interface EncuestasTableProps {
  encuestas: EncuestaReporte[];
  meta?: PaginacionMeta;
  onPageChange: (page: number) => void;
}

function getColaboradorNombre(e: EncuestaReporte): string {
  if (e.colaboradorNombre) return e.colaboradorNombre;
  if (e.colaborador) return `${e.colaborador.nombre} ${e.colaborador.apellido}`;
  return '—';
}

function getAreaNombre(e: EncuestaReporte): string {
  if (e.areaNombre) return e.areaNombre;
  if (e.area) return e.area.nombre;
  return '—';
}

// Escala: busca promedioEscala o primer valorNumero en respuestas
function getEscalaVal(e: EncuestaReporte): number | null {
  if (e.promedioEscala != null) return Number(e.promedioEscala);
  const r = e.respuestas?.find((r) => r.valorNumero != null);
  return r?.valorNumero ?? null;
}

// Colores semáforo: 0-6 rojo, 7-8 amarillo, 9-10 verde
function escalaBadgeClass(val: number): string {
  if (val <= 6) return 'bg-red-100 text-red-700 ring-1 ring-red-200';
  if (val <= 8) return 'bg-amber-100 text-amber-700 ring-1 ring-amber-200';
  return 'bg-green-100 text-green-700 ring-1 ring-green-200';
}

// Mismo semáforo para el detalle de respuesta numérica
function escalaBadgeClassFull(val: number): string {
  if (val <= 6) return 'bg-red-500 text-white';
  if (val <= 8) return 'bg-amber-400 text-white';
  return 'bg-green-500 text-white';
}

function paginationText(meta: PaginacionMeta): string {
  const desde = (meta.page - 1) * meta.limit + 1;
  const hasta = Math.min(meta.page * meta.limit, meta.total);
  return `Página ${meta.page} de ${meta.totalPages} — Mostrándose ${desde}–${hasta} de ${meta.total} resultados`;
}

export function EncuestasTable({ encuestas, meta, onPageChange }: EncuestasTableProps) {
  const [detalle, setDetalle] = useState<EncuestaReporte | null>(null);

  if (!encuestas.length) return <EmptyState title="Sin encuestas" description="No hay encuestas con los filtros aplicados." />;

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-[#C2CFDB]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#063E7B] text-white">
              <th className="px-4 py-3 text-left font-medium">Fecha</th>
              <th className="px-4 py-3 text-left font-medium">Hora</th>
              <th className="px-4 py-3 text-left font-medium">Área</th>
              <th className="px-4 py-3 text-left font-medium">Colaborador</th>
              <th className="px-4 py-3 text-left font-medium">Socio</th>
              <th className="px-4 py-3 text-center font-medium">Escala</th>
              <th className="px-4 py-3 text-center font-medium">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {encuestas.map((e, i) => {
              const escalaVal = getEscalaVal(e);
              return (
                <tr key={e.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{e.fecha ?? e.fechaDia ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{e.hora ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{getAreaNombre(e)}</td>
                  <td className="px-4 py-3 text-gray-700">{getColaboradorNombre(e)}</td>
                  <td className="px-4 py-3 text-gray-700">{e.nombreSocio ?? '—'}</td>
                  <td className="px-4 py-3 text-center">
                    {escalaVal != null ? (
                      <span className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-bold ${escalaBadgeClass(escalaVal)}`}>
                        {Number.isInteger(escalaVal) ? escalaVal : escalaVal.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setDetalle(e)}
                      className="text-[#063E7B] hover:text-[#D0A23E] transition-colors"
                      title="Ver detalle"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {meta && (
        <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
          <p className="text-sm text-gray-500">{paginationText(meta)}</p>
          {meta.totalPages > 1 && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" disabled={meta.page <= 1} onClick={() => onPageChange(meta.page - 1)}>
                <ChevronLeftIcon className="w-4 h-4" />
                Anterior
              </Button>
              <Button variant="ghost" size="sm" disabled={meta.page >= meta.totalPages} onClick={() => onPageChange(meta.page + 1)}>
                Siguiente
                <ChevronRightIcon className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── Modal detalle ────────────────────────────────────────────────────── */}
      {detalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#063E7B] text-white flex-shrink-0">
              <div>
                <h2 className="font-bold text-base">Detalle de encuesta</h2>
                <p className="text-white/70 text-xs mt-0.5">#{detalle.id}</p>
              </div>
              <button
                onClick={() => setDetalle(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition-colors"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Meta info */}
            <div className="grid grid-cols-2 gap-3 px-6 py-4 bg-[#f8fafc] border-b border-[#C2CFDB] flex-shrink-0">
              <div className="flex items-center gap-2 text-sm">
                <UserIcon className="w-4 h-4 text-[#063E7B] flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Socio</p>
                  <p className="font-medium text-gray-800 truncate">{detalle.nombreSocio ?? '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BuildingIcon className="w-4 h-4 text-[#063E7B] flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Área / Colaborador</p>
                  <p className="font-medium text-gray-800 truncate">{getAreaNombre(detalle)}</p>
                  <p className="text-xs text-gray-500 truncate">{getColaboradorNombre(detalle)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm col-span-2">
                <CalendarIcon className="w-4 h-4 text-[#063E7B] flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Fecha y hora</p>
                  <p className="font-medium text-gray-800">
                    {detalle.fecha ?? detalle.fechaDia ?? '—'} {detalle.hora ? `· ${detalle.hora}` : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Respuestas */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {detalle.respuestas && detalle.respuestas.length > 0 ? (
                detalle.respuestas.map((resp) => (
                  <div key={resp.preguntaId} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                      {resp.textoPregunta ?? `Pregunta #${resp.preguntaId}`}
                    </p>
                    {/* SI/NO */}
                    {resp.valorBooleano != null && (
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${
                        resp.valorBooleano
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {resp.valorBooleano
                          ? <><ThumbsUpIcon className="w-4 h-4" /> Sí</>
                          : <><ThumbsDownIcon className="w-4 h-4" /> No</>
                        }
                      </div>
                    )}
                    {/* Escala 1-10 */}
                    {resp.valorNumero != null && (
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-base font-bold ${escalaBadgeClassFull(resp.valorNumero)}`}>
                          {resp.valorNumero}
                        </span>
                        <div>
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {Array.from({ length: 10 }, (_, i) => (
                              <span
                                key={i}
                                className={`w-2 h-2 rounded-sm ${i < resp.valorNumero! ? (resp.valorNumero! <= 6 ? 'bg-red-400' : resp.valorNumero! <= 8 ? 'bg-amber-400' : 'bg-green-400') : 'bg-gray-200'}`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">sobre 10</p>
                        </div>
                      </div>
                    )}
                    {/* Texto */}
                    {resp.valorTexto != null && (
                      <div className="flex items-start gap-2">
                        <StarIcon className="w-4 h-4 text-[#D0A23E] flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700 leading-relaxed">{resp.valorTexto}</p>
                      </div>
                    )}
                    {resp.valorBooleano == null && resp.valorNumero == null && resp.valorTexto == null && (
                      <p className="text-sm text-gray-400 italic">Sin respuesta</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">No hay respuestas registradas.</p>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-[#C2CFDB] flex-shrink-0">
              <Button variant="ghost" size="sm" className="w-full" onClick={() => setDetalle(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
