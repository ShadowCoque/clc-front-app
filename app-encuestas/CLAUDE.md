# CLAUDE.md

## Proyecto

Frontend React + Vite + TypeScript para la aplicación de encuestas de satisfacción del Club Social y Deportivo La Campiña, Quito.

Este frontend consume el backend NestJS + Prisma + PostgreSQL ya existente en:

- Desarrollo local: `http://localhost:3000/api`
- Variable recomendada: `VITE_API_URL=http://localhost:3000/api`

El sistema tiene dos grandes partes:

1. Portal público de encuestas por área/QR.
2. Panel administrativo interno para gestión, reportes y exportación Excel.

## Reglas de contexto

Antes de generar o modificar código, revisar solo archivos necesarios:

- `package.json`
- `vite.config.ts`
- `tailwind.config.ts`
- `src/main.tsx`
- `src/App.tsx`
- `src/router/index.tsx`
- `src/types/index.ts`
- `src/api/*`
- `src/pages/*`
- `src/components/*`
- `src/hooks/*`

No leer salvo necesidad real:

- `node_modules/`
- `dist/`
- `build/`
- archivos generados
- `.env` con secretos reales
- archivos grandes innecesarios

No hardcodear datos reales como fuente principal. Todo debe venir de la API.

## Stack frontend

Usar:

- React (versión a confirmar por ti --> puedes ejecutar comandos para ver)
- Vite
- TypeScript
- React Router v6
- TanStack Query / React Query
- Axios
- React Hook Form
- Zod
- Tailwind CSS
- Recharts
- Lucide React para íconos
- File download directo desde backend para Excel

Usar `.xlsx` para guardar Excel en frontend. El backend ya genera archivo pero sin su formato (.xlsx).

## Paleta institucional

Configurar en Tailwind:

