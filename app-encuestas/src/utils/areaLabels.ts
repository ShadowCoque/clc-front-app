// Abreviaturas legibles para los nombres de área usadas en gráficas y etiquetas.
// Agregar aquí nuevas abreviaturas de áreas si se crean más áreas.
const AREA_SHORT_NAMES: Record<string, string> = {
  'Alimentos y Bebidas': 'A&B',
  'Área Comercial': 'Comercial',
  'Area Comercial': 'Comercial',
  'Área de Socios': 'Socios',
  'Area de Socios': 'Socios',
  'Áreas Húmedas': 'Húmedas',
  'Areas Humedas': 'Húmedas',
  'Cafetería': 'Cafetería',
  'Cafeteria': 'Cafetería',
  'Pruebas Reportes': 'Pruebas',
};

export function getAreaShortName(areaName?: string | null): string {
  if (!areaName) return '';
  const trimmed = areaName.trim();
  if (AREA_SHORT_NAMES[trimmed]) return AREA_SHORT_NAMES[trimmed];

  const sinPrefijo = trimmed.replace(/^(Áreas?|Areas?)\s+/i, '').trim();
  if (sinPrefijo && sinPrefijo !== trimmed && sinPrefijo.length <= 14) {
    return sinPrefijo;
  }

  if (trimmed.length <= 14) return trimmed;

  const palabras = trimmed.split(/\s+/).filter(Boolean);
  if (palabras.length >= 2) return `${palabras[0]} ${palabras[1]}`.slice(0, 14);
  return trimmed.slice(0, 14);
}
