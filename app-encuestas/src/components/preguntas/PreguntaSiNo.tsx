import { ThumbsUpIcon, ThumbsDownIcon } from 'lucide-react';
import type { Pregunta } from '../../types';

interface PreguntaSiNoProps {
  pregunta: Pregunta;
  value?: boolean;
  onChange: (value: boolean) => void;
  error?: string;
}

export function PreguntaSiNo({ pregunta, value, onChange, error }: PreguntaSiNoProps) {
  return (
    <div className="space-y-3">
      <p className="font-medium text-gray-800">
        {pregunta.texto}
        {pregunta.obligatoria && <span className="text-red-500 ml-1">*</span>}
      </p>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border-2 font-semibold text-base transition-all ${
            value === true
              ? 'bg-green-600 border-green-600 text-white shadow-md'
              : 'bg-white border-[#C2CFDB] text-gray-600 hover:border-green-400 hover:text-green-600'
          }`}
        >
          <ThumbsUpIcon className="w-5 h-5" />
          Sí
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border-2 font-semibold text-base transition-all ${
            value === false
              ? 'bg-red-600 border-red-600 text-white shadow-md'
              : 'bg-white border-[#C2CFDB] text-gray-600 hover:border-red-400 hover:text-red-600'
          }`}
        >
          <ThumbsDownIcon className="w-5 h-5" />
          No
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
