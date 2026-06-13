import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, PencilIcon, KeyRoundIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { getAreasAdmin } from '../../api/areas';
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  updateUsuarioPassword,
} from '../../api/usuarios';
import { AdminLayout } from '../../layouts/AdminLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Area, RolUsuario, UsuarioAdmin } from '../../types';

// El backend (NestJS) devuelve { statusCode, message, error }; message puede ser
// string o array (errores de validación). Mostramos un texto entendible.
function getApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(', ');
    if (typeof msg === 'string') return msg;
  }
  return fallback;
}

const ROLES: { value: RolUsuario; label: string }[] = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'REPORTES', label: 'Reportes' },
];

// ─── Selector múltiple de áreas (checkboxes) ──────────────────────────────────

function AreasSelector({
  areas,
  seleccionadas,
  onToggle,
  disabled,
}: {
  areas: Area[];
  seleccionadas: number[];
  onToggle: (id: number) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <span className="text-sm font-medium text-gray-700">Áreas permitidas</span>
      <p className="text-xs text-gray-400 mb-2">
        {disabled
          ? 'Un administrador ve todas las áreas; no se restringe.'
          : 'Vacío = el usuario ve todas las áreas.'}
      </p>
      <div
        className={`max-h-40 overflow-y-auto rounded-lg border border-[#C2CFDB] p-2 space-y-1 ${
          disabled ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        {areas.length === 0 && <p className="text-xs text-gray-400">No hay áreas.</p>}
        {areas.map((a) => (
          <label key={a.id} className="flex items-center gap-2 text-sm px-1 py-0.5">
            <input
              type="checkbox"
              className="rounded"
              checked={seleccionadas.includes(a.id)}
              onChange={() => onToggle(a.id)}
              disabled={disabled}
            />
            <span className="text-gray-800">{a.nombre}</span>
            {a.activa === false && <span className="text-xs text-gray-400">(inactiva)</span>}
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── Modal crear/editar usuario ───────────────────────────────────────────────

const crearSchema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(150, 'Máximo 150 caracteres'),
  email: z.string().email('Email inválido'),
  rol: z.enum(['ADMIN', 'REPORTES'] as const),
  password: z.string().min(8, 'Mínimo 8 caracteres').max(72, 'Máximo 72 caracteres'),
});
type CrearForm = z.infer<typeof crearSchema>;

const editarSchema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(150, 'Máximo 150 caracteres'),
  rol: z.enum(['ADMIN', 'REPORTES'] as const),
  activo: z.boolean(),
});
type EditarForm = z.infer<typeof editarSchema>;

function ModalUsuario({
  usuario,
  areas,
  onClose,
}: {
  usuario?: UsuarioAdmin;
  areas: Area[];
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const isEdit = !!usuario;
  const [serverError, setServerError] = useState('');
  const [areasIds, setAreasIds] = useState<number[]>(usuario?.areasPermitidas ?? []);

  const crearForm = useForm<CrearForm>({
    resolver: zodResolver(crearSchema),
    defaultValues: { nombre: '', email: '', rol: 'REPORTES', password: '' },
  });
  const editarForm = useForm<EditarForm>({
    resolver: zodResolver(editarSchema),
    defaultValues: usuario
      ? { nombre: usuario.nombre, rol: usuario.rol, activo: usuario.activo }
      : { nombre: '', rol: 'REPORTES', activo: true },
  });

  // El rol vive en el formulario activo; con él decidimos si las áreas aplican.
  const rolActual = isEdit ? editarForm.watch('rol') : crearForm.watch('rol');
  const areasDeshabilitadas = rolActual === 'ADMIN';

  function toggleArea(id: number) {
    setAreasIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function onSubmitCrear(data: CrearForm) {
    setServerError('');
    try {
      await createUsuario({
        nombre: data.nombre,
        email: data.email,
        rol: data.rol,
        password: data.password,
        // Un ADMIN ve todo: el backend ignora/limpia las áreas igualmente.
        areasIds: data.rol === 'REPORTES' ? areasIds : [],
      });
      qc.invalidateQueries({ queryKey: ['usuarios-admin'] });
      onClose();
    } catch (err) {
      setServerError(getApiErrorMessage(err, 'No se pudo crear el usuario. Inténtalo nuevamente.'));
    }
  }

  async function onSubmitEditar(data: EditarForm) {
    if (!usuario) return;
    setServerError('');
    try {
      await updateUsuario(usuario.id, {
        nombre: data.nombre,
        rol: data.rol,
        activo: data.activo,
        areasIds: data.rol === 'REPORTES' ? areasIds : [],
      });
      qc.invalidateQueries({ queryKey: ['usuarios-admin'] });
      onClose();
    } catch (err) {
      setServerError(getApiErrorMessage(err, 'No se pudo actualizar el usuario. Inténtalo nuevamente.'));
    }
  }

  const submitting = isEdit ? editarForm.formState.isSubmitting : crearForm.formState.isSubmitting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-[#C2CFDB]">
          <h2 className="font-semibold text-[#063E7B]">{isEdit ? 'Editar usuario' : 'Nuevo usuario'}</h2>
        </div>

        {isEdit ? (
          <form onSubmit={editarForm.handleSubmit(onSubmitEditar)} className="p-5 space-y-4">
            <Input label="Nombre" {...editarForm.register('nombre')} error={editarForm.formState.errors.nombre?.message} />
            <div>
              <span className="text-sm font-medium text-gray-700">Email</span>
              <p className="mt-1 text-sm text-gray-500 bg-gray-50 rounded-lg border border-[#C2CFDB] px-3 py-2">
                {usuario.email}
              </p>
            </div>
            <Select label="Rol" {...editarForm.register('rol')} error={editarForm.formState.errors.rol?.message}>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </Select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...editarForm.register('activo')} className="rounded" />
              Activo
            </label>
            <AreasSelector areas={areas} seleccionadas={areasIds} onToggle={toggleArea} disabled={areasDeshabilitadas} />
            {serverError && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{serverError}</p>}
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button type="submit" loading={submitting}>Guardar</Button>
            </div>
          </form>
        ) : (
          <form onSubmit={crearForm.handleSubmit(onSubmitCrear)} className="p-5 space-y-4">
            <Input label="Nombre" {...crearForm.register('nombre')} error={crearForm.formState.errors.nombre?.message} />
            <Input label="Email" type="email" {...crearForm.register('email')} error={crearForm.formState.errors.email?.message} />
            <Select label="Rol" {...crearForm.register('rol')} error={crearForm.formState.errors.rol?.message}>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </Select>
            <Input
              label="Contraseña"
              type="password"
              {...crearForm.register('password')}
              error={crearForm.formState.errors.password?.message}
            />
            <AreasSelector areas={areas} seleccionadas={areasIds} onToggle={toggleArea} disabled={areasDeshabilitadas} />
            {serverError && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{serverError}</p>}
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button type="submit" loading={submitting}>Guardar</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Modal cambiar contraseña ─────────────────────────────────────────────────

const passwordSchema = z.object({
  password: z.string().min(8, 'Mínimo 8 caracteres').max(72, 'Máximo 72 caracteres'),
});
type PasswordForm = z.infer<typeof passwordSchema>;

function ModalPassword({ usuario, onClose }: { usuario: UsuarioAdmin; onClose: () => void }) {
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '' },
  });

  async function onSubmit(data: PasswordForm) {
    setServerError('');
    try {
      await updateUsuarioPassword(usuario.id, data.password);
      onClose();
    } catch (err) {
      setServerError(getApiErrorMessage(err, 'No se pudo cambiar la contraseña. Inténtalo nuevamente.'));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
        <div className="p-5 border-b border-[#C2CFDB]">
          <h2 className="font-semibold text-[#063E7B]">Cambiar contraseña</h2>
          <p className="text-xs text-gray-400 mt-1 truncate">{usuario.email}</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <Input
            label="Nueva contraseña"
            type="password"
            {...register('password')}
            error={errors.password?.message}
          />
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

// ─── Página principal ─────────────────────────────────────────────────────────

export function GestionUsuarios() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<UsuarioAdmin | undefined>();
  const [passwordDe, setPasswordDe] = useState<UsuarioAdmin | undefined>();
  const [errorAccion, setErrorAccion] = useState('');

  const { data: areas = [] } = useQuery({ queryKey: ['areas-admin'], queryFn: getAreasAdmin });
  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ['usuarios-admin'],
    queryFn: getUsuarios,
  });

  async function toggleActivo(u: UsuarioAdmin) {
    setErrorAccion('');
    try {
      await updateUsuario(u.id, { activo: !u.activo });
      qc.invalidateQueries({ queryKey: ['usuarios-admin'] });
    } catch (err) {
      setErrorAccion(getApiErrorMessage(err, 'No se pudo cambiar el estado del usuario.'));
    }
  }

  function rolLabel(rol: RolUsuario): string {
    return ROLES.find((r) => r.value === rol)?.label ?? rol;
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-xl font-bold text-[#063E7B]">Usuarios</h1>
          <Button onClick={() => { setEditando(undefined); setModal(true); }}>
            <PlusIcon className="w-4 h-4" />
            Nuevo usuario
          </Button>
        </div>

        {errorAccion && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{errorAccion}</p>
        )}

        {isLoading && (
          <div className="flex justify-center py-10">
            <Spinner className="text-[#063E7B]" />
          </div>
        )}

        {!isLoading && usuarios.length === 0 && (
          <EmptyState title="Sin usuarios" description="Aún no hay usuarios registrados." />
        )}

        {!isLoading && usuarios.length > 0 && (
          <>
            {/* ── Vista tabla (tablet/desktop) ─────────────────────────────── */}
            <div className="hidden md:block bg-white rounded-xl border border-[#C2CFDB] shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#063E7B] text-white">
                    <th className="px-4 py-3 text-left font-medium">Nombre</th>
                    <th className="px-4 py-3 text-left font-medium">Email</th>
                    <th className="px-4 py-3 text-left font-medium">Rol</th>
                    <th className="px-4 py-3 text-center font-medium">Áreas</th>
                    <th className="px-4 py-3 text-center font-medium">Estado</th>
                    <th className="px-4 py-3 text-center font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u, i) => (
                    <tr key={u.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-gray-800">{u.nombre}</td>
                      <td className="px-4 py-3 text-gray-500">{u.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant={u.rol === 'ADMIN' ? 'info' : 'default'}>{rolLabel(u.rol)}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-500">
                        {u.rol === 'ADMIN' ? 'Todas' : u.areasPermitidas.length === 0 ? 'Todas' : u.areasPermitidas.length}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={u.activo ? 'success' : 'error'}>{u.activo ? 'Activo' : 'Inactivo'}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-center flex-wrap">
                          <Button size="sm" variant="ghost" onClick={() => { setEditando(u); setModal(true); }}>
                            <PencilIcon className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setPasswordDe(u)}>
                            <KeyRoundIcon className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant={u.activo ? 'danger' : 'secondary'}
                            onClick={() => toggleActivo(u)}
                          >
                            {u.activo ? 'Desactivar' : 'Activar'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Vista tarjetas (móvil) ───────────────────────────────────── */}
            <ul className="md:hidden space-y-2.5">
              {usuarios.map((u) => (
                <li key={u.id} className="bg-white rounded-xl border border-[#C2CFDB] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-800 truncate">{u.nombre}</div>
                      <div className="text-xs text-gray-500 mt-0.5 truncate">{u.email}</div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <Badge variant={u.rol === 'ADMIN' ? 'info' : 'default'}>{rolLabel(u.rol)}</Badge>
                        <span className="text-xs text-gray-400">
                          {u.rol === 'ADMIN' || u.areasPermitidas.length === 0
                            ? 'Todas las áreas'
                            : `${u.areasPermitidas.length} área${u.areasPermitidas.length === 1 ? '' : 's'}`}
                        </span>
                      </div>
                    </div>
                    <Badge variant={u.activo ? 'success' : 'error'}>{u.activo ? 'Activo' : 'Inactivo'}</Badge>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="ghost" className="flex-1" onClick={() => { setEditando(u); setModal(true); }}>
                      <PencilIcon className="w-3.5 h-3.5" />
                      Editar
                    </Button>
                    <Button size="sm" variant="ghost" className="flex-1" onClick={() => setPasswordDe(u)}>
                      <KeyRoundIcon className="w-3.5 h-3.5" />
                      Contraseña
                    </Button>
                    <Button
                      size="sm"
                      variant={u.activo ? 'danger' : 'secondary'}
                      className="flex-1"
                      onClick={() => toggleActivo(u)}
                    >
                      {u.activo ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {modal && (
        <ModalUsuario
          usuario={editando}
          areas={areas}
          onClose={() => { setModal(false); setEditando(undefined); }}
        />
      )}
      {passwordDe && <ModalPassword usuario={passwordDe} onClose={() => setPasswordDe(undefined)} />}
    </AdminLayout>
  );
}
