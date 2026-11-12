import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Send,
  Sparkles,
} from 'lucide-react';
import { api, formatRupiah, formatDate, formatDateTime } from '../services/api';
import { DashboardMetrics } from '../types';
import { ProjectStatusBadge, TaskStatusBadge } from '../components/common/Badge';

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-3 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Welcome */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/60 border border-emerald-700/50 text-emerald-200 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Wedding Studio Management</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-white">
              Studio Overview & Aktivitas
            </h2>
            <p className="text-sm text-emerald-200/80 mt-1 max-w-xl">
              Pantau jadwal pernikahan, progres editing foto/video, tagihan termin, dan status tim secara terpusat.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/projects"
              className="px-4 py-2.5 rounded-xl bg-white text-emerald-950 font-semibold text-xs hover:bg-emerald-50 shadow-md transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Booking Baru</span>
            </Link>
            <Link
              to="/calendar"
              className="px-4 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-white font-medium text-xs border border-emerald-700/60 transition flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Lihat Kalender</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Proyek Bulan Ini */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Proyek Bulan Ini
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {metrics?.projects_this_month || 0}
            </span>
            <span className="text-xs text-slate-500">proyek baru</span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{metrics?.ongoing_projects_count || 0} proyek sedang aktif</span>
          </div>
        </div>

        {/* Card 2: Pembayaran Diterima */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pembayaran Diterima
            </span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900">
              {formatRupiah(metrics?.total_payments_received)}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Piutang: <span className="font-semibold text-amber-700">{formatRupiah(metrics?.total_receivable)}</span>
          </div>
        </div>

        {/* Card 3: Total Pengeluaran & Laba */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Laba Bersih Terverifikasi
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-xl font-bold text-emerald-700">
              {formatRupiah(metrics?.net_profit)}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Pengeluaran: <span className="font-semibold text-rose-600">{formatRupiah(metrics?.total_expenses)}</span>
          </div>
        </div>

        {/* Card 4: Tugas Tim Belum Selesai */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tugas & Produksi
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {metrics?.unfinished_tasks_count || 0}
            </span>
            <span className="text-xs text-slate-500">tahap belum selesai</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            {metrics?.overdue_projects_count ? (
              <span className="text-rose-600 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {metrics.overdue_projects_count} lewat deadline
              </span>
            ) : (
              <span className="text-emerald-600 font-medium">Semua timeline terkontrol</span>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Upcoming Schedules & Unpaid Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Jadwal Acara Terdekat */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Jadwal Acara Terdekat</h3>
                <p className="text-xs text-slate-500">Akad, Resepsi, Prewedding, & Meeting</p>
              </div>
            </div>
            <Link
              to="/calendar"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Semua Acara</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {metrics?.upcoming_events && metrics.upcoming_events.length > 0 ? (
              metrics.upcoming_events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-emerald-200 bg-slate-50/50 hover:bg-emerald-50/30 transition flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                        {ev.event_type}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800">{ev.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      {ev.project?.client?.name || 'Klien'} ({ev.project?.project_number})
                    </p>
                    <p className="text-[11px] text-slate-400">
                      📍 {ev.location || 'Lokasi belum ditentukan'}
                    </p>
                    {ev.conflict_warning && (
                      <div className="text-[10px] text-rose-600 font-semibold flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Deteksi bentrok jadwal terdeteksi!</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="block text-xs font-semibold text-slate-800">
                      {formatDateTime(ev.start_time)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                Belum ada jadwal acara terdekat.
              </div>
            )}
          </div>
        </div>

        {/* Right: Tagihan Belum Lunas */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Tagihan Belum Lunas</h3>
                <p className="text-xs text-slate-500">Invoice DP, Cicilan, atau Pelunasan</p>
              </div>
            </div>
            <Link
              to="/finance"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Kelola Keuangan</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {metrics?.unpaid_invoices && metrics.unpaid_invoices.length > 0 ? (
              metrics.unpaid_invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-amber-200 bg-slate-50/50 hover:bg-amber-50/30 transition flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{inv.invoice_number}</span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-semibold">
                        Sisa {formatRupiah(inv.remaining_amount)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      {inv.project?.client?.name || 'Klien'} ({inv.project?.project_number})
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Jatuh Tempo: {formatDate(inv.due_date)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <Link
                      to="/documents"
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold inline-flex items-center gap-1.5 transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                Semua invoice telah terlunasi!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ongoing Projects and Production Pipelines */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Proyek Berjalan & Progres</h3>
            <p className="text-xs text-slate-500">Pantau tahap pengerjaan setiap klien pengantin</p>
          </div>
          <Link
            to="/projects"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Semua Proyek</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-semibold">No. Proyek</th>
                <th className="pb-3 font-semibold">Klien Pengantin</th>
                <th className="pb-3 font-semibold">Paket Layanan</th>
                <th className="pb-3 font-semibold">Tanggal Acara</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Nilai Kontrak</th>
                <th className="pb-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics?.active_projects && metrics.active_projects.length > 0 ? (
                metrics.active_projects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 font-semibold text-slate-800">{p.project_number}</td>
                    <td className="py-3">
                      <span className="font-semibold text-slate-800">{p.client?.name}</span>
                      {p.venue_name && (
                        <span className="block text-[11px] text-slate-400">📍 {p.venue_name}</span>
                      )}
                    </td>
                    <td className="py-3 text-slate-600">{p.package?.name || 'Kustom'}</td>
                    <td className="py-3 text-slate-600">{formatDate(p.event_date)}</td>
                    <td className="py-3">
                      <ProjectStatusBadge status={p.status} />
                    </td>
                    <td className="py-3 font-semibold text-slate-800">
                      {formatRupiah(p.contract_value)}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/projects/${p.id}`}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    Tidak ada proyek aktif saat ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Tasks Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Tugas Tim Mendekati Deadline</h3>
            <p className="text-xs text-slate-500">10 Tahapan alur produksi studio</p>
          </div>
          <Link
            to="/production"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Buka Kanban Produksi</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {metrics?.pending_tasks && metrics.pending_tasks.length > 0 ? (
            metrics.pending_tasks.map((task) => (
              <div
                key={task.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-emerald-200 transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                    Tahap {task.stage}
                  </span>
                  <TaskStatusBadge status={task.status} />
                </div>
                <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{task.title}</h4>
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                  <span>PIC: {task.assignee?.name || 'Studio'}</span>
                  <span className="font-medium text-slate-700">{formatDate(task.deadline)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-6 text-center text-xs text-slate-400">
              Tidak ada tugas yang menunggu saat ini.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
