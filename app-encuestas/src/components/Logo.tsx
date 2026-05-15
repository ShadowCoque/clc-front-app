interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  /**
   * En fondos oscuros del mismo azul institucional el logo se confunde con el fondo,
   * por eso lo envolvemos en un "chip" claro con sombra suave.
   */
  variant?: 'onDark' | 'plain';
}

const sizeClasses = { sm: 'h-9', md: 'h-12', lg: 'h-16' };
const wrapperPad = { sm: 'px-3 py-1.5', md: 'px-4 py-2', lg: 'px-5 py-2.5' };

export function Logo({ className = '', size = 'md', variant = 'onDark' }: LogoProps) {
  const img = (
    <>
      <img
        src="/logo.png"
        alt="Club La Campiña"
        className={`${sizeClasses[size]} w-auto object-contain`}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
          const next = (e.target as HTMLImageElement).nextSibling as HTMLElement;
          if (next) next.style.display = 'flex';
        }}
      />
      <span
        style={{ display: 'none' }}
        className="items-center justify-center text-[#063E7B] font-bold text-sm tracking-tight"
      >
        Club La Campiña
      </span>
    </>
  );

  if (variant === 'plain') {
    return <div className={`flex items-center gap-3 ${className}`}>{img}</div>;
  }

  return (
    <div className={`inline-flex items-center ${className}`}>
      <div
        className={`inline-flex items-center gap-2 rounded-xl bg-white shadow-sm ring-1 ring-white/40 ${wrapperPad[size]}`}
      >
        {img}
      </div>
    </div>
  );
}
