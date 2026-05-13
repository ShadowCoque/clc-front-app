import type { Pregunta } from '../../types';

interface PreguntaEscalaProps {
  pregunta: Pregunta;
  value?: number;
  onChange: (value: number) => void;
  error?: string;
}

function getColorClass(n: number): string {
  if (n <= 4) return 'bg-red-500 text-white border-red-500';
  if (n <= 6) return 'bg-amber-400 text-white border-amber-400';
  if (n <= 8) return 'bg-yellow-400 text-white border-yellow-400';
  return 'bg-green-500 text-white border-green-500';
}

function getHoverClass(n: number): string {
  if (n <= 4) return 'hover:border-red-400 hover:text-red-600';
  if (n <= 6) return 'hover:border-amber-400 hover:text-amber-600';
  if (n <= 8) return 'hover:border-yellow-400 hover:text-yellow-600';
  return 'hover:border-green-400 hover:text-green-600';
}

export function PreguntaEscala({ pregunta, value, onChange, error }: PreguntaEscalaProps) {
  return (
    <div className="space-y-3">
      <p className="font-medium text-gray-800">
        {pregunta.texto}
        {pregunta.obligatoria && <span className="text-red-500 ml-1">*</span>}
      </p>
      <div className="flex gap-1.5 flex-wrap">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 font-bold text-sm sm:text-base transition-all ${
              value === n
                ? getColorClass(n)
                : `bg-white border-[#C2CFDB] text-gray-600 ${getHoverClass(n)}`
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-400 px-1">
        <span>Muy malo</span>
        <span>Excelente</span>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
