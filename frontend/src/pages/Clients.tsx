import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Share2,
  FolderOpen,
  Edit2,
  Trash2,
} from 'lucide-react';
import { api, formatDate } from '../services/api';
import { Client, ClientSource } from '../types';
import { Modal } from '../components/common/Modal';

export const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    bride_name: '',
    groom_name: '',
    whatsapp: '',
    email: '',
    address: '',
    instagram: '',
    source: 'Instagram' as ClientSource,
    notes: '',
    special_requests: '',
  });

  useEffect(() => {
    loadClients();
  }, [search]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await api.getClients(search);
      setClients(data);
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      bride_name: '',
      groom_name: '',
      whatsapp: '',
      email: '',
      address: '',
      instagram: '',
      source: 'Instagram',
      notes: '',
      special_requests: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Client) => {
    setEditingClient(c);
    setFormData({
      name: c.name,
      bride_name: c.bride_name || '',
      groom_name: c.groom_name || '',
      whatsapp: c.whatsapp,
      email: c.email || '',
      address: c.address || '',
      instagram: c.instagram || '',
      source: c.source,
      notes: c.notes || '',
      special_requests: c.special_requests || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await api.updateClient(editingClient.id, formData);
      } else {
        await api.createClient(formData);
      }
      setIsModalOpen(false);
      loadClients();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan data klien');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus data klien ini beserta riwayatnya?')) {
      try {
        await api.deleteClient(id);
        loadClients();
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus klien');
      }
    }
  };

  const handleViewDetail = async (c: Client) => {
    try {
      const full = await api.getClient(c.id);
      setSelectedClient(full);
      setIsDetailOpen(true);
    } catch (err) {
      setSelectedClient(c);
      setIsDetailOpen(true);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Data Klien & Pasangan</h2>
          <p className="text-xs text-slate-500">
            Kelola kontak calon pengantin, riwayat proyek, dan preferensi dokumentasi
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama, WhatsApp..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48 sm:w-64"
            />
          </div>
          <button
            onClick={handleOpenCreate}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Klien</span>
          </button>
        </div>
      </div>

      {/* Clients Table / Cards Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mx-auto" />
          </div>
        ) : clients.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p>Belum ada data klien yang terdaftar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Nama Pasangan</th>
                  <th className="py-3.5 px-4">Kontak WhatsApp</th>
                  <th className="py-3.5 px-4">Sumber Calon</th>
                  <th className="py-3.5 px-4">Proyek Terkait</th>
                  <th className="py-3.5 px-4">Terdaftar</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{c.name}</div>
                      {(c.bride_name || c.groom_name) && (
                        <div className="text-[11px] text-slate-500">
                          👰 {c.bride_name || '-'} & 🤵 {c.groom_name || '-'}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <a
                        href={`https://wa.me/${c.whatsapp}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{c.whatsapp}</span>
                      </a>
                      {c.email && (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>{c.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[10px]">
                        {c.source}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {c.projects && c.projects.length > 0 ? (
                        <span className="font-semibold text-emerald-800">
                          {c.projects.length} Proyek
                        </span>
                      ) : (
                        <span className="text-slate-400">Belum ada</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{formatDate(c.created_at)}</td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleViewDetail(c)}
                        title="Lihat Detail Riwayat"
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                      >
                        <FolderOpen className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(c)}
                        title="Edit Data Klien"
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        title="Hapus Klien"
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Client Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClient ? 'Edit Data Klien' : 'Tambah Klien Baru'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Pasangan / Identitas Proyek *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Raditya & Jessica"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Pengantin Wanita (Bride)
              </label>
              <input
                type="text"
                placeholder="Nama mempelai wanita"
                value={formData.bride_name}
                onChange={(e) => setFormData({ ...formData, bride_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Pengantin Pria (Groom)
              </label>
              <input
                type="text"
                placeholder="Nama mempelai pria"
                value={formData.groom_name}
                onChange={(e) => setFormData({ ...formData, groom_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor WhatsApp *
              </label>
              <input
                type="text"
                required
                placeholder="62812xxxxxxx atau 0812xxxxxxx"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="client@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Akun Instagram Klien
              </label>
              <input
                type="text"
                placeholder="@username"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sumber Calon Pelanggan
              </label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value as ClientSource })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="Rekomendasi">Rekomendasi / Teman</option>
                <option value="Walk-in">Walk-in Studio</option>
                <option value="Website">Website</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Klien
              </label>
              <textarea
                rows={2}
                placeholder="Alamat domisili atau pengiriman hasil album..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Permintaan Khusus & Konsep
              </label>
              <textarea
                rows={2}
                placeholder="Catatan permintaan warna tone, konsep foto, keluarga VIP, dll..."
                value={formData.special_requests}
                onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
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
              Simpan Data Klien
            </button>
          </div>
        </form>
      </Modal>

      {/* Client Detail & History Drawer */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`Profil & Riwayat: ${selectedClient?.name || ''}`}
        maxWidth="3xl"
      >
        {selectedClient && (
          <div className="space-y-6 text-xs">
            {/* Identity Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 font-medium block">Pengantin Wanita & Pria</span>
                <span className="font-bold text-slate-800 text-sm">
                  {selectedClient.bride_name || '-'} & {selectedClient.groom_name || '-'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">WhatsApp</span>
                <a
                  href={`https://wa.me/${selectedClient.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-emerald-700 hover:underline"
                >
                  {selectedClient.whatsapp}
                </a>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Instagram</span>
                <span className="font-semibold text-slate-700">{selectedClient.instagram || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Alamat</span>
                <span className="font-medium text-slate-700">{selectedClient.address || '-'}</span>
              </div>
              <div className="sm:col-span-2 pt-2 border-t border-slate-200/60">
                <span className="text-slate-400 font-medium block">Catatan / Permintaan Khusus</span>
                <p className="font-medium text-slate-800 mt-0.5">{selectedClient.special_requests || 'Tidak ada catatan khusus.'}</p>
              </div>
            </div>

            {/* Projects History */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Riwayat Proyek & Booking
              </h4>
              {selectedClient.projects && selectedClient.projects.length > 0 ? (
                <div className="space-y-2">
                  {selectedClient.projects.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl border border-slate-200 flex items-center justify-between bg-white"
                    >
                      <div>
                        <div className="font-bold text-slate-800">{p.project_number}</div>
                        <div className="text-[11px] text-slate-500">
                          {p.package?.name || 'Paket Kustom'} | {formatDate(p.event_date)}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                          {p.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">Belum ada proyek yang terkait dengan klien ini.</p>
              )}
            </div>

            {/* Documents History */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Arsip Dokumen PDF Klien
              </h4>
              {selectedClient.documents && selectedClient.documents.length > 0 ? (
                <div className="space-y-2">
                  {selectedClient.documents.map((d) => (
                    <div
                      key={d.id}
                      className="p-3 rounded-xl border border-slate-200 flex items-center justify-between bg-white"
                    >
                      <div>
                        <span className="font-bold text-slate-800 uppercase">{d.doc_type}</span> —{' '}
                        <span className="text-slate-600">{d.document_number}</span>
                        <div className="text-[11px] text-slate-400">Diterbitkan: {formatDate(d.created_at)}</div>
                      </div>
                      <a
                        href={`/api/documents/${d.id}/download`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-[11px] hover:bg-emerald-100 transition"
                      >
                        Buka PDF
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">Belum ada dokumen PDF yang diterbitkan untuk klien ini.</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
