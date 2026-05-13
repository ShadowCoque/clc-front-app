import { AlertCircleIcon } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Ocurrió un error',
  description = 'No se pudo cargar la información. Inténtalo nuevamente.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertCircleIcon className="w-12 h-12 mb-4 text-red-400" />
      <p className="text-base font-medium text-gray-700">{title}</p>
      <p className="text-sm mt-1 text-gray-500">{description}</p>
      {onRetry && (
        <Button variant="ghost" size="sm" className="mt-4" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  );
}
