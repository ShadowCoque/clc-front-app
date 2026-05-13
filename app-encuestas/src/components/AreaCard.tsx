import { ChevronRightIcon } from 'lucide-react';
import type { Area } from '../types';

interface AreaCardProps {
  area: Area;
  onClick: () => void;
}

export function AreaCard({ area, onClick }: AreaCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl border border-[#C2CFDB] shadow-sm p-6 hover:shadow-md hover:border-[#063E7B] transition-all group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-[#063E7B] text-lg leading-snug group-hover:text-[#052f5e] transition-colors">
            {area.nombre}
          </h3>
          {area.descripcion && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{area.descripcion}</p>
          )}
        </div>
        <ChevronRightIcon className="w-5 h-5 text-[#C2CFDB] group-hover:text-[#D0A23E] transition-colors mt-0.5 ml-4 flex-shrink-0" />
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-[#D0A23E]" />
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Calificar servicio</span>
      </div>
    </button>
  );
}
