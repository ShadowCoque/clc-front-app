import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import type { ReporteResumen } from '../../types';
import { getAreaShortName } from '../../utils/areaLabels';

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

interface Props {
  resumen: ReporteResumen;
  showSatisfaccionPorPregunta: boolean;
}

export function ResumenCharts({ resumen, showSatisfaccionPorPregunta }: Props) {
  const esc = resumen.resumenEscala;

  // ── Dona NPS ──────────────────────────────────────────────────────────────
  const npsSegments = esc
    ? [
        { key: 'promotores', label: 'Promotores', sub: '9-10', value: esc.promotores, color: COLORS_NPS[0] },
        { key: 'pasivos', label: 'Pasivos', sub: '7-8', value: esc.pasivos, color: COLORS_NPS[1] },
        { key: 'detractores', label: 'Detractores', sub: '1-6', value: esc.detractores, color: COLORS_NPS[2] },
      ]
    : [];

  const npsPieData = npsSegments.filter((d) => d.value > 0).map((d) => ({
    name: d.label,
    value: d.value,
    color: d.color,
  }));

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
    .map((c) => {
      const nombreCompleto = `${c.nombre} ${c.apellido}`.trim();
      const short = nombreCompleto.length > 20 ? nombreCompleto.slice(0, 20) : nombreCompleto;
      const areaAbbr = getAreaShortName(c.areaNombre);
      return {
        name: short,
        area: areaAbbr,
        Promedio: Number((c.promedioEscala ?? 0).toFixed(2)),
      };
    });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ── Dona NPS ── */}
      <div className="bg-white rounded-xl border border-[#C2CFDB] shadow-sm p-5">
        <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
          <h3 className="font-semibold text-gray-700">NPS — Promotores / Pasivos / Detractores</h3>
          {npsVal != null && (
            <span className="text-2xl font-bold text-[#063E7B]">{npsVal.toFixed(2)}</span>
          )}
        </div>

        {npsPieData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={npsPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  dataKey="value"
                  paddingAngle={2}
                  labelLine={false}
                  isAnimationActive={false}
                >
                  {npsPieData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} encuestas`, '']} />
                <Legend verticalAlign="bottom" height={24} />
              </PieChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-3 gap-2 mt-3">
              {npsSegments.map((s) => (
                <div
                  key={s.key}
                  className="rounded-lg border border-[#C2CFDB] bg-gray-50 px-3 py-2 text-center"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-xs font-medium text-gray-600">{s.label}</span>
                  </div>
                  <p className="text-lg font-bold text-gray-800 leading-tight">{s.value}</p>
                  <p className="text-[10px] text-gray-400">{s.sub}</p>
                </div>
              ))}
            </div>
          </>
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
          <ResponsiveContainer width="100%" height={240}>
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

      {/* ── SI/NO (solo si hay filtro por área o colaborador) ── */}
      {showSatisfaccionPorPregunta ? (
        siNoData.length > 0 && (
          <div className="bg-white rounded-xl border border-[#C2CFDB] shadow-sm p-5 lg:col-span-2">
            <h3 className="font-semibold text-gray-700 mb-4">Satisfacción por pregunta (Sí/No)</h3>
            <ResponsiveContainer width="100%" height={Math.max(220, siNoData.length * 48)}>
              <BarChart data={siNoData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Sí" fill="#22c55e" radius={[0, 4, 4, 0]} />
                <Bar dataKey="No" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )
      ) : (
        <div className="bg-white rounded-xl border border-dashed border-[#C2CFDB] p-5 lg:col-span-2 text-center text-sm text-gray-500">
          Selecciona un área o colaborador para ver la satisfacción por pregunta.
        </div>
      )}

      {/* ── Promedio por colaborador ── */}
      {colaboradoresData.length > 0 && (
        <div className="bg-white rounded-xl border border-[#C2CFDB] shadow-sm p-5 lg:col-span-2">
          <h3 className="font-semibold text-gray-700 mb-4">Promedio escala por colaborador</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={colaboradoresData} margin={{ bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                interval={0}
                height={50}
                tick={(props: any) => {
                  const { x, y, payload } = props;
                  const idx = typeof payload?.index === 'number' ? payload.index : 0;
                  const item = colaboradoresData[idx];
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text x={0} y={0} dy={12} textAnchor="middle" fill="#374151" fontSize={11}>
                        {payload?.value}
                      </text>
                      {item?.area && (
                        <text x={0} y={0} dy={26} textAnchor="middle" fill="#9ca3af" fontSize={10}>
                          {item.area}
                        </text>
                      )}
                    </g>
                  );
                }}
              />
              <YAxis domain={[0, 10]} />
              <Tooltip
                formatter={(v, _name, ctx) => {
                  const area = (ctx?.payload as { area?: string })?.area;
                  return area ? [`${v} (${area})`, 'Promedio'] : [`${v}`, 'Promedio'];
                }}
              />
              <Bar dataKey="Promedio" fill="#063E7B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
