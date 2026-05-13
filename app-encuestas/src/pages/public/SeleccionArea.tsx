import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getAreas } from '../../api/areas';
import { AreaCard } from '../../components/AreaCard';
import { PublicLayout } from '../../layouts/PublicLayout';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';

export function SeleccionArea() {
  const navigate = useNavigate();
  const { data: areas, isLoading, isError, refetch } = useQuery({
    queryKey: ['areas-publicas'],
    queryFn: getAreas,
  });

  const areas$ = areas ?? [];

  return (
    <PublicLayout>
      <div className="flex-1 flex flex-col items-center justify-start px-4 pt-10 pb-8">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Califica nuestro servicio
            </h1>
            <p className="text-white/70 text-base">
              Tu opinión nos ayuda a mejorar. Selecciona el área que deseas calificar.
            </p>
          </div>

          {isLoading && (
            <div className="flex justify-center py-16">
              <Spinner size="lg" className="text-white" />
            </div>
          )}

          {isError && (
            <div className="bg-white rounded-xl p-6">
              <ErrorState
                title="No se pudo cargar las áreas"
                description="Verifica tu conexión e inténtalo nuevamente."
                onRetry={() => refetch()}
              />
            </div>
          )}

          {!isLoading && !isError && areas$.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center text-gray-500">
              No hay áreas disponibles en este momento.
            </div>
          )}

          {!isLoading && !isError && areas$.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {areas$.map((area) => (
                <AreaCard
                  key={area.id}
                  area={area}
                  onClick={() => navigate(`/encuesta?area=${area.slug}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
