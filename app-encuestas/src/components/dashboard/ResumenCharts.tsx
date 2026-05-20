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

// Divide texto en líneas que no excedan maxChars sin romper palabras.
function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    if (current.length + w.length + 1 > maxChars && current) {
      lines.push(current);
      current = w;
    } else {
      current = current ? `${current} ${w}` : w;
    }
  }
  if (current) lines.push(current);
  return lines;
}

interface Props {
  resumen: ReporteResumen;
  showSatisfaccionPorPregunta: boolean;
}

export function ResumenCharts({ resumen, showSatisfaccionPorPregunta }: Props) {
  const esc = resumen.resumenEscala;

  // ── Dona NPS ──────────────────────────────────────────────────────────────
  const totalNps = esc ? esc.promotores + esc.pasivos + esc.detractores : 0;
  const pctNps = (v: number) => (totalNps > 0 ? (v / totalNps) * 100 : 0);
  const npsSegments = esc
    ? [
        { key: 'promotores', label: 'Promotores', sub: '9-10', value: esc.promotores, color: COLORS_NPS.promotores, pct: pctNps(esc.promotores) },
        { key: 'pasivos', label: 'Pasivos', sub: '7-8', value: esc.pasivos, color: COLORS_NPS.pasivos, pct: pctNps(esc.pasivos) },
        { key: 'detractores', label: 'Detractores', sub: '1-6', value: esc.detractores, color: COLORS_NPS.detractores, pct: pctNps(esc.detractores) },
      ]
    : [];

  const npsPieData = npsSegments.filter((d) => d.value > 0).map((d) => ({
    name: d.label,
    value: d.value,
    color: d.color,
    sub: d.sub,
  }));

  const npsVal = resumen.nps;

  // Label externo: número junto a cada porción, conectado por una línea, con el color del segmento.
  function renderNpsLabel(props: {
    cx?: number; cy?: number; midAngle?: number;
    outerRadius?: number; value?: number;
    payload?: { color?: string };
  }) {
    const { cx = 0, cy = 0, midAngle = 0, outerRadius = 0, value = 0, payload } = props;
    const RADIAN = Math.PI / 180;
    const sin = Math.sin(-midAngle * RADIAN);
    const cos = Math.cos(-midAngle * RADIAN);
    const sx = cx + outerRadius * cos;
    const sy = cy + outerRadius * sin;
    const mx = cx + (outerRadius + 14) * cos;
    const my = cy + (outerRadius + 14) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 14;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';
    const color = payload?.color ?? '#374151';
    return (
      <g>
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={color} strokeWidth={1.5} fill="none" />
        <circle cx={ex} cy={ey} r={2.5} fill={color} stroke="none" />
        <text
          x={ex + (cos >= 0 ? 6 : -6)}
          y={ey}
          fill={color}
          textAnchor={textAnchor}
          dominantBaseline="central"
          fontSize={13}
          fontWeight={700}
        >
          {value}
        </text>
      </g>
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
    name: p.texto,
    fullText: p.texto,
    Sí: p.totalSi,
    No: p.totalNo,
  }));

  // ── Colaboradores (Sí/No) ─────────────────────────────────────────────────
  const colaboradoresData = (resumen.colaboradores ?? [])
    .filter((c) => ((c.totalSi ?? 0) + (c.totalNo ?? 0)) > 0)
    .map((c) => {
      const nombreCompleto = `${c.nombre} ${c.apellido}`.trim();
      const short = nombreCompleto.length > 20 ? nombreCompleto.slice(0, 20) : nombreCompleto;
      const areaAbbr = getAreaShortName(c.areaNombre);
      return {
        name: short,
        area: areaAbbr,
        areaNombre: c.areaNombre,
        Sí: c.totalSi ?? 0,
        No: c.totalNo ?? 0,
        porcentajeSatisfaccion: c.porcentajeSatisfaccion,
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

        {/* Leyenda compacta con el color, conteo, rango y porcentaje por segmento */}
        {npsPieData.length > 0 && (
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500 mb-2">
            {npsSegments.map((s) => (
              <div key={s.key} className="flex flex-col items-start">
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="font-medium text-gray-600">{s.label}: {s.value}</span>
                  <span className="text-gray-400">({s.sub})</span>
                </span>
                <span className="ml-4 mt-0.5 font-semibold text-sm" style={{ color: s.color }}>
                  {s.pct.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        )}

        {npsPieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart margin={{ top: 12, right: 60, bottom: 12, left: 60 }}>
              <Pie
                data={npsPieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
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
              Detractores
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLOR_YELLOW }} />
              Pasivos
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLOR_GREEN }} />
              Promotores
            </span>
          </div>
        </div>
      )}

      {/* ── SI/NO (solo si hay filtro por área o colaborador) ── */}
      {/* Oculto en móvil: el gráfico horizontal con preguntas largas se ve mal en pantallas estrechas */}
      {showSatisfaccionPorPregunta ? (
        siNoData.length > 0 && (
          <div className="hidden md:block bg-white rounded-xl border border-[#C2CFDB] shadow-sm p-5 lg:col-span-2">
            <h3 className="font-semibold text-gray-700 mb-4">Satisfacción por pregunta (Sí/No)</h3>
            <ResponsiveContainer width="100%" height={Math.max(240, siNoData.length * 64)}>
              <BarChart data={siNoData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={260}
                  interval={0}
                  tick={(props: any) => {
                    const { x, y, payload } = props;
                    const idx = typeof payload?.index === 'number' ? payload.index : 0;
                    const full = siNoData[idx]?.fullText ?? String(payload?.value ?? '');
                    const lines = wrapText(full, 32);
                    const shown = lines.slice(0, 2);
                    if (lines.length > 2 && shown[1]) {
                      shown[1] = shown[1].slice(0, Math.max(0, shown[1].length - 1)) + '…';
                    }
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text textAnchor="end" fill="#374151" fontSize={11}>
                          <title>{full}</title>
                          {shown.map((line, i) => (
                            <tspan key={i} x={-4} dy={i === 0 ? 4 : 13}>
                              {line}
                            </tspan>
                          ))}
                        </text>
                      </g>
                    );
                  }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const item = (payload[0] as any)?.payload;
                    return (
                      <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm shadow-lg max-w-xs">
                        <p className="font-semibold text-gray-700 mb-1">{item?.fullText}</p>
                        <p className="text-green-600">Sí: {item?.Sí}</p>
                        <p className="text-red-600">No: {item?.No}</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="Sí" fill={COLOR_GREEN} radius={[0, 4, 4, 0]} />
                <Bar dataKey="No" fill={COLOR_RED} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )
      ) : (
        <div className="hidden md:block bg-white rounded-xl border border-dashed border-[#C2CFDB] p-5 lg:col-span-2 text-center text-sm text-gray-500">
          Selecciona un área o colaborador para ver la satisfacción por pregunta.
        </div>
      )}

      {/* ── Satisfacción por colaborador (Sí/No) ── */}
      {colaboradoresData.length > 0 && (
        <div className="bg-white rounded-xl border border-[#C2CFDB] shadow-sm p-5 lg:col-span-2">
          <h3 className="font-semibold text-gray-700 mb-4">Satisfacción por colaborador (Sí/No)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={colaboradoresData} margin={{ bottom: 40 }} maxBarSize={48}>
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
              <YAxis allowDecimals={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const item = (payload[0] as any)?.payload;
                  return (
                    <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm shadow-lg">
                      <p className="font-semibold text-gray-700">{label}</p>
                      {item?.areaNombre && <p className="text-xs text-[#063E7B] mb-1">{item.areaNombre}</p>}
                      <p className="text-green-600">Sí: {item?.Sí}</p>
                      <p className="text-red-600">No: {item?.No}</p>
                      {item?.porcentajeSatisfaccion != null && (
                        <p className="text-xs text-gray-500 mt-1">Satisfacción: {Number(item.porcentajeSatisfaccion).toFixed(1)}%</p>
                      )}
                    </div>
                  );
                }}
              />
              <Bar dataKey="Sí" fill={COLOR_GREEN} radius={[4, 4, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="No" fill={COLOR_RED} radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 text-[11px] text-gray-500 mt-2">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLOR_GREEN }} />
              Sí
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLOR_RED }} />
              No
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
