import { CheckCircleIcon, HomeIcon, ExternalLinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PublicLayout } from '../../layouts/PublicLayout';
import { Button } from '../../components/ui/Button';

export function Gracias() {
  const navigate = useNavigate();
  const clubUrl = import.meta.env.VITE_CLUB_URL || 'https://www.clublacampina.com.ec';

  return (
    <PublicLayout>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="flex justify-center mb-6">
            <CheckCircleIcon className="w-20 h-20 text-[#D0A23E]" />
          </div>
          <h1 className="text-2xl font-bold text-[#063E7B] mb-2">
            ¡Gracias por tu calificación!
          </h1>
          <p className="text-gray-500 mb-8">
            Tu opinión nos ayuda a mejorar nuestros servicios. La valoramos mucho.
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate('/')} size="lg" className="w-full">
              <HomeIcon className="w-4 h-4" />
              Volver al inicio
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={() => window.open(clubUrl, '_blank')}
            >
              <ExternalLinkIcon className="w-4 h-4" />
              Visitar sitio web del club
            </Button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
