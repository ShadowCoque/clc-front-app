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
  const [encuestasPage, setEncuestasPage] = useState(1);
  const [comentariosPage, setComentariosPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [tab, setTab] = useState<'encuestas' | 'comentarios'>('encuestas');

  const { data: resumen, isLoading: loadingResumen, isError: errorResumen, refetch: refetchResumen } = useQuery({
    queryKey: ['resumen', filtros],
    queryFn: () => getResumen(filtros),
  });

  const { data: encuestasData, isLoading: loadingEncuestas } = useQuery({
    queryKey: ['encuestas', filtros, encuestasPage],
    queryFn: () => getEncuestas({ ...filtros, page: encuestasPage, limit: 20 }),
  });

  const { data: comentariosData, isLoading: loadingComentarios } = useQuery({
    queryKey: ['encuestas-comentarios', filtros, comentariosPage],
    queryFn: () => getEncuestas({ ...filtros, page: comentariosPage, limit: 20 }),
  });

  function handleFilter(f: ReporteFiltros) {
    setFiltros(f);
    setEncuestasPage(1);
    setComentariosPage(1);
  }

  async function handleExport() {
    setExporting(true);
    try { await exportarExcel(filtros); } finally { setExporting(false); }
  }

  const totalEncuestas = resumen?.totalEncuestas ?? 0;
  const promedioEscala = resumen?.promedioEscala ?? null;
  const npsVal = resumen?.nps ?? null;
  const satisfaccion = resumen?.porcentajeSatisfaccion ?? null;
  const totalComentarios = resumen?.totalComentarios ?? 0;

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

        {errorResumen && <ErrorState onRetry={() => refetchResumen()} />}

        {resumen && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <KpiCard label="Total encuestas" value={totalEncuestas} icon={ClipboardListIcon} />
              <KpiCard
                label="Promedio escala"
                value={promedioEscala != null ? promedioEscala.toFixed(2) : 'N/A'}
                icon={StarIcon}
                color="#D0A23E"
              />
              <KpiCard
                label="NPS"
                value={npsVal != null ? npsVal.toFixed(2) : 'N/A'}
                icon={TrendingUpIcon}
                color="#22c55e"
              />
              <KpiCard
                label="% Satisfacción"
                value={satisfaccion != null ? `${satisfaccion.toFixed(2)}%` : 'N/A'}
                icon={ThumbsUpIcon}
                color="#16a34a"
              />
              <KpiCard label="Comentarios" value={totalComentarios} icon={MessageSquareIcon} color="#7c3aed" />
            </div>

            <ResumenCharts resumen={resumen} />
          </>
        )}

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

          {tab === 'encuestas' ? (
            loadingEncuestas ? (
              <div className="flex justify-center py-10"><Spinner className="text-[#063E7B]" /></div>
            ) : (
              <EncuestasTable
                encuestas={encuestasData?.data ?? []}
                meta={encuestasData?.meta}
                onPageChange={setEncuestasPage}
              />
            )
          ) : (
            loadingComentarios ? (
              <div className="flex justify-center py-10"><Spinner className="text-[#063E7B]" /></div>
            ) : (
              <ComentariosTable
                encuestas={comentariosData?.data ?? []}
                meta={comentariosData?.meta}
                onPageChange={setComentariosPage}
              />
            )
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
