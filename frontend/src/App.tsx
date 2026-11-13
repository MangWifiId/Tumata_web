import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { Calendar } from './pages/Calendar';
import { Production } from './pages/Production';
import { MeetingNotes } from './pages/MeetingNotes';
import { Finance } from './pages/Finance';
import { Team } from './pages/Team';
import { Accounts } from './pages/Accounts';
import { Documents } from './pages/Documents';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const getPageTitle = (path: string) => {
    if (path === '/') return { title: 'Dashboard', subtitle: 'Ikhtisar aktivitas dan performa studio pernikahan' };
    if (path.startsWith('/clients')) return { title: 'Data Klien', subtitle: 'Daftar calon pengantin dan riwayat dokumen' };
    if (path === '/calendar') return { title: 'Kalender & Jadwal', subtitle: 'Agenda akad, resepsi, meeting, dan deteksi bentrok' };
    if (path.startsWith('/projects/')) return { title: 'Detail Proyek & Booking', subtitle: 'Pusat komando dan manajemen tahapan acara' };
    if (path === '/projects') return { title: 'Proyek & Booking', subtitle: 'Pipeline acara dan status konfirmasi tanggal' };
    if (path === '/production') return { title: 'Progres Pekerjaan', subtitle: '10 Tahapan pengerjaan dokumentasi kreatif' };
    if (path === '/notes') return { title: 'Notulensi & Catatan', subtitle: 'Hasil rapat, permintaan khusus klien, dan action items' };
    if (path === '/finance') return { title: 'Keuangan & Pembayaran', subtitle: 'Manajemen invoice, kwitansi sah, dan pengeluaran' };
    if (path === '/team') return { title: 'Manajemen Tim', subtitle: 'Anggota fotografer, videografer, editor, dan jadwal ketersediaan' };
    if (path === '/accounts') return { title: 'Daftar Akun', subtitle: 'Kelola akun pengguna, peran, dan kata sandi sistem' };
    if (path === '/documents') return { title: 'Dokumen & Hasil', subtitle: 'Arsip PDF resmi (Penawaran, Invoice, Kwitansi, Kontrak)' };
    if (path === '/reports') return { title: 'Laporan & Analitik', subtitle: 'Laba rugi, arus kas terverifikasi, dan metrik bisnis' };
    if (path === '/settings') return { title: 'Pengaturan Studio', subtitle: 'Profil studio, rekening bank, penandatangan, dan template syarat' };
    return { title: 'TUMATA', subtitle: 'Wedding Studio Management' };
  };

  const { title, subtitle } = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title={title}
          subtitle={subtitle}
        />
        <main className="flex-1 pb-16">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/production" element={<Production />} />
            <Route path="/notes" element={<MeetingNotes />} />
            <Route path="/finance" element={isAdmin ? <Finance /> : <Navigate to="/" replace />} />
            <Route path="/team" element={<Team />} />
            <Route path="/accounts" element={isAdmin ? <Accounts /> : <Navigate to="/" replace />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/reports" element={isAdmin ? <Reports /> : <Navigate to="/" replace />} />
            <Route path="/settings" element={isAdmin ? <Settings /> : <Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
