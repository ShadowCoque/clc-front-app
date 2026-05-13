interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = { sm: 'h-10', md: 'h-14', lg: 'h-20' };

export function Logo({ className = '', size = 'md' }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
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
      <div
        style={{ display: 'none' }}
        className="items-center justify-center bg-[#063E7B] text-white font-bold rounded-lg px-3 py-2 text-sm"
      >
        Club La Campiña
      </div>
    </div>
  );
}
