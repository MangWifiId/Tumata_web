import React, { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  Mail,
  Phone,
  Briefcase,
  CheckCircle2,
  Clock,
  Shield,
  Camera,
  Video,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { User, UserRole } from '../types';
import { Modal } from '../components/common/Modal';

export const Team: React.FC = () => {
  const [teamStats, setTeamStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'fotografer' as UserRole,
    phone: '',
  });

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      setLoading(true);
      const data = await api.getTeamMembers();
      setTeamStats(data);
    } catch (err) {
      console.error('Failed to load team:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createUser(formData);
      setIsModalOpen(false);
      loadTeam();
    } catch (err: any) {
      alert(err.message || 'Gagal menambah anggota tim');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Manajemen Tim Studio</h2>
          <p className="text-xs text-slate-500">
            Daftar fotografer, videografer, editor foto/video, koordinator, dan pemilik studio
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              name: '',
              email: '',
              password: 'password123',
              role: 'fotografer',
              phone: '',
            });
            setIsModalOpen(true);
          }}
          className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Anggota Tim</span>
        </button>
      </div>

      {/* Team Cards Grid */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-3 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamStats.map((item) => {
            const u: User = item.user;
            return (
              <div
                key={u.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-500 text-white flex items-center justify-center font-bold text-base shadow-md shadow-emerald-900/20">
                        {u.name[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{u.name}</h3>
                        <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold text-[10px] capitalize mt-0.5 border border-emerald-200/60">
                          {u.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{u.email}</span>
                    </div>
                    {u.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{u.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Workload / Tasks Strip */}
                <div className="mt-5 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-800 text-sm block">
                      {item.assigned_projects || 0}
                    </span>
                    <span className="text-[10px] text-slate-400">Proyek</span>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-100 text-amber-800">
                    <span className="font-bold text-sm block">{item.pending_tasks || 0}</span>
                    <span className="text-[10px]">Tugas Aktif</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-800">
                    <span className="font-bold text-sm block">{item.completed_tasks || 0}</span>
                    <span className="text-[10px]">Selesai</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Member Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Anggota Tim Baru"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Budi Santoso"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Alamat Email *</label>
            <input
              type="email"
              required
              placeholder="budi@tumata.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kata Sandi Awal *</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Peran Tim (Role) *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="admin">Admin Studio</option>
                <option value="fotografer">Fotografer</option>
                <option value="videografer">Videografer</option>
                <option value="editor foto">Editor Foto</option>
                <option value="editor video">Editor Video</option>
                <option value="koordinator">Koordinator Acara</option>
                <option value="pemilik">Pemilik (Owner)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">No. WhatsApp / Telepon</label>
            <input
              type="text"
              placeholder="0812xxxxxxxx"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
            >
              Simpan Anggota Tim
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
