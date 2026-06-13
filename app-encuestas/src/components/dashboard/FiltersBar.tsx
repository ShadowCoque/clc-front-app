import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SearchIcon, FilterIcon, XIcon, DownloadIcon } from 'lucide-react';
import { getAreas } from '../../api/areas';
import { getColaboradores } from '../../api/colaboradores';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import type { Colaborador, ReporteFiltros } from '../../types';

interface FiltersBarProps {
  onFilter: (filtros: ReporteFiltros) => void;
  onExport: () => void;
  exporting?: boolean;
}

export function FiltersBar({ onFilter, onExport, exporting = false }: FiltersBarProps) {
  const { user } = useAuth();
  const [areaId, setAreaId] = useState('');
  const [colaboradorId, setColaboradorId] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [nombreSocio, setNombreSocio] = useState('');
  // Forzar re-mount de inputs de fecha al limpiar
  const [dateKey, setDateKey] = useState(0);

  const { data: areas = [] } = useQuery({ queryKey: ['areas'], queryFn: getAreas });
  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores', areaId],
    queryFn: () => getColaboradores(areaId ? Number(areaId) : undefined),
  });

  // Usuarios REPORTES pueden estar limitados a ciertas áreas: solo se muestran
  // esas y no se ofrece la opción "todas" (pedir otra dispararía un 403).
  const areasPermitidas = user?.areasPermitidas ?? [];
  const restringido = areasPermitidas.length > 0;
  const areasVisibles = restringido
    ? areas.filter((a) => areasPermitidas.includes(a.id))
    : areas;

  // Sin opción "todas", el selector debe tener siempre un área concreta.
  useEffect(() => {
    if (restringido && !areaId && areasVisibles.length > 0) {
      setAreaId(String(areasVisibles[0].id));
    }
  }, [restringido, areaId, areasVisibles]);

  // Al cambiar de área se limpia el colaborador (se hace en el onChange del
  // select de área, no en un efecto, para evitar renders en cascada).
  function handleAreaChange(value: string) {
    setAreaId(value);
    setColaboradorId('');
  }

  // Solo colaboradores activos (igual que áreas, que el endpoint público ya filtra)
  const colaboradoresActivos = colaboradores.filter(c => c.activo !== false);

  // En contexto multi-área: si dos colaboradores comparten nombre+apellido, añadir el área entre paréntesis
  function getNombreColaborador(c: Colaborador): string {
    const nombreCompleto = `${c.nombre} ${c.apellido}`;
    if (areaId) return nombreCompleto; // contexto de área única: nombre sin ambiguación
    const esDuplicado = colaboradoresActivos.some(
      x => x.id !== c.id && `${x.nombre} ${x.apellido}` === nombreCompleto
    );
    if (esDuplicado) {
      const area = areas.find(a => a.id === c.areaId);
      return area ? `${nombreCompleto} (${area.nombre})` : nombreCompleto;
    }
    return nombreCompleto;
  }

  function buildFiltros(): ReporteFiltros {
    return {
      ...(areaId ? { areaId: Number(areaId) } : {}),
      ...(colaboradorId ? { colaboradorId: Number(colaboradorId) } : {}),
      ...(fechaDesde ? { fechaDesde } : {}),
      ...(fechaHasta ? { fechaHasta } : {}),
      ...(nombreSocio ? { nombreSocio } : {}),
    };
  }

  function handleApply() { onFilter(buildFiltros()); }

  function handleClear() {
    // El usuario restringido vuelve a su primera área permitida (el efecto la
    // re-selecciona); el no restringido vuelve a "todas".
    const areaReset = restringido && areasVisibles.length > 0 ? String(areasVisibles[0].id) : '';
    setAreaId(areaReset);
    setColaboradorId('');
    setFechaDesde('');
    setFechaHasta('');
    setNombreSocio('');
    setDateKey((k) => k + 1); // fuerza re-mount de los date inputs
    onFilter(areaReset ? { areaId: Number(areaReset) } : {});
  }

  return (
    <div className="bg-white rounded-xl border border-[#C2CFDB] shadow-sm p-4">
      <div className="flex items-center gap-2 mb-4">
        <FilterIcon className="w-4 h-4 text-[#063E7B]" />
        <h3 className="font-medium text-gray-700 text-sm">Filtros</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        <Select
          value={areaId}
          onChange={(e) => handleAreaChange(e.target.value)}
          placeholder={restringido ? undefined : 'Todas las áreas'}
          label="Área"
        >
          {areasVisibles.map((a) => (
            <option key={a.id} value={a.id}>{a.nombre}</option>
          ))}
        </Select>
        <Select value={colaboradorId} onChange={(e) => setColaboradorId(e.target.value)} placeholder="Todos" label="Colaborador">
          {colaboradoresActivos.map((c) => (
            <option key={c.id} value={c.id}>{getNombreColaborador(c)}</option>
          ))}
        </Select>
        <Input
          key={`desde-${dateKey}`}
          type="date"
          label="Desde"
          defaultValue=""
          onChange={(e) => setFechaDesde(e.target.value)}
        />
        <Input
          key={`hasta-${dateKey}`}
          type="date"
          label="Hasta"
          defaultValue=""
          onChange={(e) => setFechaHasta(e.target.value)}
        />
        <Input
          label="Nombre socio"
          value={nombreSocio}
          onChange={(e) => setNombreSocio(e.target.value)}
          placeholder="Buscar..."
        />
      </div>
      <div className="flex gap-2 mt-4 flex-wrap">
        <Button onClick={handleApply} size="sm">
          <SearchIcon className="w-4 h-4" />
          Aplicar filtros
        </Button>
        <Button variant="ghost" size="sm" onClick={handleClear}>
          <XIcon className="w-4 h-4" />
          Limpiar
        </Button>
        <Button variant="secondary" size="sm" onClick={onExport} loading={exporting} className="ml-auto">
          <DownloadIcon className="w-4 h-4" />
          Exportar Excel
        </Button>
      </div>
    </div>
  );
}
