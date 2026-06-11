import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getAreaBySlug } from '../../api/areas';
import { submitEncuesta } from '../../api/encuestas';
import { PublicLayout } from '../../layouts/PublicLayout';
import { PreguntaSiNo } from '../../components/preguntas/PreguntaSiNo';
import { PreguntaDescripcion } from '../../components/preguntas/PreguntaDescripcion';
import { PreguntaNombreSocio } from '../../components/preguntas/PreguntaNombreSocio';
import { PreguntaEscala } from '../../components/preguntas/PreguntaEscala';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import type { Pregunta, RespuestaSubmit } from '../../types';
import { esTextoNombreSocio } from '../../utils/preguntaNombre';
import axios from 'axios';

type FormValues = Record<string, boolean | string | number | undefined>;

// El backend ya filtra activas; no re-filtrar aquí.
function buildSchema(preguntas: Pregunta[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const p of preguntas) {
    const key = `pregunta_${p.id}`;
    if (p.tipo === 'SI_NO' && p.obligatoria) {
      shape[key] = z.boolean({ error: 'Esta pregunta es obligatoria' });
    } else if (p.tipo === 'SI_NO') {
      shape[key] = z.boolean().optional();
    } else if (p.tipo === 'ESCALA_1_10') {
      const base = z.number({ error: 'Esta pregunta es obligatoria' }).min(1, 'Mínimo 1').max(10, 'Máximo 10');
      shape[key] = p.obligatoria ? base : base.optional();
    } else if (p.obligatoria) {
      // trim: una respuesta de solo espacios no cuenta como respondida.
      shape[key] = z.string({ error: 'Este campo es obligatorio' }).trim().min(1, 'Este campo es obligatorio');
    } else {
      shape[key] = z.string().optional();
    }
  }
  return z.object(shape);
}

