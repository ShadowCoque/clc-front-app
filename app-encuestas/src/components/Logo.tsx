interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  /**
   * 'onDark': logo en blanco puro para fondos azul institucional.
   * 'plain': logo con sus colores originales (fondos claros).
   */
  variant?: 'onDark' | 'plain';
}

const sizeClasses = { sm: 'h-9', md: 'h-12', lg: 'h-16' };

export function Logo({ className = '', size = 'md', variant = 'onDark' }: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <img
        src="/logo.png"
        alt="Club La Campiña"
        className={`${sizeClasses[size]} w-auto object-contain`}
        style={variant === 'onDark' ? { filter: 'brightness(0) invert(1) drop-shadow(0 20px 60px red)' } : undefined}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
          const next = (e.target as HTMLImageElement).nextSibling as HTMLElement;
          if (next) next.style.display = 'flex';
        }}
      />
      <span
        style={{ display: 'none' }}
        className={`items-center justify-center font-bold text-sm tracking-tight ${
          variant === 'onDark' ? 'text-white' : 'text-[#063E7B]'
        }`}
      >
        Club La Campiña
      </span>
    </div>
  );
}
