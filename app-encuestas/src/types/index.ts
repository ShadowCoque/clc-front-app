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

export interface ResumenSiNo {
  preguntaId: number;
  texto: string;
  totalSi: number;
  totalNo: number;
  porcentajeSi: number;
  porcentajeNo: number;
}

export interface ResumenEscala {
  preguntaId?: number;
  texto?: string;
  promedio: number;
  total: number;
  distribucion?: Record<string, number>;
  nps?: number;
}

export interface RespuestaTexto {
  preguntaId?: number;
  texto?: string;
  valor: string;
}

export interface ColaboradorResumen {
  colaboradorId: number;
  nombre: string;
  apellido: string;
  totalEncuestas: number;
  promedioEscala?: number;
  porcentajeSatisfaccion?: number;
}

export interface AreaResumen {
  areaId: number;
  nombre: string;
  totalEncuestas: number;
  promedioEscala?: number;
}

export interface ReporteResumen {
  totalEncuestas?: number;
  promedioEscala?: number;
  nps?: number;
  porcentajeSatisfaccion?: number;
  totalComentarios?: number;
  preguntasSiNo?: ResumenSiNo[];
  resumenSiNo?: ResumenSiNo[];
  escalas?: ResumenEscala[];
  resumenEscala?: ResumenEscala;
  respuestasTexto?: RespuestaTexto[];
  colaboradores?: ColaboradorResumen[];
  areas?: AreaResumen[];
  [key: string]: unknown;
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
