import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SearchIcon, FilterIcon, XIcon, DownloadIcon } from 'lucide-react';
import { getAreas } from '../../api/areas';
import { getColaboradores } from '../../api/colaboradores';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import type { ReporteFiltros } from '../../types';

interface FiltersBarProps {
  onFilter: (filtros: ReporteFiltros) => void;
  onExport: () => void;
  exporting?: boolean;
}

export function FiltersBar({ onFilter, onExport, exporting = false }: FiltersBarProps) {
  const [areaId, setAreaId] = useState('');
  const [colaboradorId, setColaboradorId] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [nombreSocio, setNombreSocio] = useState('');

  const { data: areas = [] } = useQuery({ queryKey: ['areas'], queryFn: getAreas });
  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores', areaId],
    queryFn: () => getColaboradores(areaId ? Number(areaId) : undefined),
  });

  useEffect(() => { setColaboradorId(''); }, [areaId]);

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
    setAreaId('');
    setColaboradorId('');
    setFechaDesde('');
    setFechaHasta('');
    setNombreSocio('');
    onFilter({});
  }

  return (
    <div className="bg-white rounded-xl border border-[#C2CFDB] shadow-sm p-4">
      <div className="flex items-center gap-2 mb-4">
        <FilterIcon className="w-4 h-4 text-[#063E7B]" />
        <h3 className="font-medium text-gray-700 text-sm">Filtros</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        <Select value={areaId} onChange={(e) => setAreaId(e.target.value)} placeholder="Todas las áreas" label="Área">
          {areas.map((a) => (
            <option key={a.id} value={a.id}>{a.nombre}</option>
          ))}
        </Select>
        <Select value={colaboradorId} onChange={(e) => setColaboradorId(e.target.value)} placeholder="Todos" label="Colaborador">
          {colaboradores.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>
          ))}
        </Select>
        <Input type="date" label="Desde" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
        <Input type="date" label="Hasta" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
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
