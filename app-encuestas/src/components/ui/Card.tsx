import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-[#C2CFDB] shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md hover:border-[#063E7B] transition-all' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
