import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, PencilIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getAreas } from '../../api/areas';
import { getColaboradores, createColaborador, updateColaborador } from '../../api/colaboradores';
import { AdminLayout } from '../../layouts/AdminLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Colaborador } from '../../types';

const schema = z.object({
  nombre: z.string().min(1, 'Requerido'),
  apellido: z.string().min(1, 'Requerido'),
  areaId: z.number({ error: 'Selecciona un área' }).min(1),
  activo: z.boolean().optional(),
});
type ColaboradorForm = z.infer<typeof schema>;

function ModalColaborador({ colaborador, onClose }: { colaborador?: Colaborador; onClose: () => void }) {
  const qc = useQueryClient();
  const isEdit = !!colaborador;
  const { data: areas = [] } = useQuery({ queryKey: ['areas'], queryFn: getAreas });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ColaboradorForm>({
    resolver: zodResolver(schema),
    defaultValues: colaborador
      ? { nombre: colaborador.nombre, apellido: colaborador.apellido, areaId: colaborador.areaId, activo: colaborador.activo }
      : { activo: true },
  });

  async function onSubmit(data: ColaboradorForm) {
    if (isEdit) {
      await updateColaborador(colaborador.id, data);
    } else {
      await createColaborador(data);
    }
    qc.invalidateQueries({ queryKey: ['colaboradores-admin'] });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
        <div className="p-5 border-b border-[#C2CFDB]">
          <h2 className="font-semibold text-[#063E7B]">{isEdit ? 'Editar colaborador' : 'Nuevo colaborador'}</h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <Input label="Nombre" {...register('nombre')} error={errors.nombre?.message} />
          <Input label="Apellido" {...register('apellido')} error={errors.apellido?.message} />
          <Select
            label="Área"
            {...register('areaId', { valueAsNumber: true })}
            placeholder="Selecciona un área"
            error={errors.areaId?.message}
          >
            {areas.map((a) => (
              <option key={a.id} value={a.id}>{a.nombre}</option>
            ))}
          </Select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('activo')} className="rounded" />
            Activo
          </label>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" loading={isSubmitting}>Guardar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function GestionColaboradores() {
  const qc = useQueryClient();
  const [areaFiltro, setAreaFiltro] = useState('');
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Colaborador | undefined>();

  const { data: areas = [], isSuccess: areasLoaded } = useQuery({ queryKey: ['areas'], queryFn: getAreas });
  const { data: colaboradores = [], isLoading } = useQuery({
    queryKey: ['colaboradores-admin', areaFiltro],
    enabled: areasLoaded,
    queryFn: async () => {
      if (areaFiltro) return getColaboradores(Number(areaFiltro));
      const results = await Promise.all(areas.map((a) => getColaboradores(a.id)));
      return results.flat().sort((a, b) => a.apellido.localeCompare(b.apellido));
    },
  });

  async function toggleActivo(c: Colaborador) {
    await updateColaborador(c.id, { activo: !(c.activo ?? true) });
    qc.invalidateQueries({ queryKey: ['colaboradores-admin'] });
  }

  function getAreaNombre(areaId: number): string {
    return areas.find((a) => a.id === areaId)?.nombre ?? '—';
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-xl font-bold text-[#063E7B]">Colaboradores</h1>
          <Button onClick={() => { setEditando(undefined); setModal(true); }}>
            <PlusIcon className="w-4 h-4" />
            Nuevo colaborador
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-[#C2CFDB] shadow-sm p-4">
          <Select
            label="Filtrar por área"
            value={areaFiltro}
            onChange={(e) => setAreaFiltro(e.target.value)}
            placeholder="Todas las áreas"
            className="max-w-xs"
          >
            {areas.map((a) => (
              <option key={a.id} value={a.id}>{a.nombre}</option>
            ))}
          </Select>
        </div>

        {isLoading && (
          <div className="flex justify-center py-10">
            <Spinner className="text-[#063E7B]" />
          </div>
        )}

        {!isLoading && colaboradores.length === 0 && (
          <EmptyState title="Sin colaboradores" description="No hay colaboradores con los filtros aplicados." />
        )}

        {!isLoading && colaboradores.length > 0 && (
          <div className="bg-white rounded-xl border border-[#C2CFDB] shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#063E7B] text-white">
                  <th className="px-4 py-3 text-left font-medium">Nombre</th>
                  <th className="px-4 py-3 text-left font-medium">Apellido</th>
                  <th className="px-4 py-3 text-left font-medium">Área</th>
                  <th className="px-4 py-3 text-center font-medium">Estado</th>
                  <th className="px-4 py-3 text-center font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {colaboradores.map((c, i) => (
                  <tr key={c.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-gray-800">{c.nombre}</td>
                    <td className="px-4 py-3 text-gray-800">{c.apellido}</td>
                    <td className="px-4 py-3 text-gray-500">{getAreaNombre(c.areaId)}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={c.activo !== false ? 'success' : 'error'}>
                        {c.activo !== false ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        <Button size="sm" variant="ghost" onClick={() => { setEditando(c); setModal(true); }}>
                          <PencilIcon className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant={c.activo !== false ? 'danger' : 'secondary'}
                          onClick={() => toggleActivo(c)}
                        >
                          {c.activo !== false ? 'Desactivar' : 'Activar'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <ModalColaborador
          colaborador={editando}
          onClose={() => { setModal(false); setEditando(undefined); }}
        />
      )}
    </AdminLayout>
  );
}
