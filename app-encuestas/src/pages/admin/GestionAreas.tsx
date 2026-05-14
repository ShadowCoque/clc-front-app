import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, PencilIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getAreas, createArea, updateArea } from '../../api/areas';
import { getPreguntas, createPregunta, updatePregunta, deletePregunta } from '../../api/preguntas';
import { AdminLayout } from '../../layouts/AdminLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import type { Area, Pregunta, TipoPregunta } from '../../types';
import axios from 'axios';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const areaSchema = z.object({
  nombre: z.string().min(1, 'Requerido'),
  slug: z.string().min(1, 'Requerido').regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  descripcion: z.string().optional(),
  imagenUrl: z.string().optional(),
  activa: z.boolean().optional(),
});
type AreaForm = z.infer<typeof areaSchema>;

const preguntaSchema = z.object({
  texto: z.string().min(1, 'Requerido'),
  tipo: z.enum(['SI_NO', 'DESCRIPCION', 'NOMBRE_SOCIO', 'ESCALA_1_10'] as const),
  orden: z.number().min(1, 'Mínimo 1'),
  obligatoria: z.boolean().optional(),
  activa: z.boolean().optional(),
});
type PreguntaForm = z.infer<typeof preguntaSchema>;

const TIPOS_PREGUNTA: { value: TipoPregunta; label: string }[] = [
  { value: 'SI_NO', label: 'Sí / No' },
  { value: 'DESCRIPCION', label: 'Descripción (texto)' },
  { value: 'NOMBRE_SOCIO', label: 'Nombre del socio' },
  { value: 'ESCALA_1_10', label: 'Escala 1 al 10' },
];

// ─── Modal Area ───────────────────────────────────────────────────────────────

