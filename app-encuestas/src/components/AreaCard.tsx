import { ChevronRightIcon } from 'lucide-react';
import type { Area } from '../types';

interface AreaCardProps {
  area: Area;
  onClick: () => void;
}

function AreaImage({ area }: { area: Area }) {
  if (area.imagenUrl) {
    return (
      <div className="w-full h-32 overflow-hidden rounded-t-xl mb-0">
        <img
          src={area.imagenUrl}
          alt={area.nombre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const el = e.target as HTMLImageElement;
            el.style.display = 'none';
            const fallback = el.nextSibling as HTMLElement | null;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <div
          style={{ display: 'none' }}
          className="w-full h-32 bg-[#063E7B]/10 items-center justify-center rounded-t-xl"
        >
          <span className="text-4xl font-bold text-[#063E7B]/30 select-none">
            {area.nombre.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-28 bg-gradient-to-br from-[#063E7B]/8 to-[#C2CFDB]/30 rounded-t-xl flex items-center justify-center">
      <span className="text-5xl font-bold text-[#063E7B]/20 select-none">
        {area.nombre.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

export function AreaCard({ area, onClick }: AreaCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl border border-[#C2CFDB] shadow-sm overflow-hidden hover:shadow-md hover:border-[#063E7B] transition-all group"
    >
      <AreaImage area={area} />

      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#063E7B] text-base leading-snug group-hover:text-[#052f5e] transition-colors truncate">
              {area.nombre}
            </h3>
            {area.descripcion && (
              <p className="mt-1 text-xs text-gray-400 line-clamp-2">{area.descripcion}</p>
            )}
          </div>
          <ChevronRightIcon className="w-4 h-4 text-[#C2CFDB] group-hover:text-[#D0A23E] transition-colors mt-0.5 ml-3 flex-shrink-0" />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#D0A23E]" />
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Calificar servicio</span>
        </div>
      </div>
    </button>
  );
}
