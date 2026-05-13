import { InboxIcon } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({ title = 'Sin resultados', description = 'No hay datos para mostrar.' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
      <InboxIcon className="w-12 h-12 mb-4 opacity-40" />
      <p className="text-base font-medium text-gray-500">{title}</p>
      <p className="text-sm mt-1">{description}</p>
    </div>
  );
}
