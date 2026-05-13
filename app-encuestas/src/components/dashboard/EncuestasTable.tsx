import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, EyeIcon, XIcon } from 'lucide-react';
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
            {encuestas.map((e, i) => (
              <tr key={e.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 text-gray-700">{e.fecha ?? e.fechaDia ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500">{e.hora ?? '—'}</td>
                <td className="px-4 py-3 text-gray-700">{getAreaNombre(e)}</td>
                <td className="px-4 py-3 text-gray-700">{getColaboradorNombre(e)}</td>
                <td className="px-4 py-3 text-gray-700">{e.nombreSocio ?? '—'}</td>
                <td className="px-4 py-3 text-center">
                  {e.promedioEscala != null ? (
                    <span className="font-semibold text-[#063E7B]">{Number(e.promedioEscala).toFixed(1)}</span>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => setDetalle(e)}
                    className="text-[#063E7B] hover:text-[#D0A23E] transition-colors"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Página {meta.page} de {meta.totalPages} — {meta.total} total
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" disabled={meta.page <= 1} onClick={() => onPageChange(meta.page - 1)}>
              <ChevronLeftIcon className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" disabled={meta.page >= meta.totalPages} onClick={() => onPageChange(meta.page + 1)}>
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal detalle */}
      {detalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[#C2CFDB]">
              <h2 className="font-semibold text-[#063E7B]">Detalle de encuesta</h2>
              <button onClick={() => setDetalle(null)} className="text-gray-400 hover:text-gray-600">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Socio:</span> <span className="font-medium">{detalle.nombreSocio ?? '—'}</span></div>
                <div><span className="text-gray-500">Área:</span> <span className="font-medium">{getAreaNombre(detalle)}</span></div>
                <div><span className="text-gray-500">Colaborador:</span> <span className="font-medium">{getColaboradorNombre(detalle)}</span></div>
                <div><span className="text-gray-500">Fecha:</span> <span className="font-medium">{detalle.fecha ?? detalle.fechaDia ?? '—'} {detalle.hora ?? ''}</span></div>
              </div>
              {detalle.respuestas && detalle.respuestas.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-700 text-sm border-t pt-3">Respuestas</h3>
                  {detalle.respuestas.map((r) => (
                    <div key={r.preguntaId} className="text-sm">
                      <p className="text-gray-500 text-xs">{r.textoPregunta ?? `Pregunta #${r.preguntaId}`}</p>
                      <p className="text-gray-800 font-medium">
                        {r.valorBooleano != null ? (r.valorBooleano ? 'Sí' : 'No') : ''}
                        {r.valorNumero != null ? r.valorNumero : ''}
                        {r.valorTexto ?? ''}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
