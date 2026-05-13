import type { EncuestaReporte } from '../../types';
import { EmptyState } from '../ui/EmptyState';

interface ComentariosTableProps {
  encuestas: EncuestaReporte[];
}

function getComentarios(e: EncuestaReporte): string[] {
  if (!e.respuestas) return [];
  return e.respuestas
    .filter((r) => r.valorTexto && r.tipo !== 'NOMBRE_SOCIO')
    .map((r) => r.valorTexto!);
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

export function ComentariosTable({ encuestas }: ComentariosTableProps) {
  const filas = encuestas.flatMap((e) =>
    getComentarios(e).map((comentario) => ({ encuesta: e, comentario })),
  );

  if (!filas.length) return <EmptyState title="Sin comentarios" description="No hay comentarios en las encuestas filtradas." />;

  return (
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
          {filas.map(({ encuesta: e, comentario }, i) => (
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
  );
}
