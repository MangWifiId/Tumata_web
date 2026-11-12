import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  title,
  subtitle,
  actions,
}) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
          </div>
        </div>

        {/* Right: Actions, Notifications & User Info */}
        <div className="flex items-center gap-3">
          {actions && <div className="flex items-center gap-2">{actions}</div>}

          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
            <button
              title="Notifikasi"
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 relative transition"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            </button>
            <div className="text-right">
              <span className="block text-xs font-semibold text-slate-800 leading-tight">
                {user?.name || 'Admin'}
              </span>
              <span className="block text-[10px] text-emerald-700 font-medium capitalize">
                {user?.role || 'Pengelola'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
