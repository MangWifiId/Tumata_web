import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Calendar,
  Users,
  CheckSquare,
  Clock,
  Trash2,
} from 'lucide-react';
import { api, formatDate } from '../services/api';
import { MeetingNote, Project } from '../types';
import { Modal } from '../components/common/Modal';

export const MeetingNotes: React.FC = () => {
  const [notes, setNotes] = useState<MeetingNote[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    project_id: 0,
    meeting_date: new Date().toISOString().split('T')[0],
    participants: '',
    topic: '',
    special_requests: '',
    agreements: '',
    action_item: '',
  });

  useEffect(() => {
    loadNotes();
    loadProjects();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await api.getNotes();
      setNotes(data);
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
      if (data.length > 0) {
        setFormData((prev) => ({ ...prev, project_id: data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  const handleToggleAction = async (actionId: number) => {
    try {
      await api.toggleActionItem(actionId);
      loadNotes();
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui status checklist');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Hapus notulensi ini?')) {
      try {
        await api.deleteNote(id);
        loadNotes();
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.project_id) {
      alert('Pilih proyek terlebih dahulu');
      return;
    }
    try {
      await api.createNote({
        ...formData,
        meeting_date: new Date(formData.meeting_date).toISOString(),
        actions: formData.action_item ? [{ action_item: formData.action_item }] : [],
      });
      setIsModalOpen(false);
      loadNotes();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan notulensi');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Notulensi & Catatan Klien</h2>
          <p className="text-xs text-slate-500">
            Arsip kesepakatan technical meeting, rundown, dan tindak lanjut penugasan tim
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Notulensi</span>
        </button>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-3 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mx-auto" />
        </div>
      ) : notes.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
          <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p>Belum ada notulensi meeting yang dicatat.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4 text-xs"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{note.topic}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(note.meeting_date)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {note.participants}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-1 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Special requests & agreements */}
                <div className="space-y-2.5 mt-3">
                  {note.special_requests && (
                    <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60 text-slate-800">
                      <span className="font-bold text-amber-800 block text-[10px] uppercase">
                        Permintaan Khusus:
                      </span>
                      <p className="mt-0.5 text-[11px]">{note.special_requests}</p>
                    </div>
                  )}

                  {note.agreements && (
                    <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60 text-slate-800">
                      <span className="font-bold text-emerald-800 block text-[10px] uppercase">
                        Kesepakatan:
                      </span>
                      <p className="mt-0.5 text-[11px]">{note.agreements}</p>
                    </div>
                  )}
                </div>

                {/* Action Items Checklist */}
                {note.actions && note.actions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                    <span className="font-bold text-slate-700 block text-[10px] uppercase">
                      Tindak Lanjut (Checklist):
                    </span>
                    {note.actions.map((act) => (
                      <label
                        key={act.id}
                        className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition"
                      >
                        <input
                          type="checkbox"
                          checked={act.is_done}
                          onChange={() => handleToggleAction(act.id)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                        />
                        <span
                          className={`text-xs ${
                            act.is_done ? 'line-through text-slate-400 font-normal' : 'text-slate-800 font-medium'
                          }`}
                        >
                          {act.action_item}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer link to project */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Dicatat oleh: {note.created_by?.name || 'Studio'}
                </span>
                <Link
                  to={`/projects/${note.project_id}`}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-semibold text-[11px] transition"
                >
                  Buka Proyek
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Note Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Catat Notulensi Rapat Baru"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pilih Proyek *</label>
            <select
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_number} — {p.client?.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Topik Rapat *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Technical Meeting Rundown Hari H"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Rapat *</label>
              <input
                type="date"
                required
                value={formData.meeting_date}
                onChange={(e) => setFormData({ ...formData, meeting_date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Peserta Hadir</label>
              <input
                type="text"
                placeholder="Pengantin, Studio PIC, WO"
                value={formData.participants}
                onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Permintaan Khusus Klien</label>
            <textarea
              rows={2}
              placeholder="Permintaan angle foto, momen wajib, list foto keluarga..."
              value={formData.special_requests}
              onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Keputusan yang Disepakati</label>
            <textarea
              rows={2}
              placeholder="Waktu kedatangan tim dokumentasi, rundown jam kirab, dll..."
              value={formData.agreements}
              onChange={(e) => setFormData({ ...formData, agreements: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tindak Lanjut Pertama (Action Item)</label>
            <input
              type="text"
              placeholder="Contoh: Kirim final rundown dan kontak PIC ke grup WA tim"
              value={formData.action_item}
              onChange={(e) => setFormData({ ...formData, action_item: e.target.value })}
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
              Simpan Notulensi
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