```ts
colors: {
  primary: '#063E7B',
  gold: '#D0A23E',
  slate: '#C2CFDB',
}

Uso:

primary: encabezados, botones principales, navegación activa.
gold: acentos, badges, detalles visuales, botones secundarios elegantes.
slate: fondos suaves, bordes, texto secundario.
white: fondo principal, cards y formularios.

No saturar componentes con demasiados colores. Mantener estilo institucional, limpio y moderno.

## Modelos principales del
backend

Area
interface Area {
  id: number;
  nombre: string;
  slug: string;
  descripcion?: string | null;
  activa: boolean;
  preguntas?: Pregunta[];
  colaboradores?: Colaborador[];
}
Colaborador
interface Colaborador {
  id: number;
  nombre: string;
  apellido: string;
  areaId: number;
  activo: boolean;
}
TipoPregunta
type TipoPregunta =
  | 'SI_NO'
  | 'DESCRIPCION'
  | 'NOMBRE_SOCIO'
  | 'ESCALA_1_10';
Pregunta
interface Pregunta {
  id: number;
  areaId: number;
  texto: string;
  tipo: TipoPregunta;
  orden: number;
  obligatoria: boolean;
  activa: boolean;
}
EncuestaSubmit
interface RespuestaSubmit {
  preguntaId: number;
  valorBooleano?: boolean;
  valorTexto?: string;
  valorNumero?: number;
}

interface EncuestaSubmit {
  areaId: number;
  colaboradorId?: number;
  nombreSocio: string;
  respuestas: RespuestaSubmit[];
}
Usuario
interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'GERENTE' | 'REPORTES';
}
Reglas importantes del backend
Fechas

El backend maneja:

fechaEnvio: timestamp técnico exacto.
fechaDia: fecha de negocio Ecuador.

El frontend debe mostrar preferentemente:

fecha: valor formateado que devuelve la API.
hora: valor formateado que devuelve la API.

No recalcular fechas manualmente en el frontend salvo necesidad visual. El backend ya devuelve fecha y hora correctas para Ecuador.

## Preguntas

El formulario público debe renderizarse dinámicamente según pregunta.tipo.

Tipos actuales:

SI_NO
Botones grandes: Sí / No.
Obligatoria si obligatoria=true.
DESCRIPCION
Textarea.
Puede ser opcional.
NOMBRE_SOCIO
Input de nombres y apellidos.
Debe sincronizarse con nombreSocio del payload.
Mostrar advertencia:
"Las respuestas anónimas o cuya identidad no pueda ser verificada no serán consideradas."
ESCALA_1_10
Escala obligatoria de 1 a 10.
Enviar como valorNumero.
Validar rango 1-10.
Mostrar visualmente como botones, chips o escala horizontal clara.
Debe ser fácil de usar en móvil.

## Rate limit

El backend responde 429 si la misma IP ya envió encuesta para la misma área en el mismo día Ecuador.

El frontend debe mostrar:

"Ya enviaste una encuesta para esta área hoy. ¡Gracias por tu participación!"

No tratar 429 como error técnico.

Endpoints públicos
GET /areas

Devuelve áreas activas.

Uso frontend:

Página principal /
Cards de áreas.
GET /areas/:slug

Devuelve:

Área
Preguntas activas ordenadas
Colaboradores activos

Uso frontend:

Página /encuesta?area={slug}
Render dinámico de formulario.
POST /encuestas

Envía encuesta pública.

Body:

{
  "areaId": 6,
  "colaboradorId": 7,
  "nombreSocio": "Socio Prueba",
  "respuestas": [
    { "preguntaId": 36, "valorBooleano": true },
    { "preguntaId": 40, "valorNumero": 9 },
    { "preguntaId": 42, "valorTexto": "Comentario" }
  ]
}

Posibles respuestas importantes:

200/201: encuesta registrada.
400: validación incorrecta.
429: ya envió encuesta hoy.
500: error inesperado.
Endpoints de autenticación
POST /auth/login

Body:

{
  "email": "soporte.ti@clublacampina.com.ec",
  "password": "Admin2026!"
}

Respuesta:

interface LoginResponse {
  access_token: string;
  usuario: Usuario;
}

Guardar token en localStorage con clave:

clc_token

Guardar usuario decodificado o respuesta en estado de auth.

Endpoints administrativos

Todos requieren:

Authorization: Bearer TOKEN
Áreas
POST /areas
PATCH /areas/:id

Roles esperados:

ADMIN
GERENTE
Colaboradores
GET /colaboradores?areaId=X
POST /colaboradores
PATCH /colaboradores/:id

Notas:

El panel admin puede ver activos e inactivos.
El formulario público solo recibe colaboradores activos desde GET /areas/:slug.
Preguntas
GET /preguntas?areaId=X
POST /preguntas
PATCH /preguntas/:id
DELETE /preguntas/:id

Notas:

DELETE es soft delete: activa=false.
Crear pregunta con orden repetido debe responder 409.
Tipos permitidos:
SI_NO
DESCRIPCION
NOMBRE_SOCIO
ESCALA_1_10
Endpoints de reportes

Todos requieren JWT.

GET /reportes/resumen

Query params opcionales:

areaId
colaboradorId
fechaDesde
fechaHasta

Ejemplo:

/reportes/resumen?areaId=6&colaboradorId=7&fechaDesde=2026-05-01&fechaHasta=2026-05-31

Uso frontend:

Cards KPI
Gráficas
Resumen por área
Resumen por colaborador
Análisis de SI/NO
Análisis escala 1-10
Comentarios

El frontend debe soportar nombres de campos flexibles y validar estructura defensivamente, porque el backend puede devolver secciones como:

totalEncuestas
preguntasSiNo
resumenSiNo
respuestasTexto
escalas
resumenEscala
colaboradores
areas
GET /reportes/encuestas

Query params:

areaId?
colaboradorId?
fechaDesde?
fechaHasta?
nombreSocio?
page?
limit?

Ejemplo:

/reportes/encuestas?areaId=6&page=1&limit=20

Respuesta esperada:

interface EncuestasPaginadasResponse {
  data: EncuestaReporte[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

Uso frontend:

Tabla detallada de encuestas.
Buscador por socio.
Paginación.
Modal de detalle de respuestas.
GET /reportes/exportar

Query params:

areaId?
colaboradorId?
fechaDesde?
fechaHasta?
nombreSocio?

Ejemplos:

/reportes/exportar?areaId=6
/reportes/exportar?areaId=6&colaboradorId=7
/reportes/exportar?areaId=6&fechaDesde=2026-05-01&fechaHasta=2026-05-31

Uso frontend:

Botón "Exportar Excel".
Descargar blob.
No intentar parsear el archivo.
Nombre sugerido: reporte-encuestas.xlsx.
Rutas públicas del frontend
/

Página de selección de área.

Debe mostrar:

Logo del club.
Título: "Califica nuestro servicio".
Subtítulo amable.
Cards de áreas activas.
Diseño mobile-first.
Cards con hover elegante.

Cada card navega a:

/encuesta?area={slug}
/encuesta?area={slug}

Formulario dinámico.

Reglas:

Leer query param area.
Llamar GET /areas/:slug.
Si área tiene un solo colaborador activo, preseleccionarlo.
Si hay varios colaboradores, mostrar select "¿Quién le atendió?"
Si URL trae colaborador={id}, preseleccionar ese colaborador y bloquear edición.
Renderizar preguntas por tipo.
Validar con React Hook Form + Zod.
Enviar POST /encuestas.
Manejar 429 de forma amable.
Al éxito, navegar a /gracias.
/gracias

Pantalla de confirmación.

Debe mostrar:

Logo.
Ícono de check.
"¡Gracias por tu calificación!"
"Tu opinión nos ayuda a mejorar."
Botón volver al inicio.
Botón al sitio web del club.
Rutas administrativas

Base:

/gestion-clc
/gestion-clc/login

Login discreto.

No poner textos demasiado evidentes como "Administración secreta".

Debe tener:

Logo
Email
Contraseña
Mensaje de error
Redirección a dashboard si login correcto
/gestion-clc/dashboard

Dashboard principal.

Debe tener filtros:

Área
Colaborador dependiente del área
Fecha desde
Fecha hasta
Nombre socio
Botón aplicar filtros
Botón limpiar filtros
Botón exportar Excel

Debe consumir:

/reportes/resumen
/reportes/encuestas
/reportes/exportar

Debe mostrar:

KPIs
Total encuestas
Promedio escala 1-10
NPS aproximado
% satisfacción SI/NO
Total comentarios
Gráfica dona para promotores/pasivos/detractores
Barras por pregunta SI/NO
Barras por colaborador si aplica
Tabla de encuestas paginada
Tabla de comentarios
/gestion-clc/areas

Gestión de áreas y preguntas.

Debe permitir:

Listar áreas.
Crear área.
Editar área.
Activar/desactivar área.
Ver preguntas por área.
Crear pregunta.
Editar pregunta.
Desactivar pregunta.

Tipos de pregunta:

SI_NO
DESCRIPCION
NOMBRE_SOCIO
ESCALA_1_10

Al crear/editar pregunta:

Mostrar texto.
Tipo.
Orden.
Obligatoria.
Activa.

Si backend devuelve 409 por orden repetido, mostrar:

"Ya existe una pregunta con ese orden en esta área."

/gestion-clc/colaboradores

Gestión de colaboradores.

Debe permitir:

Filtrar por área.
Listar activos e inactivos.
Crear colaborador.
Editar nombre/apellido/área.
Activar/desactivar.
Mostrar badge activo/inactivo.
Componentes recomendados
Layouts
PublicLayout
AdminLayout
AuthLayout
UI base
Logo
Button
Input
Select
Textarea
Card
Badge
Spinner
EmptyState
ErrorState
ConfirmDialog
Pagination
Preguntas dinámicas
PreguntaSiNo
PreguntaDescripcion
PreguntaNombreSocio
PreguntaEscala
Dashboard
KpiCard
FiltersBar
ResumenCharts
EncuestasTable
ComentariosTable
ExportButton
Reglas UX
Mobile-first.
Formularios públicos deben ser rápidos y muy claros.
Botones grandes para móvil.
Admin debe ser sobrio, institucional y funcional.
No mostrar datos técnicos innecesarios al socio.
En admin sí se puede mostrar información detallada.
Mostrar loading states.
Mostrar empty states.
Manejar errores HTTP de forma entendible.
Autenticación frontend

Crear AuthProvider.

Debe exponer:

user
token
isAuthenticated
login(email, password)
logout()

Token:

Guardar en localStorage como clc_token.
Agregar a Axios con interceptor.
Si una respuesta devuelve 401, limpiar token y redirigir a /gestion-clc/login.

Decodificar JWT sin librería externa usando atob, validando expiración exp.

Axios

Archivo:

src/api/axios.ts

Debe:

Usar VITE_API_URL o fallback /api.
Agregar Authorization automáticamente si existe token.
Manejar 401.
Exportar instancia api.
React Query

Usar TanStack Query para:

áreas
área por slug
colaboradores
preguntas
resumen
encuestas paginadas

Invalidar queries después de crear/editar/desactivar.

Descarga Excel

Implementar función:

export async function descargarReporteExcel(filtros: ReporteFiltros)

Debe:

llamar /reportes/exportar
usar responseType: 'blob'
crear URL temporal
descargar archivo .xlsx
limpiar URL
Variables de entorno

Crear .env.example:

VITE_API_URL=http://localhost:3000/api
VITE_CLUB_URL=https://www.clublacampina.com.ec
Logo

Usar:

public/logo.png

Si no existe, dejar un placeholder elegante con texto "Club La Campiña" y no romper la app.

Criterios de calidad

Antes de terminar:

npm run build debe pasar.
No dejar imports rotos.
No dejar any innecesarios.
No hardcodear IDs.
No hardcodear áreas.
El formulario debe ser 100% dinámico.
Los filtros deben construir query params correctamente.
El Excel debe descargarse desde backend.
Las rutas privadas deben protegerse.
El token vencido debe cerrar sesión.