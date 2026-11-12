import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Search,
  Plus,
  Calendar,
  DollarSign,
  TrendingUp,
  MapPin,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { api, formatRupiah, formatDate } from '../services/api';
import { Project, ProjectStatus, Client, Package, User } from '../types';
import { ProjectStatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  // New Project Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    client_id: 0,
    package_id: undefined as number | undefined,
    contract_value: 0,
    status: 'Lead' as ProjectStatus,
    event_date: '',
    event_start_time: '08:00',
    event_end_time: '14:00',
    venue_name: '',
    venue_address: '',
    pic_id: undefined as number | undefined,
    notes: '',
    special_requests: '',
  });

  const statuses: ProjectStatus[] = [
    'Lead',
    'Penawaran',
    'Menunggu DP',
    'Booked',
    'Persiapan',
    'Berlangsung',
    'Editing',
    'Review/Revisi',
    'Selesai',
    'Diarsipkan',
  ];

  useEffect(() => {
    loadProjects();
  }, [statusFilter, search]);

  useEffect(() => {
    loadDropdowns();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await api.getProjects({
        status: statusFilter || undefined,
        search: search || undefined,
      });
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDropdowns = async () => {
    try {
      const [cData, pData, uData] = await Promise.all([
        api.getClients(),
        api.getPackages(),
        api.getUsers(),
      ]);
      setClients(cData);
      setPackages(pData);
      setUsers(uData);
    } catch (err) {
      console.error('Failed to load dropdowns:', err);
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      client_id: clients[0]?.id || 0,
      package_id: packages[0]?.id,
      contract_value: packages[0]?.price || 0,
      status: 'Lead',
      event_date: '',
      event_start_time: '08:00',
      event_end_time: '14:00',
      venue_name: '',
      venue_address: '',
      pic_id: users[0]?.id,
      notes: '',
      special_requests: '',
    });
    setIsModalOpen(true);
  };

  const handlePackageChange = (pkgIdStr: string) => {
    const pkgId = pkgIdStr ? Number(pkgIdStr) : undefined;
    const selectedPkg = packages.find((p) => p.id === pkgId);
    setFormData({
      ...formData,
      package_id: pkgId,
      contract_value: selectedPkg ? selectedPkg.price : formData.contract_value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_id) {
      alert('Pilih klien terlebih dahulu');
      return;
    }
    try {
      const payload: any = {
        ...formData,
        event_date: formData.event_date ? new Date(formData.event_date).toISOString() : null,
      };
      await api.createProject(payload);
      setIsModalOpen(false);
      loadProjects();
    } catch (err: any) {
      alert(err.message || 'Gagal membuat proyek');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Proyek & Booking</h2>
          <p className="text-xs text-slate-500">
            Kelola alur pipeline pernikahan, status kontrak, jadwal, dan progres pengerjaan
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari no. proyek, klien, venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48 sm:w-60"
            />
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Booking Baru</span>
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 custom-scrollbar text-xs">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition shrink-0 ${
            statusFilter === ''
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Semua Proyek
        </button>
        {statuses.map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl font-medium transition shrink-0 ${
              statusFilter === st
                ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Projects List Grid */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-3 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mx-auto" />
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
          <Briefcase className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p>Belum ada proyek yang sesuai dengan kriteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Header: Project Number & Status */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    {p.project_number}
                  </span>
                  <ProjectStatusBadge status={p.status} />
                </div>

                {/* Client & Venue */}
                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                  {p.client?.name || 'Klien'}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {p.package?.name || 'Paket Kustom'}
                </p>

                {p.venue_name && (
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-2.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{p.venue_name}</span>
                  </div>
                )}

                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {p.event_date ? formatDate(p.event_date) : 'Tanggal belum diatur'}
                    {p.event_start_time && ` (${p.event_start_time} - ${p.event_end_time || ''})`}
                  </span>
                </div>

                {/* Financial Summary */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Nilai Kontrak</span>
                    <span className="font-bold text-slate-800">
                      {formatRupiah(p.contract_value)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Sisa Tagihan</span>
                    <span className={`font-bold ${p.remaining_amount ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {formatRupiah(p.remaining_amount)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium mb-1">
                    <span>Progres Produksi</span>
                    <span>{p.progress_percent || 0}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                      style={{ width: `${p.progress_percent || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  PIC: <strong className="text-slate-700">{p.pic?.name || 'Studio'}</strong>
                </span>
                <Link
                  to={`/projects/${p.id}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-semibold text-xs flex items-center gap-1 transition"
                >
                  <span>Kelola Proyek</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Project / Booking Wizard Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Buat Proyek / Booking Baru"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pilih Klien / Pasangan *
              </label>
              <select
                required
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.whatsapp})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Paket Layanan
              </label>
              <select
                value={formData.package_id || ''}
                onChange={(e) => handlePackageChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="">Paket Kustom (Atur Harga Manual)</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} — {formatRupiah(pkg.price)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nilai Kontrak (Rp) *
              </label>
              <input
                type="number"
                required
                value={formData.contract_value}
                onChange={(e) => setFormData({ ...formData, contract_value: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Proyek Awal
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {statuses.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Penanggung Jawab (PIC)
              </label>
              <select
                value={formData.pic_id || ''}
                onChange={(e) => setFormData({ ...formData, pic_id: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="">Pilih Anggota Tim</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Acara
              </label>
              <input
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jam Mulai</label>
                <input
                  type="time"
                  value={formData.event_start_time}
                  onChange={(e) => setFormData({ ...formData, event_start_time: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jam Selesai</label>
                <input
                  type="time"
                  value={formData.event_end_time}
                  onChange={(e) => setFormData({ ...formData, event_end_time: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Venue / Gedung
              </label>
              <input
                type="text"
                placeholder="Contoh: The Manor Andara / Ballroom Hotel Mulia"
                value={formData.venue_name}
                onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan & Permintaan Khusus
              </label>
              <textarea
                rows={2}
                placeholder="Catatan rundown, dresscode tim dokumentasi, dll..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs"
            >
              Simpan & Buat 10 Tahapan Produksi
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
