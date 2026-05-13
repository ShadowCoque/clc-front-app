import { type ReactNode } from 'react';
import { Logo } from '../components/Logo';

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#063E7B] via-[#0a5298] to-[#063E7B] flex flex-col">
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20 px-4 py-3">
        <div className="max-w-2xl mx-auto flex justify-center">
          <Logo size="sm" />
        </div>
      </header>
      <main className="flex-1 flex flex-col">{children}</main>
      <footer className="py-4 text-center text-white/40 text-xs">
        &copy; {new Date().getFullYear()} Club Social y Deportivo La Campiña
      </footer>
    </div>
  );
}
