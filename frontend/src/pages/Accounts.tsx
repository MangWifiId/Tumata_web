import React, { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Plus,
  Mail,
  Phone,
  Search,
  Pencil,
  KeyRound,
  Trash2,
  ShieldCheck,
  Shield,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../services/api';
import { User, UserRole } from '../types';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin Studio',
  pemilik: 'Pemilik (Owner)',
  fotografer: 'Fotografer',
  videografer: 'Videografer',
  'editor foto': 'Editor Foto',
  'editor video': 'Editor Video',
  koordinator: 'Koordinator Acara',
};

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Admin Studio' },
  { value: 'pemilik', label: 'Pemilik (Owner)' },
  { value: 'fotografer', label: 'Fotografer' },
  { value: 'videografer', label: 'Videografer' },
  { value: 'editor foto', label: 'Editor Foto' },
  { value: 'editor video', label: 'Editor Video' },
  { value: 'koordinator', label: 'Koordinator Acara' },
];

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'fotografer' as UserRole,
  phone: '',
};

export const Accounts: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Create / edit modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Reset password modal
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const data = await api.getUsers();
      setUsers(data);
    } catch (err: any) {
      setLoadError(err.message || 'Gagal memuat daftar akun');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone || '').toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [users, search]);

  const adminCount = useMemo(
    () => users.filter((u) => u.role === 'admin' || u.role === 'pemilik').length,
    [users]
  );

  const openCreate = () => {
    setEditingUser(null);
    setFormData({ ...emptyForm });
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
      phone: u.phone || '',
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!editingUser && formData.password.length < 6) {
      setFormError('Kata sandi minimal 6 karakter');
      return;
    }

    try {
      setSaving(true);
      if (editingUser) {
        await api.updateUser(editingUser.id, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          phone: formData.phone,
        });
        setToast('Akun berhasil diperbarui');
      } else {
        await api.createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          phone: formData.phone,
        });
        setToast('Akun baru berhasil dibuat');
      }
      setIsFormOpen(false);
      loadUsers();
    } catch (err: any) {
      setFormError(err.message || 'Gagal menyimpan akun');
    } finally {
      setSaving(false);
    }
  };

  const openReset = (u: User) => {
    setResetTarget(u);
    setNewPassword('');
    setResetError(null);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    setResetError(null);

    if (newPassword.length < 6) {
      setResetError('Kata sandi baru minimal 6 karakter');
      return;
    }

    try {
      setResetting(true);
      await api.resetUserPassword(resetTarget.id, newPassword);
      setToast(`Kata sandi ${resetTarget.name} berhasil direset`);
      setResetTarget(null);
    } catch (err: any) {
      setResetError(err.message || 'Gagal mereset kata sandi');
    } finally {
      setResetting(false);
    }
  };

  const openDelete = (u: User) => {
    setDeleteTarget(u);
    setDeleteError(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    try {
      setDeleting(true);
      await api.deleteUser(deleteTarget.id);
      setToast(`Akun ${deleteTarget.name} berhasil dihapus`);
      setDeleteTarget(null);
      loadUsers();
    } catch (err: any) {
      setDeleteError(err.message || 'Gagal menghapus akun');
    } finally {
      setDeleting(false);
    }
  };

  const isSelf = (u: User) => currentUser?.id === u.id;
  const isAdminUser = (u: User) => u.role === 'admin' || u.role === 'pemilik';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-700 text-white text-xs font-semibold shadow-xl">
          <CheckCircle2 className="w-4 h-4" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Daftar Akun</h2>
          <p className="text-xs text-slate-500">
            Kelola akun pengguna yang bisa masuk ke sistem. Hanya berisi data akun asli studio.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Akun</span>
        </button>
      </div>

      {/* Summary + search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 font-semibold">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            {loading ? 'Memuat...' : `${users.length} Akun`}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            {loading ? 'Memuat...' : `${adminCount} Admin / Pemilik`}
          </span>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, email, atau peran..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
          />
        </div>
      </div>

      {/* Load error */}
      {loadError && !loading && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {loadError}
          </span>
          <button
            onClick={loadUsers}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold self-start sm:self-auto"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Account list */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-3 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-xs text-slate-400">Memuat daftar akun...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-700 text-sm">
            {users.length === 0 ? 'Belum ada akun' : 'Akun tidak ditemukan'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {users.length === 0
              ? 'Tambahkan akun pertama untuk mulai menggunakan sistem.'
              : 'Coba kata kunci pencarian lain.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-500 text-white flex items-center justify-center font-bold text-base shadow-md shadow-emerald-900/20 shrink-0">
                      {u.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-slate-900 text-sm truncate">{u.name}</h3>
                        {isSelf(u) && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[9px] font-semibold shrink-0">
                            Anda
                          </span>
                        )}
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold text-[10px] mt-0.5 border ${
                          isAdminUser(u)
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200/60'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {isAdminUser(u) ? (
                          <ShieldCheck className="w-3 h-3" />
                        ) : (
                          <Shield className="w-3 h-3" />
                        )}
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{u.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{u.phone || <span className="text-slate-400 italic">Belum diisi</span>}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-1.5">
                <button
                  onClick={() => openEdit(u)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-emerald-700 text-[11px] font-semibold flex items-center gap-1 transition"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => openReset(u)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-amber-700 text-[11px] font-semibold flex items-center gap-1 transition"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Reset Sandi
                </button>
                <button
                  onClick={() => openDelete(u)}
                  disabled={isSelf(u)}
                  title={isSelf(u) ? 'Tidak dapat menghapus akun yang sedang dipakai' : 'Hapus akun'}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-[11px] font-semibold flex items-center gap-1 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingUser ? 'Edit Akun' : 'Tambah Akun Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

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
              placeholder="nama@tumata.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {!editingUser && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kata Sandi Awal *</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Peran (Role) *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
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
          </div>

          {editingUser && (
            <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              Untuk mengganti kata sandi akun ini, gunakan tombol <strong>Reset Sandi</strong> pada kartu akun.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold disabled:opacity-60"
            >
              {saving ? 'Menyimpan...' : editingUser ? 'Simpan Perubahan' : 'Buat Akun'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={!!resetTarget}
        onClose={() => setResetTarget(null)}
        title="Reset Kata Sandi"
        maxWidth="md"
      >
        <form onSubmit={handleReset} className="space-y-4 text-xs">
          {resetError && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{resetError}</span>
            </div>
          )}

          <div className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <p className="font-semibold text-slate-800">{resetTarget?.name}</p>
            <p className="text-slate-500">{resetTarget?.email}</p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Kata Sandi Baru *</label>
            <input
              type="password"
              required
              minLength={6}
              autoFocus
              placeholder="Minimal 6 karakter"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setResetTarget(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={resetting}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold disabled:opacity-60"
            >
              {resetting ? 'Menyimpan...' : 'Reset Sandi'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Akun"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          {deleteError && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{deleteError}</span>
            </div>
          )}

          <div className="flex items-start gap-3 px-3 py-3 rounded-xl bg-rose-50 border border-rose-200">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-rose-800">
              <p className="font-semibold">
                Hapus akun {deleteTarget?.name}?
              </p>
              <p className="mt-1 text-rose-700">
                Akun akan dihapus permanen dan tidak bisa login lagi. Data proyek, tugas, dan catatan
                yang terkait akan dilepas, bukan dihapus.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold disabled:opacity-60"
            >
              {deleting ? 'Menghapus...' : 'Ya, Hapus Akun'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