export function Encuesta() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const slug = params.get('area') ?? '';
  const colaboradorParam = params.get('colaborador');

  // Selección manual del usuario; el valor efectivo se deriva más abajo.
  const [colaboradorManual, setColaboradorManual] = useState('');
  const [colabError, setColabError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: area, isLoading, isError, error } = useQuery({
    queryKey: ['area-slug', slug],
    queryFn: () => getAreaBySlug(slug),
    enabled: !!slug,
    retry: false,
  });

  // Backend ya devuelve solo activas/activos — no re-filtrar.
  // Si una pregunta de texto pide el nombre del socio (p. ej. el admin la creó
  // como DESCRIPCION en lugar de NOMBRE_SOCIO), se trata como NOMBRE_SOCIO para
  // que la encuesta no se registre como "Anónimo".
  const preguntas: Pregunta[] = [...(area?.preguntas ?? [])]
    .sort((a, b) => a.orden - b.orden)
    .map((p) =>
      p.tipo === 'DESCRIPCION' && esTextoNombreSocio(p.texto)
        ? { ...p, tipo: 'NOMBRE_SOCIO' }
        : p,
    );
  const colaboradores = area?.colaboradores ?? [];

  // El param ?colaborador=X solo se respeta si ese id pertenece al área cargada.
  const colaboradorParamValido =
    !!colaboradorParam &&
    colaboradores.some((c) => c.id === Number(colaboradorParam));

  // Valor efectivo derivado: param válido > selección manual (si sigue siendo
  // un colaborador del área) > único colaborador activo > sin selección.
  const colaboradorId = colaboradorParamValido
    ? String(colaboradorParam)
    : colaboradorManual && colaboradores.some((c) => String(c.id) === colaboradorManual)
      ? colaboradorManual
      : colaboradores.length === 1
        ? String(colaboradores[0].id)
        : '';

  const schema = buildSchema(preguntas);
  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
  });

  if (!slug) {
    return (
      <PublicLayout>
        <div className="flex-1 flex items-center justify-center">
          <ErrorState title="URL inválida" description="No se especificó un área." />
        </div>
      </PublicLayout>
    );
  }

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" className="text-white" />
        </div>
      </PublicLayout>
    );
  }

  if (isError || !area) {
    // El backend devuelve 400 cuando un área existe pero todavía no tiene
    // colaboradores activos o preguntas activas; lo tratamos como "aún no disponible".
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    if (status === 400) {
      return (
        <PublicLayout>
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="bg-white rounded-xl p-6 max-w-md">
              <ErrorState
                title="Área no disponible"
                description="Esta área aún no está disponible para encuestas."
              />
            </div>
          </div>
        </PublicLayout>
      );
    }
    return (
      <PublicLayout>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl p-6">
            <ErrorState title="Área no encontrada" description="El enlace puede estar desactualizado." />
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (area.activa === false) {
    return (
      <PublicLayout>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl p-6 max-w-md">
            <ErrorState
              title="Área no disponible"
              description="Esta área no está aceptando encuestas en este momento."
            />
          </div>
        </div>
      </PublicLayout>
    );
  }

  // El error del colaborador debe aparecer junto con los errores de los demás
  // campos, no solo cuando el resto del formulario ya es válido.
  function validarColaborador(): boolean {
    if (colaboradores.length > 0 && !colaboradorId) {
      setColabError('Por favor selecciona quién le atendió.');
      return false;
    }
    setColabError('');
    return true;
  }

  async function onSubmit(data: FormValues) {
    if (!validarColaborador()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const respuestas: RespuestaSubmit[] = preguntas
        .map((p) => {
          const val = data[`pregunta_${p.id}`];
          const r: RespuestaSubmit = { preguntaId: p.id };
          if (p.tipo === 'SI_NO' && val !== undefined) r.valorBooleano = val as boolean;
          else if (p.tipo === 'ESCALA_1_10' && val !== undefined) r.valorNumero = val as number;
          else if (val !== undefined && String(val).trim() !== '') r.valorTexto = String(val).trim();
          return r;
        })
        .filter((r) => r.valorBooleano !== undefined || r.valorTexto !== undefined || r.valorNumero !== undefined);

      // El nombre del socio sale de la respuesta a la pregunta de nombre;
      // sin esa pregunta (o vacía y opcional) la encuesta queda como 'Anónimo'.
      const preguntaNombre = preguntas.find((p) => p.tipo === 'NOMBRE_SOCIO');
      const nombreSocioRaw = preguntaNombre
        ? String(data[`pregunta_${preguntaNombre.id}`] ?? '').trim()
        : '';
      await submitEncuesta({
        areaId: area!.id,
        ...(colaboradorId ? { colaboradorId: Number(colaboradorId) } : {}),
        nombreSocio: nombreSocioRaw || 'Anónimo',
        respuestas,
      });
      navigate('/gracias');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        setSubmitError('Por favor revisa los datos ingresados e inténtalo nuevamente.');
      } else {
        setSubmitError('Ocurrió un error al enviar. Inténtalo nuevamente.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PublicLayout>
      <div className="flex-1 flex flex-col items-center px-4 pt-6 pb-10">
        <div className="w-full max-w-lg">
          {/* Encabezado del área con imagen opcional */}
          <div className="mb-6 text-center">
            {area.imagenUrl && (
              <div className="mb-4 overflow-hidden rounded-xl h-32 w-full">
                <img
                  src={area.imagenUrl}
                  alt={area.nombre}
                  decoding="async"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
            <h1 className="text-2xl font-bold text-white">{area.nombre}</h1>
            {area.descripcion && (
              <p className="text-white/70 mt-1 text-sm">{area.descripcion}</p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 space-y-7">
            {/* Selección de colaborador */}
            {colaboradores.length > 1 && (
              <Select
                label="¿Quién le atendió? *"
                value={colaboradorId}
                onChange={(e) => { setColaboradorManual(e.target.value); setColabError(''); }}
                placeholder="Selecciona un colaborador"
                disabled={colaboradorParamValido}
                error={colabError}
              >
                {colaboradores.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} {c.apellido}
                  </option>
                ))}
              </Select>
            )}

            <form onSubmit={handleSubmit(onSubmit, () => validarColaborador())} className="space-y-7">
              {preguntas.map((p) => {
                const key = `pregunta_${p.id}` as const;
                const error = errors[key]?.message as string | undefined;

                if (p.tipo === 'SI_NO') {
                  return (
                    <Controller
                      key={p.id}
                      name={key}
                      control={control}
                      render={({ field }) => (
                        <PreguntaSiNo
                          pregunta={p}
                          value={field.value as boolean | undefined}
                          onChange={(v) => field.onChange(v)}
                          error={error}
                        />
                      )}
                    />
                  );
                }
                if (p.tipo === 'ESCALA_1_10') {
                  return (
                    <Controller
                      key={p.id}
                      name={key}
                      control={control}
                      render={({ field }) => (
                        <PreguntaEscala
                          pregunta={p}
                          value={field.value as number | undefined}
                          onChange={(v) => field.onChange(v)}
                          error={error}
                        />
                      )}
                    />
                  );
                }
                if (p.tipo === 'NOMBRE_SOCIO') {
                  return (
                    <Controller
                      key={p.id}
                      name={key}
                      control={control}
                      render={({ field }) => (
                        <PreguntaNombreSocio
                          pregunta={p}
                          value={field.value as string | undefined}
                          onChange={(v) => field.onChange(v)}
                          error={error}
                        />
                      )}
                    />
                  );
                }
                // DESCRIPCION y cualquier tipo futuro
                return (
                  <Controller
                    key={p.id}
                    name={key}
                    control={control}
                    render={({ field }) => (
                      <PreguntaDescripcion
                        pregunta={p}
                        value={field.value as string | undefined}
                        onChange={(v) => field.onChange(v)}
                        error={error}
                      />
                    )}
                  />
                );
              })}

              {submitError && (
                <div className="rounded-lg px-4 py-3 text-sm bg-red-50 text-red-700 border border-red-200">
                  {submitError}
                </div>
              )}

              <Button type="submit" size="lg" loading={submitting} className="w-full">
                Enviar calificación
              </Button>
            </form>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
