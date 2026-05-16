// ─── Enums ────────────────────────────────────────────────────────────────────

export type TipoPregunta = 'SI_NO' | 'DESCRIPCION' | 'NOMBRE_SOCIO' | 'ESCALA_1_10';

export type RolUsuario = 'ADMIN' | 'GERENTE' | 'REPORTES';

// ─── Entidades principales ────────────────────────────────────────────────────

export interface Area {
  id: number;
  nombre: string;
  slug: string;
  descripcion?: string | null;
  imagenUrl?: string | null;
  activa?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Provistos por GET /areas/admin/list; útiles para detectar áreas "incompletas"
  totalColaboradoresActivos?: number;
  totalPreguntasActivas?: number;
  preguntas?: Pregunta[];
  colaboradores?: Colaborador[];
}

export interface Colaborador {
  id: number;
  nombre: string;
  apellido: string;
  areaId: number;
  activo?: boolean;
}

export interface Pregunta {
  id: number;
  areaId: number;
  texto: string;
  tipo: TipoPregunta;
  orden: number;
  obligatoria: boolean;
  activa?: boolean;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: RolUsuario;
}

// ─── Encuesta submit ──────────────────────────────────────────────────────────

export interface RespuestaSubmit {
  preguntaId: number;
  valorBooleano?: boolean;
  valorTexto?: string;
  valorNumero?: number;
}

export interface EncuestaSubmit {
  areaId: number;
  colaboradorId?: number;
  nombreSocio: string;
  respuestas: RespuestaSubmit[];
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  access_token: string;
  usuario: Usuario;
}

// ─── Reportes ─────────────────────────────────────────────────────────────────

export interface ResumenEscala {
  preguntaId?: number;
  pregunta?: string;
  totalRespuestas: number;
  promedio: number | null;
  minimo: number | null;
  maximo: number | null;
  distribucion: Record<string, number>;
  detractores: number;
  pasivos: number;
  promotores: number;
  porcentajeDetractores: number;
  porcentajePromotores: number;
  npsAproximado: number | null;
}

export interface ResumenSiNo {
  preguntaId: number;
  texto: string;
  totalSi: number;
  totalNo: number;
  total: number;
  porcentajeSi: number;
  porcentajeNo: number;
  porcentajeSatisfaccion: number;
}

export interface ColaboradorResumen {
  colaboradorId: number;
  nombre: string;
  apellido: string;
  areaId: number;
  areaNombre: string;
  totalEncuestas: number;
  promedioEscala: number | null;
  nps: number | null;
  porcentajeSatisfaccion: number | null;
  totalComentarios: number;
  promotores: number;
  pasivos: number;
  detractores: number;
}

export interface AreaResumen {
  areaId: number;
  nombre: string;
  totalEncuestas: number;
  promedioEscala: number | null;
  nps: number | null;
  porcentajeSatisfaccion: number | null;
  totalComentarios: number;
}

export interface RespuestaTexto {
  fecha: string;
  hora: string;
  area: string;
  colaborador: string | null;
  nombreSocio: string;
  texto: string;
  escala?: number | null;
  clasificacion?: string;
}

export interface ReporteResumen {
  totalEncuestas: number;
  promedioEscala: number | null;
  nps: number | null;
  porcentajeSatisfaccion: number | null;
  totalComentarios: number;
  resumenEscala: ResumenEscala | null;
  preguntasSiNo: ResumenSiNo[];
  colaboradores: ColaboradorResumen[];
  areas: AreaResumen[];
  respuestasTexto: RespuestaTexto[];
}

export interface RespuestaReporte {
  preguntaId: number;
  textoPregunta?: string;
  tipo?: TipoPregunta;
  valorBooleano?: boolean | null;
  valorTexto?: string | null;
  valorNumero?: number | null;
}

export interface EncuestaReporte {
  id: number;
  fechaEnvio?: string;
  fechaDia?: string;
  fecha?: string;
  hora?: string;
  areaNombre?: string;
  area?: { nombre: string };
  colaboradorNombre?: string;
  colaborador?: { nombre: string; apellido: string };
  nombreSocio?: string;
  respuestas?: RespuestaReporte[];
  promedioEscala?: number | null;
}

export interface PaginacionMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EncuestasPaginadasResponse {
  data: EncuestaReporte[];
  meta: PaginacionMeta;
}

export interface ReporteFiltros {
  areaId?: number;
  colaboradorId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  nombreSocio?: string;
  page?: number;
  limit?: number;
}

// ─── DTOs Admin ───────────────────────────────────────────────────────────────

export interface CreateAreaDto {
  nombre: string;
  slug: string;
  descripcion?: string;
  imagenUrl?: string;
  activa?: boolean;
}

export interface UpdateAreaDto extends Partial<CreateAreaDto> {}

export interface CreateColaboradorDto {
  nombre: string;
  apellido: string;
  areaId: number;
  activo?: boolean;
}

export interface UpdateColaboradorDto extends Partial<CreateColaboradorDto> {}

export interface CreatePreguntaDto {
  areaId: number;
  texto: string;
  tipo: TipoPregunta;
  orden: number;
  obligatoria?: boolean;
  activa?: boolean;
}

export interface UpdatePreguntaDto extends Partial<Omit<CreatePreguntaDto, 'areaId'>> {}
