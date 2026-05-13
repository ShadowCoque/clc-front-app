import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import type { ReporteResumen } from '../../types';

const COLORS_NPS = ['#22c55e', '#facc15', '#ef4444'];

interface NpsGroups { promotores: number; pasivos: number; detractores: number }

// Busca la distribución en todas las rutas posibles del objeto de respuesta
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findDistribucion(r: any): Record<string, number> | null {
  // Ruta directa
  if (r?.resumenEscala?.distribucion && typeof r.resumenEscala.distribucion === 'object')
    return r.resumenEscala.distribucion as Record<string, number>;
  // Array escalas
  if (Array.isArray(r?.escalas)) {
    for (const esc of r.escalas) {
      if (esc?.distribucion && typeof esc.distribucion === 'object')
        return esc.distribucion as Record<string, number>;
    }
  }
  // Objeto escalas indexado por id
  if (r?.escalas && typeof r.escalas === 'object' && !Array.isArray(r.escalas)) {
    for (const esc of Object.values(r.escalas)) {
      const e = esc as any;
      if (e?.distribucion && typeof e.distribucion === 'object')
        return e.distribucion as Record<string, number>;
    }
  }
  return null;
}

function calcNpsGroups(resumen: ReporteResumen): NpsGroups | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = resumen as any;
  const dist = findDistribucion(r);

  if (dist && Object.keys(dist).length > 0) {
    let promotores = 0, pasivos = 0, detractores = 0;
    for (const [scoreStr, count] of Object.entries(dist)) {
      const score = Number(scoreStr);
      const n = Number(count) || 0;
      if (score >= 9) promotores += n;
      else if (score >= 7) pasivos += n;
      else if (score >= 1) detractores += n;
    }
    if (promotores + pasivos + detractores > 0)
      return { promotores, pasivos, detractores };
  }

  // Fallback: si tenemos NPS y total de encuestas, estimamos los grupos
  const nps: number | null = r?.nps ?? r?.resumenEscala?.nps ?? r?.escalas?.[0]?.nps ?? null;
  const total: number | null =
    r?.totalEncuestas ??
    r?.resumenEscala?.total ??
    r?.escalas?.[0]?.total ??
    null;

  if (nps != null && total != null && total > 0) {
    // NPS = (%promoters − %detractors). Asumimos pasivos ≈ 20% como base típica.
    const pasivosEst = Math.round(total * 0.2);
    const resto = total - pasivosEst;
    // nps/100 = (P - D) / total  =>  P - D = nps * total / 100
    const diff = Math.round((nps * total) / 100);
    const promotoresEst = Math.max(0, Math.round((resto + diff) / 2));
    const detractoresEst = Math.max(0, resto - promotoresEst);
    if (promotoresEst + pasivosEst + detractoresEst > 0)
      return { promotores: promotoresEst, pasivos: pasivosEst, detractores: detractoresEst };
  }

  return null;
}

export function ResumenCharts({ resumen }: { resumen: ReporteResumen }) {
  const groups = calcNpsGroups(resumen);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = resumen as any;

  const npsData: { name: string; value: number }[] = groups
    ? [
        { name: 'Promotores (9-10)', value: groups.promotores },
        { name: 'Pasivos (7-8)', value: groups.pasivos },
        { name: 'Detractores (1-6)', value: groups.detractores },
      ].filter((d) => d.value > 0)
    : [];

  const siNoData = (resumen.preguntasSiNo ?? resumen.resumenSiNo ?? []).map((p) => ({
    name: p.texto.length > 30 ? p.texto.slice(0, 30) + '...' : p.texto,
    Sí: p.totalSi,
    No: p.totalNo,
  }));

  const colaboradoresData = (resumen.colaboradores ?? [])
    .filter((c) => c.promedioEscala != null)
    .map((c) => ({
      name: `${c.nombre} ${c.apellido}`.slice(0, 20),
      Promedio: Number((c.promedioEscala ?? 0).toFixed(1)),
    }));

  const npsVal: number | null =
    r?.nps ?? r?.resumenEscala?.nps ?? r?.escalas?.[0]?.nps ?? null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* NPS — Promotores / Pasivos / Detractores */}
      <div className="bg-white rounded-xl border border-[#C2CFDB] shadow-sm p-5">
        <h3 className="font-semibold text-gray-700 mb-1">NPS — Promotores / Pasivos / Detractores</h3>
        {findDistribucion(r) == null && npsVal != null && (
          <p className="text-xs text-gray-400 mb-3">Estimación basada en NPS = {Math.round(npsVal)}</p>
        )}
        {npsData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={npsData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                dataKey="value"
                paddingAngle={2}
                label={({ value }) => String(value)}
                labelLine={false}
              >
                {npsData.map((_, i) => (
                  <Cell key={i} fill={COLORS_NPS[i % COLORS_NPS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v} encuestas`, '']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[220px] flex flex-col items-center justify-center text-gray-400 text-sm gap-1">
            {npsVal != null ? (
              <>
                <span className="text-4xl font-bold text-[#063E7B]">{Math.round(npsVal)}</span>
                <span className="text-xs">NPS Score</span>
                <span className="text-xs text-gray-300 mt-1">Sin distribución de scores disponible</span>
              </>
            ) : (
              <span>Sin datos de escala para calcular NPS</span>
            )}
          </div>
        )}
      </div>

      {/* Satisfacción SI/NO */}
      {siNoData.length > 0 && (
        <div className="bg-white rounded-xl border border-[#C2CFDB] shadow-sm p-5">
          <h3 className="font-semibold text-gray-700 mb-4">Satisfacción por pregunta (Sí/No)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={siNoData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Sí" fill="#22c55e" radius={[0, 4, 4, 0]} />
              <Bar dataKey="No" fill="#ef4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Promedio por colaborador */}
      {colaboradoresData.length > 0 && (
        <div className="bg-white rounded-xl border border-[#C2CFDB] shadow-sm p-5 lg:col-span-2">
          <h3 className="font-semibold text-gray-700 mb-4">Promedio escala por colaborador</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={colaboradoresData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Bar dataKey="Promedio" fill="#063E7B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
