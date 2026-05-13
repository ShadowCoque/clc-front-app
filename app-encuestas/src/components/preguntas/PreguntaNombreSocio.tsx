import { AlertTriangleIcon } from 'lucide-react';
import { Input } from '../ui/Input';
import type { Pregunta } from '../../types';

interface PreguntaNombreSocioProps {
  pregunta: Pregunta;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
}

export function PreguntaNombreSocio({ pregunta, value, onChange, error }: PreguntaNombreSocioProps) {
  return (
    <div className="space-y-3">
      <Input
        label={`${pregunta.texto}${pregunta.obligatoria ? ' *' : ''}`}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nombres y apellidos completos"
        error={error}
      />
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        <AlertTriangleIcon className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-700">
          Las respuestas anónimas o cuya identidad no pueda ser verificada no serán consideradas.
        </p>
      </div>
    </div>
  );
}
