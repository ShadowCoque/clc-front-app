import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import type { EncuestaReporte, PaginacionMeta } from '../../types';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

interface ComentariosTableProps {
  encuestas: EncuestaReporte[];
  meta?: PaginacionMeta;
  onPageChange: (page: number) => void;
}

interface FilaComentario {
  encuesta: EncuestaReporte;
  comentario: string;
}

function extraerComentarios(encuestas: EncuestaReporte[]): FilaComentario[] {
  return encuestas.flatMap((e) => {
    if (!e.respuestas) return [];
    return e.respuestas
      .filter((r) => r.valorTexto && r.tipo !== 'NOMBRE_SOCIO')
      .map((r) => ({ encuesta: e, comentario: r.valorTexto! }));
  });
}

function getColaborador(e: EncuestaReporte): string {
  if (e.colaboradorNombre) return e.colaboradorNombre;
  if (e.colaborador) return `${e.colaborador.nombre} ${e.colaborador.apellido}`;
  return '—';
}

function getArea(e: EncuestaReporte): string {
  if (e.areaNombre) return e.areaNombre;
  if (e.area) return e.area.nombre;
  return '—';
}

const LIMITE = 20;

export function ComentariosTable({ encuestas, meta, onPageChange }: ComentariosTableProps) {
  const [localPage, setLocalPage] = useState(1);

  const filas = extraerComentarios(encuestas);

  if (!filas.length) {
    return <EmptyState title="Sin comentarios" description="No hay comentarios en las encuestas de esta página." />;
  }

  // Paginación local sobre los comentarios de la página actual de encuestas
  const totalFilas = filas.length;
  const totalPaginas = Math.ceil(totalFilas / LIMITE);
  const desde = (localPage - 1) * LIMITE;
  const hasta = Math.min(localPage * LIMITE, totalFilas);
  const filasPagina = filas.slice(desde, hasta);

  const mostrandoDesde = desde + 1;
  const mostrandoHasta = hasta;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-[#C2CFDB]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#063E7B] text-white">
              <th className="px-4 py-3 text-left font-medium">Fecha</th>
              <th className="px-4 py-3 text-left font-medium">Área</th>
              <th className="px-4 py-3 text-left font-medium">Colaborador</th>
              <th className="px-4 py-3 text-left font-medium">Socio</th>
              <th className="px-4 py-3 text-left font-medium">Comentario</th>
            </tr>
          </thead>
          <tbody>
            {filasPagina.map(({ encuesta: e, comentario }, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{e.fecha ?? e.fechaDia ?? '—'}</td>
                <td className="px-4 py-3 text-gray-700">{getArea(e)}</td>
                <td className="px-4 py-3 text-gray-700">{getColaborador(e)}</td>
                <td className="px-4 py-3 text-gray-700">{e.nombreSocio ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600 max-w-xs">{comentario}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación local de comentarios + navegación de encuestas */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-gray-500">
          Mostrándose {mostrandoDesde}–{mostrandoHasta} de {totalFilas} comentarios en esta página
        </p>
        <div className="flex gap-2">
          {totalPaginas > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                disabled={localPage <= 1}
                onClick={() => setLocalPage((p) => p - 1)}
              >
                <ChevronLeftIcon className="w-4 h-4" />
                Anterior
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={localPage >= totalPaginas}
                onClick={() => setLocalPage((p) => p + 1)}
              >
                Siguiente
                <ChevronRightIcon className="w-4 h-4" />
              </Button>
            </>
          )}
          {/* Navegación entre páginas de encuestas */}
          {meta && meta.totalPages > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                disabled={meta.page <= 1}
                onClick={() => { setLocalPage(1); onPageChange(meta.page - 1); }}
              >
                Encuestas anteriores
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={meta.page >= meta.totalPages}
                onClick={() => { setLocalPage(1); onPageChange(meta.page + 1); }}
              >
                Más encuestas
              </Button>
            </>
          )}
        </div>
      </div>

      {meta && (
        <p className="text-xs text-gray-400 text-right">
          Página de encuestas {meta.page} de {meta.totalPages} — {meta.total} total
        </p>
      )}
    </div>
  );
}
