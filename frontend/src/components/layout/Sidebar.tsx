import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Briefcase,
  CheckSquare,
  FileText,
  DollarSign,
  UserCheck,
  FolderArchive,
  BarChart3,
  Settings,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Data Klien', href: '/clients', icon: Users },
    { name: 'Kalender & Jadwal', href: '/calendar', icon: Calendar },
    { name: 'Proyek & Booking', href: '/projects', icon: Briefcase },
    { name: 'Progres Pekerjaan', href: '/production', icon: CheckSquare },
    { name: 'Notulensi & Catatan', href: '/notes', icon: FileText },
    { name: 'Keuangan & Pembayaran', href: '/finance', icon: DollarSign },
    { name: 'Manajemen Tim', href: '/team', icon: UserCheck },
    { name: 'Dokumen & Hasil', href: '/documents', icon: FolderArchive },
    { name: 'Laporan & Analitik', href: '/reports', icon: BarChart3 },
    { name: 'Pengaturan', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-emerald-950 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-emerald-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-900/40">
              <Sparkles className="w-5 h-5 text-emerald-950 fill-emerald-950" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wider font-serif text-emerald-100">
                TUMATA
              </h1>
              <p className="text-[10px] tracking-widest uppercase text-emerald-400 font-semibold">
                Wedding Studio System
              </p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5 custom-scrollbar">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-emerald-400/70">
            Menu Utama
          </div>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/50 font-semibold'
                      : 'text-emerald-100/80 hover:bg-emerald-900/50 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 opacity-90" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-emerald-900/60 bg-emerald-950/80">
          <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-900/40 border border-emerald-800/40">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-emerald-100 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {user?.name?.[0] || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-emerald-100 truncate">{user?.name || 'Admin Studio'}</p>
                <p className="text-[10px] text-emerald-400 uppercase tracking-wide truncate capitalize">{user?.role || 'Admin'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Keluar"
              className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
