import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import type { ReporteResumen } from '../../types';
import { getAreaShortName } from '../../utils/areaLabels';

// Paleta unificada por rango de score (1-10)
// 0-6 = rojo, 7-8 = amarillo, 9-10 = verde
const COLOR_RED = '#ef4444';
const COLOR_YELLOW = '#facc15';
const COLOR_GREEN = '#22c55e';
const COLOR_PRIMARY = '#063E7B';

const COLORS_NPS = {
  promotores: COLOR_GREEN,
  pasivos: COLOR_YELLOW,
  detractores: COLOR_RED,
};

function distColor(score: number): string {
  if (score <= 6) return COLOR_RED;
  if (score <= 8) return COLOR_YELLOW;
  return COLOR_GREEN;
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
        { key: 'promotores', label: 'Promotores', sub: '9-10', value: esc.promotores, color: COLORS_NPS.promotores },
        { key: 'pasivos', label: 'Pasivos', sub: '7-8', value: esc.pasivos, color: COLORS_NPS.pasivos },
        { key: 'detractores', label: 'Detractores', sub: '1-6', value: esc.detractores, color: COLORS_NPS.detractores },
      ]
    : [];

  const npsPieData = npsSegments.filter((d) => d.value > 0).map((d) => ({
    name: d.label,
    value: d.value,
    color: d.color,
    sub: d.sub,
  }));

  const npsVal = resumen.nps;

  // Label dentro de cada porción con el número en blanco para máximo contraste
  function renderNpsLabel(props: {
    cx?: number; cy?: number; midAngle?: number;
    innerRadius?: number; outerRadius?: number; value?: number;
  }) {
    const { cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, value = 0 } = props;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
    const RADIAN = Math.PI / 180;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill="#ffffff"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14}
        fontWeight={700}
      >
        {value}
      </text>
    );
  }

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
      const promedio = Number((c.promedioEscala ?? 0).toFixed(2));
      return {
        name: short,
        area: areaAbbr,
        Promedio: promedio,
        fill: distColor(promedio),
      };
    });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ── Dona NPS ── */}
      <div className="bg-white rounded-xl border border-[#C2CFDB] shadow-sm p-5">
        <div className="flex items-baseline justify-between mb-2 flex-wrap gap-2">
          <h3 className="font-semibold text-gray-700">NPS — Promotores / Pasivos / Detractores</h3>
          {npsVal != null && (
            <span className="text-2xl font-bold text-[#063E7B]">{npsVal.toFixed(2)}</span>
          )}
        </div>

        {/* Leyenda compacta con el color de cada segmento */}
        {npsPieData.length > 0 && (
          <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-1">
            {npsSegments.map((s) => (
              <span key={s.key} className="inline-flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: s.color }}
                />
                <span className="font-medium text-gray-600">{s.label}</span>
                <span className="text-gray-400">({s.sub})</span>
              </span>
            ))}
          </div>
        )}

        {npsPieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={npsPieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={100}
                dataKey="value"
                paddingAngle={2}
                labelLine={false}
                label={renderNpsLabel}
                isAnimationActive={false}
              >
                {npsPieData.map((d, i) => (
                  <Cell key={i} fill={d.color} stroke="#ffffff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v, _name, ctx) => {
                  const sub = (ctx?.payload as { sub?: string })?.sub;
                  return [`${v} encuestas${sub ? ` · ${sub}` : ''}`, ctx?.payload?.name ?? ''];
                }}
              />
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
          <div className="flex flex-wrap gap-3 text-[11px] text-gray-500 mt-2">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLOR_RED }} />
              1–6 Detractores
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLOR_YELLOW }} />
              7–8 Pasivos
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLOR_GREEN }} />
              9–10 Promotores
            </span>
          </div>
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
                <Bar dataKey="Sí" fill={COLOR_GREEN} radius={[0, 4, 4, 0]} />
                <Bar dataKey="No" fill={COLOR_RED} radius={[0, 4, 4, 0]} />
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
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={colaboradoresData} margin={{ bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                interval={0}
                height={56}
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
                        <text x={0} y={0} dy={28} textAnchor="middle" fill={COLOR_PRIMARY} fontSize={10} fontWeight={600}>
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
              <Bar dataKey="Promedio" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                {colaboradoresData.map((d, i) => (
                  <Cell key={i} fill={d.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 text-[11px] text-gray-500 mt-2">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLOR_RED }} />
              1–6
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLOR_YELLOW }} />
              7–8
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLOR_GREEN }} />
              9–10
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
