// Detecta si el texto de una pregunta pide el nombre del socio aunque el admin
// la haya creado con tipo DESCRIPCION en lugar de NOMBRE_SOCIO. Sin esta
// detección, la respuesta se guarda solo como texto y la encuesta queda "Anónimo".
export function esTextoNombreSocio(texto: string): boolean {
  const t = texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  if (!t.includes('nombre')) return false;
  // Preguntas sobre el nombre del colaborador/empleado no identifican al socio.
  if (t.includes('colaborador') || t.includes('empleado')) return false;
  return t.includes('socio') || t.includes('apellido') || t.includes('nombre completo');
}
