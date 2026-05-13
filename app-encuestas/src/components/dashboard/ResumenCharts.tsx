import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import type { ReporteResumen } from '../../types';

interface ResumenChartsProps {
  resumen: ReporteResumen;
}

const COLORS_NPS = ['#22c55e', '#facc15', '#ef4444'];

export function ResumenCharts({ resumen }: ResumenChartsProps) {
  const escala = resumen.resumenEscala ?? resumen.escalas?.[0];
  const nps = resumen.nps ?? escala?.nps ?? 0;

  const promotores = Math.max(0, Math.round((nps + 100) / 3));
  const detractores = Math.max(0, Math.round((100 - nps) / 3));
  const pasivos = Math.max(0, 100 - promotores - detractores);

  const npsData = [
    { name: 'Promotores', value: promotores },
    { name: 'Pasivos', value: pasivos },
    { name: 'Detractores', value: detractores },
  ];

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
      Encuestas: c.totalEncuestas,
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* NPS Dona */}
      <div className="bg-white rounded-xl border border-[#C2CFDB] shadow-sm p-5">
        <h3 className="font-semibold text-gray-700 mb-4">NPS — Promotores / Pasivos / Detractores</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={npsData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={2}>
              {npsData.map((_, i) => (
                <Cell key={i} fill={COLORS_NPS[i]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => `${v}%`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Satisfacción SI/NO */}
      {siNoData.length > 0 && (
        <div className="bg-white rounded-xl border border-[#C2CFDB] shadow-sm p-5">
          <h3 className="font-semibold text-gray-700 mb-4">Satisfacción por pregunta (Sí/No)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={siNoData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
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
              <Legend />
              <Bar dataKey="Promedio" fill="#063E7B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
