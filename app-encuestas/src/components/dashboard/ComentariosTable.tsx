import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import type { RespuestaTexto } from '../../types';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { SocioLabel } from './SocioLabel';

interface ComentariosTableProps {
  comentarios: RespuestaTexto[];
}

const LIMITE = 15;

export function ComentariosTable({ comentarios }: ComentariosTableProps) {
  const [page, setPage] = useState(1);

  if (!comentarios.length) {
    return <EmptyState title="Sin comentarios" description="No hay comentarios con los filtros aplicados." />;
  }

  const totalPaginas = Math.ceil(comentarios.length / LIMITE);
  const desde = (page - 1) * LIMITE;
  const hasta = Math.min(page * LIMITE, comentarios.length);
  const filasPagina = comentarios.slice(desde, hasta);

  return (
    <div className="space-y-4">
      {/* ── Vista tabla (tablet/desktop) ─────────────────────────────────────── */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-[#C2CFDB]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#063E7B] text-white">
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Fecha y hora</th>
              <th className="px-4 py-3 text-left font-medium">Área</th>
              <th className="px-4 py-3 text-left font-medium">Colaborador</th>
              <th className="px-4 py-3 text-left font-medium">Socio</th>
              <th className="px-4 py-3 text-left font-medium">Comentario</th>
            </tr>
          </thead>
          <tbody>
            {filasPagina.map((c, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-gray-700">{c.fecha}</span>
                  {c.hora && <span className="block text-[11px] text-gray-400 mt-0.5">{c.hora}</span>}
                </td>
                <td className="px-4 py-3 text-gray-700">{c.area}</td>
                <td className="px-4 py-3 text-gray-700">{c.colaborador ?? '—'}</td>
                <td className="px-4 py-3 text-gray-700"><SocioLabel nombre={c.nombreSocio} /></td>
                <td className="px-4 py-3 text-gray-600 max-w-xs">{c.texto}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Vista tarjetas (móvil) ───────────────────────────────────────────── */}
      <ul className="md:hidden space-y-2.5">
        {filasPagina.map((c, i) => (
          <li key={i} className="bg-white rounded-xl border border-[#C2CFDB] p-3">
            <div className="text-[11px] text-gray-400">{c.fecha}{c.hora ? ` · ${c.hora}` : ''} · {c.area}</div>
            <div className="font-medium text-gray-800 mt-0.5 truncate"><SocioLabel nombre={c.nombreSocio} /></div>
            {c.colaborador && (
              <div className="text-xs text-gray-500 mt-0.5 truncate">{c.colaborador}</div>
            )}
            <p className="text-sm text-gray-700 mt-2 leading-relaxed break-words">{c.texto}</p>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-gray-500">
          {desde + 1}–{hasta} de {comentarios.length} comentarios
        </p>
        {totalPaginas > 1 && (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeftIcon className="w-4 h-4" />
              Anterior
            </Button>
            <Button variant="ghost" size="sm" disabled={page >= totalPaginas} onClick={() => setPage((p) => p + 1)}>
              Siguiente
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
