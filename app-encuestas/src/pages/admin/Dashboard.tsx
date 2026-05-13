import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClipboardListIcon, StarIcon, TrendingUpIcon, MessageSquareIcon, ThumbsUpIcon } from 'lucide-react';
import { getResumen, getEncuestas, exportarExcel } from '../../api/reportes';
import { AdminLayout } from '../../layouts/AdminLayout';
import { FiltersBar } from '../../components/dashboard/FiltersBar';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { ResumenCharts } from '../../components/dashboard/ResumenCharts';
import { EncuestasTable } from '../../components/dashboard/EncuestasTable';
import { ComentariosTable } from '../../components/dashboard/ComentariosTable';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import type { ReporteFiltros } from '../../types';

export function Dashboard() {
  const [filtros, setFiltros] = useState<ReporteFiltros>({});
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [tab, setTab] = useState<'encuestas' | 'comentarios'>('encuestas');

  const filtrosConPage = { ...filtros, page, limit: 20 };

  const { data: resumen, isLoading: loadingResumen, isError: errorResumen, refetch: refetchResumen } = useQuery({
    queryKey: ['resumen', filtros],
    queryFn: () => getResumen(filtros),
  });

  const { data: encuestasData, isLoading: loadingEncuestas } = useQuery({
    queryKey: ['encuestas', filtrosConPage],
    queryFn: () => getEncuestas(filtrosConPage),
  });

  function handleFilter(f: ReporteFiltros) {
    setFiltros(f);
    setPage(1);
  }

  async function handleExport() {
    setExporting(true);
    try { await exportarExcel(filtros); } finally { setExporting(false); }
  }

  const encuestas = encuestasData?.data ?? [];
  const meta = encuestasData?.meta;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-xl font-bold text-[#063E7B]">Dashboard</h1>

        <FiltersBar onFilter={handleFilter} onExport={handleExport} exporting={exporting} />

        {loadingResumen && (
          <div className="flex justify-center py-10">
            <Spinner size="lg" className="text-[#063E7B]" />
          </div>
        )}

        {errorResumen && (
          <ErrorState onRetry={() => refetchResumen()} />
        )}

        {resumen && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <KpiCard
                label="Total encuestas"
                value={resumen.totalEncuestas ?? 0}
                icon={ClipboardListIcon}
              />
              <KpiCard
                label="Promedio escala"
                value={resumen.promedioEscala != null ? Number(resumen.promedioEscala).toFixed(1) : '—'}
                icon={StarIcon}
                color="#D0A23E"
              />
              <KpiCard
                label="NPS"
                value={resumen.nps != null ? `${resumen.nps}` : '—'}
                icon={TrendingUpIcon}
                color="#22c55e"
              />
              <KpiCard
                label="% Satisfacción"
                value={resumen.porcentajeSatisfaccion != null ? `${Number(resumen.porcentajeSatisfaccion).toFixed(0)}%` : '—'}
                icon={ThumbsUpIcon}
                color="#16a34a"
              />
              <KpiCard
                label="Comentarios"
                value={resumen.totalComentarios ?? 0}
                icon={MessageSquareIcon}
                color="#7c3aed"
              />
            </div>

            {/* Gráficas */}
            <ResumenCharts resumen={resumen} />
          </>
        )}

        {/* Tabla de encuestas / comentarios */}
        <div className="bg-white rounded-xl border border-[#C2CFDB] shadow-sm p-5">
          <div className="flex gap-4 mb-5 border-b border-[#C2CFDB]">
            <button
              onClick={() => setTab('encuestas')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === 'encuestas' ? 'border-[#063E7B] text-[#063E7B]' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Encuestas
            </button>
            <button
              onClick={() => setTab('comentarios')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === 'comentarios' ? 'border-[#063E7B] text-[#063E7B]' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Comentarios
            </button>
          </div>

          {loadingEncuestas ? (
            <div className="flex justify-center py-10">
              <Spinner className="text-[#063E7B]" />
            </div>
          ) : tab === 'encuestas' ? (
            <EncuestasTable
              encuestas={encuestas}
              meta={meta}
              onPageChange={(p) => setPage(p)}
            />
          ) : (
            <ComentariosTable encuestas={encuestas} />
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