function ModalArea({ area, onClose }: { area?: Area; onClose: () => void }) {
  const qc = useQueryClient();
  const isEdit = !!area;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AreaForm>({
    resolver: zodResolver(areaSchema),
    defaultValues: area
      ? { nombre: area.nombre, slug: area.slug, descripcion: area.descripcion ?? '', imagenUrl: area.imagenUrl ?? '', activa: area.activa }
      : { activa: true },
  });

  async function onSubmit(data: AreaForm) {
    const payload = { ...data, imagenUrl: data.imagenUrl?.trim() || undefined };
    if (isEdit) {
      await updateArea(area.id, payload);
    } else {
      await createArea(payload);
    }
    qc.invalidateQueries({ queryKey: ['areas-admin'] });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-5 border-b border-[#C2CFDB]">
          <h2 className="font-semibold text-[#063E7B]">{isEdit ? 'Editar área' : 'Nueva área'}</h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <Input label="Nombre" {...register('nombre')} error={errors.nombre?.message} />
          <Input label="Slug" {...register('slug')} placeholder="ej: restaurante" error={errors.slug?.message} />
          <Textarea label="Descripción" {...register('descripcion')} />
          <div>
            <Input
              label="Imagen del área (URL o ruta)"
              {...register('imagenUrl')}
              placeholder="/areas/cafeteria.jpg"
            />
            <p className="text-xs text-gray-400 mt-1">Puede ser una ruta pública del frontend o una URL completa. Opcional.</p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('activa')} className="rounded" />
            Activa
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

// ─── Modal Pregunta ───────────────────────────────────────────────────────────

function ModalPregunta({ areaId, pregunta, onClose }: { areaId: number; pregunta?: Pregunta; onClose: () => void }) {
  const qc = useQueryClient();
  const isEdit = !!pregunta;
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PreguntaForm>({
    resolver: zodResolver(preguntaSchema),
    defaultValues: pregunta
      ? { texto: pregunta.texto, tipo: pregunta.tipo, orden: pregunta.orden, obligatoria: pregunta.obligatoria, activa: pregunta.activa }
      : { tipo: 'SI_NO', obligatoria: true, activa: true, orden: 1 },
  });

  async function onSubmit(data: PreguntaForm) {
    setServerError('');
    try {
      if (isEdit) {
        await updatePregunta(pregunta.id, data);
      } else {
        await createPregunta({ ...data, areaId });
      }
      qc.invalidateQueries({ queryKey: ['preguntas', areaId] });
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setServerError('Ya existe una pregunta con ese orden en esta área.');
      } else {
        setServerError('Ocurrió un error. Inténtalo nuevamente.');
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-5 border-b border-[#C2CFDB]">
          <h2 className="font-semibold text-[#063E7B]">{isEdit ? 'Editar pregunta' : 'Nueva pregunta'}</h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <Textarea label="Texto de la pregunta" {...register('texto')} error={errors.texto?.message} />
          <Select label="Tipo" {...register('tipo')} error={errors.tipo?.message}>
            {TIPOS_PREGUNTA.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>
          <Input
            label="Orden"
            type="number"
            min={1}
            {...register('orden', { valueAsNumber: true })}
            error={errors.orden?.message}
          />
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('obligatoria')} className="rounded" />
              Obligatoria
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('activa')} className="rounded" />
              Activa
            </label>
          </div>
          {serverError && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{serverError}</p>}
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" loading={isSubmitting}>Guardar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Row de área con preguntas expandibles ────────────────────────────────────

function AreaRow({ area }: { area: Area }) {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [modalArea, setModalArea] = useState(false);
  const [modalPregunta, setModalPregunta] = useState(false);
  const [preguntaEditar, setPreguntaEditar] = useState<Pregunta | undefined>();

  const { data: preguntas = [], isLoading } = useQuery({
    queryKey: ['preguntas', area.id],
    queryFn: () => getPreguntas(area.id),
    enabled: expanded,
  });

  async function toggleArea() {
    await updateArea(area.id, { activa: !(area.activa ?? true) });
    qc.invalidateQueries({ queryKey: ['areas-admin'] });
  }

  async function desactivarPregunta(p: Pregunta) {
    await deletePregunta(p.id);
    qc.invalidateQueries({ queryKey: ['preguntas', area.id] });
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-[#C2CFDB] shadow-sm">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-[#063E7B] transition-colors">
            {expanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
          </button>
          {area.imagenUrl && (
            <img
              src={area.imagenUrl}
              alt={area.nombre}
              className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-[#C2CFDB]"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-[#063E7B]">{area.nombre}</span>
              <Badge variant={area.activa !== false ? 'success' : 'error'}>{area.activa !== false ? 'Activa' : 'Inactiva'}</Badge>
              <span className="text-xs text-gray-400 font-mono">{area.slug}</span>
            </div>
            {area.descripcion && <p className="text-sm text-gray-400 mt-0.5 truncate">{area.descripcion}</p>}
            {area.imagenUrl && <p className="text-xs text-gray-300 mt-0.5 truncate font-mono">{area.imagenUrl}</p>}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button size="sm" variant="ghost" onClick={() => setModalArea(true)}>
              <PencilIcon className="w-3.5 h-3.5" />
            </Button>
            <Button size="sm" variant={area.activa !== false ? 'danger' : 'secondary'} onClick={toggleArea}>
              {area.activa !== false ? 'Desactivar' : 'Activar'}
            </Button>
          </div>
        </div>

        {expanded && (
          <div className="border-t border-[#C2CFDB] p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-600">Preguntas</h3>
              <Button size="sm" onClick={() => { setPreguntaEditar(undefined); setModalPregunta(true); }}>
                <PlusIcon className="w-3.5 h-3.5" />
                Nueva pregunta
              </Button>
            </div>
            {isLoading && <Spinner size="sm" className="text-[#063E7B]" />}
            {!isLoading && preguntas.length === 0 && (
              <p className="text-sm text-gray-400">No hay preguntas configuradas.</p>
            )}
            {!isLoading && preguntas.length > 0 && (
              <div className="space-y-2">
                {preguntas.sort((a, b) => a.orden - b.orden).map((p) => (
                  <div key={p.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs font-bold text-gray-400 mt-0.5 w-5">#{p.orden}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">{p.texto}</p>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <Badge variant="info">{TIPOS_PREGUNTA.find((t) => t.value === p.tipo)?.label ?? p.tipo}</Badge>
                        {p.obligatoria && <Badge variant="warning">Obligatoria</Badge>}
                        <Badge variant={p.activa !== false ? 'success' : 'error'}>{p.activa !== false ? 'Activa' : 'Inactiva'}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => { setPreguntaEditar(p); setModalPregunta(true); }}>
                        <PencilIcon className="w-3.5 h-3.5" />
                      </Button>
                      {p.activa !== false && (
                        <Button size="sm" variant="danger" onClick={() => desactivarPregunta(p)}>
                          Desactivar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {modalArea && <ModalArea area={area} onClose={() => setModalArea(false)} />}
      {modalPregunta && (
        <ModalPregunta
          areaId={area.id}
          pregunta={preguntaEditar}
          onClose={() => { setModalPregunta(false); setPreguntaEditar(undefined); }}
        />
      )}
    </>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export function GestionAreas() {
  const [modalArea, setModalArea] = useState(false);
  const { data: areas = [], isLoading } = useQuery({
    queryKey: ['areas-admin'],
    queryFn: getAreas,
  });

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#063E7B]">Áreas y Preguntas</h1>
          <Button onClick={() => setModalArea(true)}>
            <PlusIcon className="w-4 h-4" />
            Nueva área
          </Button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-10">
            <Spinner className="text-[#063E7B]" />
          </div>
        )}

        {!isLoading && areas.length === 0 && (
          <p className="text-gray-400 text-sm">No hay áreas creadas.</p>
        )}

        <div className="space-y-3">
          {areas.map((area) => <AreaRow key={area.id} area={area} />)}
        </div>
      </div>

      {modalArea && <ModalArea onClose={() => setModalArea(false)} />}
    </AdminLayout>
  );
}
