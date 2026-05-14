import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import type { ReporteResumen } from '../../types';

const COLORS_NPS = ['#22c55e', '#facc15', '#ef4444'];
const COLORS_DIST: Record<string, string> = {
  red: '#ef4444',
  amber: '#f59e0b',
  green: '#22c55e',
};

function distColor(score: number): string {
  if (score <= 6) return COLORS_DIST.red;
  if (score <= 8) return COLORS_DIST.amber;
  return COLORS_DIST.green;
}

export function ResumenCharts({ resumen }: { resumen: ReporteResumen }) {
  const esc = resumen.resumenEscala;

  // ── Dona NPS ──────────────────────────────────────────────────────────────
  const npsData: { name: string; value: number }[] = esc
    ? [
        { name: 'Promotores (9-10)', value: esc.promotores },
        { name: 'Pasivos (7-8)', value: esc.pasivos },
        { name: 'Detractores (1-6)', value: esc.detractores },
      ].filter((d) => d.value > 0)
    : [];

  const npsVal = resumen.nps;

  // ── Distribución 1-10 ─────────────────────────────────────────────────────
  const distData: { score: string; cantidad: number; fill: string }[] =
    esc?.distribucion
      ? Object.entries(esc.distribucion)
          .map(([k, v]) => ({ score: k, cantidad: Number(v), fill: distColor(Number(k)) }))
          .sort((a, b) => Number(a.score) - Number(b.score))
      : [];

  // ── SI/NO ─────────────────────────────────────────────────────────────────
  const siNoData = (resumen.preguntasSiNo ?? []).map((p) => ({
    name: p.texto.length > 30 ? p.texto.slice(0, 30) + '…' : p.texto,
    Sí: p.totalSi,
    No: p.totalNo,
  }));

  // ── Colaboradores ─────────────────────────────────────────────────────────
  const colaboradoresData = (resumen.colaboradores ?? [])
    .filter((c) => c.promedioEscala != null)
    .map((c) => ({
      name: `${c.nombre} ${c.apellido}`.slice(0, 20),
      Promedio: Number((c.promedioEscala ?? 0).toFixed(2)),
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ── Dona NPS ── */}
      <div className="bg-white rounded-xl border border-[#C2CFDB] shadow-sm p-5">
        <h3 className="font-semibold text-gray-700 mb-1">NPS — Promotores / Pasivos / Detractores</h3>
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
                <span className="text-4xl font-bold text-[#063E7B]">{npsVal.toFixed(2)}</span>
                <span className="text-xs">NPS Score</span>
              </>
            ) : (
              <span>Sin datos de escala para calcular NPS</span>
            )}
          </div>
        )}
      </div>

      {/* ── Distribución 1-10 ── */}
      {distData.length > 0 && (
        <div className="bg-white rounded-xl border border-[#C2CFDB] shadow-sm p-5">
          <h3 className="font-semibold text-gray-700 mb-4">Distribución de scores (1–10)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={distData} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="score" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip formatter={(v) => [`${v} respuestas`, 'Cantidad']} />
              <Bar dataKey="cantidad" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                {distData.map((d, i) => (
                  <Cell key={i} fill={d.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── SI/NO ── */}
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

      {/* ── Promedio por colaborador ── */}
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
