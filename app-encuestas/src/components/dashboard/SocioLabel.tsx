// Muestra el nombre del socio distinguiendo visualmente las encuestas anónimas,
// para que en el panel no se confundan con nombres reales.
export function SocioLabel({ nombre }: { nombre?: string | null }) {
  if (!nombre || !nombre.trim()) return <span className="text-gray-300">—</span>;
  const normalizado = nombre.trim().toLowerCase();
  if (normalizado === 'anónimo' || normalizado === 'anonimo') {
    return <span className="italic text-gray-400">Anónimo</span>;
  }
  return <>{nombre}</>;
}
