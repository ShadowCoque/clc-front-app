import { Textarea } from '../ui/Textarea';
import type { Pregunta } from '../../types';

interface PreguntaDescripcionProps {
  pregunta: Pregunta;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
}

export function PreguntaDescripcion({ pregunta, value, onChange, error }: PreguntaDescripcionProps) {
  return (
    <Textarea
      label={`${pregunta.texto}${pregunta.obligatoria ? ' *' : ''}`}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Escribe tu comentario aquí..."
      error={error}
    />
  );
}
