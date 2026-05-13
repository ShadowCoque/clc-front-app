import { type ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboardIcon, BuildingIcon, UsersIcon,
  LogOutIcon, MenuIcon,
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { useAuth } from '../hooks/useAuth';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { to: '/gestion-clc/dashboard', icon: LayoutDashboardIcon, label: 'Dashboard' },
  { to: '/gestion-clc/areas', icon: BuildingIcon, label: 'Áreas y Preguntas' },
  { to: '/gestion-clc/colaboradores', icon: UsersIcon, label: 'Colaboradores' },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/gestion-clc/login');
  }

  const Sidebar = () => (
    <nav className="flex flex-col h-full">
      <div className="p-5 border-b border-white/10">
        <Logo size="sm" />
      </div>
      <div className="flex-1 py-4 px-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </div>
      <div className="p-4 border-t border-white/10">
        {user && (
          <p className="text-white/50 text-xs mb-3 truncate">{user.email}</p>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors w-full"
        >
          <LogOutIcon className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </nav>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar escritorio */}
      <aside className="hidden md:flex flex-col w-60 bg-[#063E7B] flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Sidebar móvil */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-60 bg-[#063E7B] z-50">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar móvil */}
        <header className="md:hidden flex items-center gap-3 bg-white border-b border-[#C2CFDB] px-4 py-3">
          <button onClick={() => setMobileOpen(true)} className="text-[#063E7B]">
            <MenuIcon className="w-5 h-5" />
          </button>
          <Logo size="sm" />
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
