import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Briefcase,
  Calendar,
  DollarSign,
  CheckSquare,
  FileText,
  Users,
  FolderArchive,
  ArrowLeft,
  Plus,
  Send,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Phone,
  FilePlus,
} from 'lucide-react';
import { api, formatRupiah, formatDate, formatDateTime } from '../services/api';
import {
  Project,
  ProjectStatus,
  CalendarEvent,
  Task,
  Invoice,
  Payment,
  Expense,
  MeetingNote,
  DocumentItem,
  User,
  TaskStatus,
} from '../types';
import { ProjectStatusBadge, TaskStatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'events' | 'tasks' | 'finance' | 'notes' | 'documents' | 'team'
  >('overview');

  // Modals
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  // Form states
  const [eventForm, setEventForm] = useState({
    title: '',
    event_type: 'Akad Nikah',
    start_time: '',
    end_time: '',
    location: '',
    notes: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    invoice_id: undefined as number | undefined,
    amount: 0,
    payment_type: 'DP',
    payment_method: 'Transfer Bank',
    payment_date: new Date().toISOString().split('T')[0],
    reference_number: '',
    is_verified: true,
    notes: '',
  });

  const [expenseForm, setExpenseForm] = useState({
    category: 'Honor Tim',
    title: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    paid_to: '',
    notes: '',
  });

  const [noteForm, setNoteForm] = useState({
    meeting_date: new Date().toISOString().split('T')[0],
    participants: '',
    topic: '',
    special_requests: '',
    agreements: '',
    action_item: '',
  });

  const [teamForm, setTeamForm] = useState({
    user_id: 0,
    role_in_project: 'Lead Fotografer',
    notes: '',
  });

  useEffect(() => {
    if (id) {
      loadProject();
      loadUsers();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const data = await api.getProject(Number(id));
      setProject(data);
    } catch (err) {
      console.error('Failed to load project:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const u = await api.getUsers();
      setUsers(u);
      if (u.length > 0) {
        setTeamForm((prev) => ({ ...prev, user_id: u[0].id }));
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (!project) return;
    try {
      await api.updateProject(project.id, { status: newStatus });
      loadProject();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status');
    }
  };

  const handleTaskStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    try {
      await api.updateTaskStatus(taskId, newStatus);
      loadProject();
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui status tugas');
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    try {
      const res = await api.createEvent({
        project_id: project.id,
        title: eventForm.title,
        event_type: eventForm.event_type as any,
        start_time: new Date(eventForm.start_time).toISOString(),
        end_time: new Date(eventForm.end_time).toISOString(),
        location: eventForm.location || project.venue_name,
        notes: eventForm.notes,
      });

      if (res.has_conflict) {
        alert('PERINGATAN BENTROK JADWAL DITEMUKAN:\n' + res.conflicts.map((c) => c.message).join('\n'));
      }
      setIsEventModalOpen(false);
      loadProject();
    } catch (err: any) {
      alert(err.message || 'Gagal menambah acara');
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    try {
      await api.createPayment({
        project_id: project.id,
        invoice_id: paymentForm.invoice_id || undefined,
        amount: Number(paymentForm.amount),
        payment_type: paymentForm.payment_type as any,
        payment_method: paymentForm.payment_method as any,
        payment_date: new Date(paymentForm.payment_date).toISOString(),
        reference_number: paymentForm.reference_number,
        is_verified: paymentForm.is_verified,
        notes: paymentForm.notes,
      });
      setIsPaymentModalOpen(false);
      loadProject();
    } catch (err: any) {
      alert(err.message || 'Gagal mencatat pembayaran');
    }
  };

  const handleVerifyPayment = async (paymentId: number) => {
    try {
      await api.verifyPayment(paymentId);
      loadProject();
    } catch (err: any) {
      alert(err.message || 'Gagal memverifikasi pembayaran');
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    try {
      await api.createExpense({
        project_id: project.id,
        category: expenseForm.category as any,
        title: expenseForm.title,
        amount: Number(expenseForm.amount),
        date: new Date(expenseForm.date).toISOString(),
        paid_to: expenseForm.paid_to,
        notes: expenseForm.notes,
      });
      setIsExpenseModalOpen(false);
      loadProject();
    } catch (err: any) {
      alert(err.message || 'Gagal mencatat pengeluaran');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    try {
      await api.createNote({
        project_id: project.id,
        meeting_date: new Date(noteForm.meeting_date).toISOString(),
        participants: noteForm.participants,
        topic: noteForm.topic,
        special_requests: noteForm.special_requests,
        agreements: noteForm.agreements,
        actions: noteForm.action_item ? [{ action_item: noteForm.action_item }] : [],
      });
      setIsNoteModalOpen(false);
      loadProject();
    } catch (err: any) {
      alert(err.message || 'Gagal menambah notulensi');
    }
  };

  const handleToggleAction = async (actionId: number) => {
    try {
      await api.toggleActionItem(actionId);
      loadProject();
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui status');
    }
  };

  const handleAssignTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    try {
      await api.assignMember({
        project_id: project.id,
        user_id: teamForm.user_id,
        role_in_project: teamForm.role_in_project,
        notes: teamForm.notes,
      });
      setIsTeamModalOpen(false);
      loadProject();
    } catch (err: any) {
      alert(err.message || 'Gagal menugaskan anggota tim');
    }
  };

  const handleGenerateDoc = async (docType: string, refId: number) => {
    try {
      const res = await api.generateDocument(docType, refId);
      alert(`${res.message}! File PDF tersimpan.`);
      loadProject();
    } catch (err: any) {
      alert(err.message || 'Gagal membuat dokumen');
    }
  };

  const handleShareWhatsApp = async (docId: number) => {
    try {
      const res = await api.getWhatsAppLink(docId);
      window.open(res.whatsapp_url, '_blank');
    } catch (err: any) {
      alert(err.message || 'Gagal membuka WhatsApp');
    }
  };

  if (loading || !project) {
    return (
      <div className="p-12 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-3 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Back button & Project Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/projects"
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                {project.project_number}
              </span>
              <ProjectStatusBadge status={project.status} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
              {project.client?.name || 'Klien'}
            </h2>
          </div>
        </div>

        {/* Change status dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Ubah Status:</span>
          <select
            value={project.status}
            onChange={(e) => handleStatusChange(e.target.value as ProjectStatus)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="Lead">Lead</option>
            <option value="Penawaran">Penawaran</option>
            <option value="Menunggu DP">Menunggu DP</option>
            <option value="Booked">Booked</option>
            <option value="Persiapan">Persiapan</option>
            <option value="Berlangsung">Berlangsung</option>
            <option value="Editing">Editing</option>
            <option value="Review/Revisi">Review/Revisi</option>
            <option value="Selesai">Selesai</option>
            <option value="Diarsipkan">Diarsipkan</option>
          </select>
        </div>
      </div>

      {/* Financial & Progress Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-xs">
        <div>
          <span className="text-slate-400 font-medium block">Total Kontrak</span>
          <span className="font-bold text-slate-900 text-sm">
            {formatRupiah(project.contract_value)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-medium block">Terverifikasi Diterima</span>
          <span className="font-bold text-emerald-700 text-sm">
            {formatRupiah(project.total_paid)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-medium block">Sisa Tagihan</span>
          <span className={`font-bold text-sm ${project.remaining_amount ? 'text-rose-600' : 'text-emerald-600'}`}>
            {formatRupiah(project.remaining_amount)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-medium block">Laba Proyek</span>
          <span className="font-bold text-teal-800 text-sm">
            {formatRupiah(project.profit)}
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-0.5 custom-scrollbar text-xs font-semibold">
        {[
          { key: 'overview', label: 'Ringkasan', icon: Briefcase },
          { key: 'events', label: `Jadwal (${project.events?.length || 0})`, icon: Calendar },
          { key: 'tasks', label: `Produksi (${project.progress_percent || 0}%)`, icon: CheckSquare },
          { key: 'finance', label: 'Keuangan & Tagihan', icon: DollarSign },
          { key: 'notes', label: `Notulensi (${project.meeting_notes?.length || 0})`, icon: FileText },
          { key: 'documents', label: `Dokumen PDF (${project.documents?.length || 0})`, icon: FolderArchive },
          { key: 'team', label: `Tim (${project.members?.length || 0})`, icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-emerald-600 text-emerald-800 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Identity & Venue Box */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Informasi Acara & Lokasi</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Venue / Lokasi Acara</span>
                  <p className="font-bold text-slate-800 mt-0.5">{project.venue_name || '-'}</p>
                  <p className="text-slate-500">{project.venue_address || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Tanggal & Jam Acara</span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {project.event_date ? formatDate(project.event_date) : '-'}
                  </p>
                  <p className="text-slate-500">
                    {project.event_start_time} - {project.event_end_time || 'Selesai'} WIB
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Paket Pilihan</span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {project.package?.name || 'Paket Kustom'}
                  </p>
                  <p className="text-slate-500">{project.package?.category || ''}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Penanggung Jawab (PIC)</span>
                  <p className="font-bold text-slate-800 mt-0.5">{project.pic?.name || 'Studio Admin'}</p>
                  <p className="text-slate-500">{project.pic?.role || ''}</p>
                </div>
              </div>

              {project.notes && (
                <div className="pt-3 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 font-medium block">Catatan Proyek:</span>
                  <p className="text-slate-700 mt-1">{project.notes}</p>
                </div>
              )}
            </div>

            {/* Production 10-Stages Progress Bar */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Tahap Produksi Studio</h3>
                <span className="text-xs font-bold text-emerald-700">
                  {project.progress_percent || 0}% Selesai
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all"
                  style={{ width: `${project.progress_percent || 0}%` }}
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 text-[10px]">
                {project.tasks?.map((t) => (
                  <div
                    key={t.id}
                    className={`p-2 rounded-lg border text-center transition ${
                      t.status === 'completed'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : t.status === 'in_progress'
                        ? 'bg-sky-50 border-sky-200 text-sky-800'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    <span className="font-bold block">T{t.stage}</span>
                    <span className="truncate block font-medium">{t.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar: Client card & quick links */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs text-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Kontak Klien</h3>
              <div>
                <span className="text-slate-400 block">Nama Pasangan</span>
                <span className="font-bold text-slate-800 text-sm">{project.client?.name}</span>
                {project.client?.bride_name && (
                  <span className="block text-slate-500 text-[11px]">
                    👰 {project.client.bride_name} & 🤵 {project.client.groom_name}
                  </span>
                )}
              </div>
              <div>
                <span className="text-slate-400 block">WhatsApp</span>
                <a
                  href={`https://wa.me/${project.client?.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-emerald-700 hover:underline flex items-center gap-1 mt-0.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{project.client?.whatsapp}</span>
                </a>
              </div>
              <div>
                <span className="text-slate-400 block">Alamat</span>
                <span className="text-slate-700">{project.client?.address || '-'}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-emerald-950 text-white rounded-2xl p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Aksi Cepat Dokumen
              </h4>
              <button
                onClick={() => handleGenerateDoc('penawaran', project.id)}
                className="w-full py-2 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2 transition"
              >
                <FilePlus className="w-4 h-4 text-emerald-300" />
                <span>Terbitkan Penawaran PDF</span>
              </button>
              <button
                onClick={() => handleGenerateDoc('kontrak', project.id)}
                className="w-full py-2 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2 transition"
              >
                <FileText className="w-4 h-4 text-emerald-300" />
                <span>Terbitkan Kontrak PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Events / Calendar */}
      {activeTab === 'events' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Jadwal Acara & Agenda</h3>
              <p className="text-xs text-slate-500">
                Akad nikah, resepsi, prewedding, technical meeting, dan batas waktu
              </p>
            </div>
            <button
              onClick={() => {
                setEventForm({
                  title: `Akad & Resepsi ${project.client?.name || ''}`,
                  event_type: 'Akad Nikah',
                  start_time: '',
                  end_time: '',
                  location: project.venue_name || '',
                  notes: '',
                });
                setIsEventModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Acara</span>
            </button>
          </div>

          <div className="space-y-3">
            {project.events && project.events.length > 0 ? (
              project.events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {ev.event_type}
                      </span>
                      <h4 className="font-bold text-slate-900">{ev.title}</h4>
                    </div>
                    <p className="text-slate-600">📍 {ev.location || 'Lokasi menyusul'}</p>
                    {ev.notes && <p className="text-slate-500 italic">"{ev.notes}"</p>}
                    {ev.conflict_warning && (
                      <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-semibold flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{ev.conflict_warning}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-slate-800 block">
                      {formatDateTime(ev.start_time)}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      sampai {formatDateTime(ev.end_time)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-xs text-slate-400">
                Belum ada jadwal acara yang ditambahkan.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Production 10-Stages */}
      {activeTab === 'tasks' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Alur Progres Produksi (10 Tahapan)</h3>
            <p className="text-xs text-slate-500">
              Sesuai standar operasional Tumata Wedding Studio dari pemotretan hingga penyerahan hasil
            </p>
          </div>

          <div className="space-y-3">
            {project.tasks && project.tasks.length > 0 ? (
              project.tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-emerald-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                      {task.stage}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900">{task.title}</h4>
                        <TaskStatusBadge status={task.status} />
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">{task.description}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span>Penanggung Jawab: <strong className="text-slate-700">{task.assignee?.name || 'Studio'}</strong></span>
                        <span>Deadline: <strong className="text-slate-700">{formatDate(task.deadline)}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <select
                      value={task.status}
                      onChange={(e) => handleTaskStatusChange(task.id, e.target.value as TaskStatus)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50"
                    >
                      <option value="pending">Menunggu</option>
                      <option value="in_progress">Dikerjakan</option>
                      <option value="review">Review</option>
                      <option value="completed">Selesai</option>
                    </select>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-xs text-slate-400">
                Tahapan tugas belum digenerate.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Finance (Invoices, Payments, Expenses) */}
      {activeTab === 'finance' && (
        <div className="space-y-6">
          {/* Top Actions */}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Pembayaran (DP/Cicilan)</span>
            </button>
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Pengeluaran</span>
            </button>
          </div>

          {/* Invoices List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Tagihan & Invoice</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="pb-2">No. Invoice</th>
                    <th className="pb-2">Jatuh Tempo</th>
                    <th className="pb-2">Total Tagihan</th>
                    <th className="pb-2">Terbayar</th>
                    <th className="pb-2">Sisa</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Aksi PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {project.invoices && project.invoices.length > 0 ? (
                    project.invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td className="py-2.5 font-bold text-slate-800">{inv.invoice_number}</td>
                        <td className="py-2.5 text-slate-600">{formatDate(inv.due_date)}</td>
                        <td className="py-2.5 font-semibold text-slate-800">
                          {formatRupiah(inv.total_amount)}
                        </td>
                        <td className="py-2.5 text-emerald-700 font-semibold">
                          {formatRupiah(inv.paid_amount)}
                        </td>
                        <td className="py-2.5 text-rose-600 font-semibold">
                          {formatRupiah(inv.remaining_amount)}
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              inv.status === 'paid'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => handleGenerateDoc('invoice', inv.id)}
                            className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px] transition"
                          >
                            Terbitkan PDF
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-4 text-center text-slate-400">
                        Belum ada invoice.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payments & Receipts List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Riwayat Pembayaran & Kwitansi Sah</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="pb-2">No. Kwitansi</th>
                    <th className="pb-2">Tanggal</th>
                    <th className="pb-2">Tipe</th>
                    <th className="pb-2">Metode</th>
                    <th className="pb-2">Nominal</th>
                    <th className="pb-2">Verifikasi</th>
                    <th className="pb-2 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {project.payments && project.payments.length > 0 ? (
                    project.payments.map((pay) => (
                      <tr key={pay.id}>
                        <td className="py-2.5 font-bold text-slate-800">{pay.receipt_number}</td>
                        <td className="py-2.5 text-slate-600">{formatDate(pay.payment_date)}</td>
                        <td className="py-2.5">{pay.payment_type}</td>
                        <td className="py-2.5 text-slate-600">{pay.payment_method}</td>
                        <td className="py-2.5 font-bold text-emerald-700">
                          {formatRupiah(pay.amount)}
                        </td>
                        <td className="py-2.5">
                          {pay.is_verified ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                              Terverifikasi
                            </span>
                          ) : (
                            <button
                              onClick={() => handleVerifyPayment(pay.id)}
                              className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 text-[10px] font-bold"
                            >
                              Verifikasi Sekarang
                            </button>
                          )}
                        </td>
                        <td className="py-2.5 text-right">
                          {pay.is_verified ? (
                            <button
                              onClick={() => handleGenerateDoc('kwitansi', pay.id)}
                              className="px-2.5 py-1 rounded bg-teal-50 text-teal-800 hover:bg-teal-100 font-semibold text-[11px] transition"
                            >
                              Kwitansi PDF
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Perlu verifikasi</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-4 text-center text-slate-400">
                        Belum ada transaksi pembayaran.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expenses List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Pengeluaran Proyek (Honor, Sewa, Cetak)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="pb-2">Tanggal</th>
                    <th className="pb-2">Kategori</th>
                    <th className="pb-2">Keperluan</th>
                    <th className="pb-2">Dibayarkan Kepada</th>
                    <th className="pb-2 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {project.expenses && project.expenses.length > 0 ? (
                    project.expenses.map((exp) => (
                      <tr key={exp.id}>
                        <td className="py-2.5 text-slate-600">{formatDate(exp.date)}</td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-2.5 font-semibold text-slate-800">{exp.title}</td>
                        <td className="py-2.5 text-slate-600">{exp.paid_to || '-'}</td>
                        <td className="py-2.5 font-bold text-rose-600 text-right">
                          {formatRupiah(exp.amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-400">
                        Belum ada pengeluaran dicatat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Meeting Notes */}
      {activeTab === 'notes' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Notulensi Rapat & Permintaan Klien</h3>
              <p className="text-xs text-slate-500">
                Pencatatan hasil technical meeting, rundown, dan tindak lanjut (action items)
              </p>
            </div>
            <button
              onClick={() => {
                setNoteForm({
                  meeting_date: new Date().toISOString().split('T')[0],
                  participants: `${project.client?.name || ''}, Studio PIC`,
                  topic: 'Technical Meeting & Pembahasan Rundown',
                  special_requests: '',
                  agreements: '',
                  action_item: '',
                });
                setIsNoteModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Notulensi</span>
            </button>
          </div>

          <div className="space-y-4">
            {project.meeting_notes && project.meeting_notes.length > 0 ? (
              project.meeting_notes.map((note) => (
                <div
                  key={note.id}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{note.topic}</h4>
                      <p className="text-slate-500 text-[11px]">
                        Peserta: {note.participants} | Tanggal: {formatDate(note.meeting_date)}
                      </p>
                    </div>
                  </div>

                  {note.special_requests && (
                    <div>
                      <span className="font-semibold text-slate-700 block text-[11px]">
                        Permintaan Khusus:
                      </span>
                      <p className="text-slate-600 mt-0.5">{note.special_requests}</p>
                    </div>
                  )}

                  {note.agreements && (
                    <div>
                      <span className="font-semibold text-slate-700 block text-[11px]">
                        Keputusan yang Disepakati:
                      </span>
                      <p className="text-slate-600 mt-0.5">{note.agreements}</p>
                    </div>
                  )}

                  {/* Actions list */}
                  {note.actions && note.actions.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60">
                      <span className="font-semibold text-slate-700 block text-[11px] mb-1.5">
                        Tindak Lanjut (Action Items):
                      </span>
                      <div className="space-y-1.5">
                        {note.actions.map((act) => (
                          <label
                            key={act.id}
                            className="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded transition"
                          >
                            <input
                              type="checkbox"
                              checked={act.is_done}
                              onChange={() => handleToggleAction(act.id)}
                              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                            />
                            <span
                              className={`text-xs ${
                                act.is_done ? 'line-through text-slate-400' : 'text-slate-800 font-medium'
                              }`}
                            >
                              {act.action_item}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-xs text-slate-400">
                Belum ada notulensi meeting dicatat untuk proyek ini.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Documents & PDF Center */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Arsip Dokumen PDF Proyek</h3>
              <p className="text-xs text-slate-500">
                Dokumen resmi ber-branding Tumata yang telah diterbitkan dengan snapshot data permanen
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {project.documents && project.documents.length > 0 ? (
              project.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-emerald-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 uppercase">{doc.doc_type}</span>
                      <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {doc.document_number}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      Diterbitkan: {formatDateTime(doc.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`/api/documents/${doc.id}/download`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh PDF</span>
                    </a>
                    <button
                      onClick={() => handleShareWhatsApp(doc.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim WhatsApp</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-xs text-slate-400">
                Belum ada dokumen PDF yang diterbitkan untuk proyek ini.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Assigned Team */}
      {activeTab === 'team' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Anggota Tim Bertugas</h3>
              <p className="text-xs text-slate-500">
                Fotografer, videografer, editor, dan koordinator yang dialokasikan
              </p>
            </div>
            <button
              onClick={() => setIsTeamModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tugaskan Anggota</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {project.members && project.members.length > 0 ? (
              project.members.map((mem) => (
                <div
                  key={mem.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-1"
                >
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {mem.role_in_project}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">{mem.user?.name}</h4>
                  <p className="text-slate-500 text-[11px]">{mem.user?.phone || '-'}</p>
                </div>
              ))
            ) : (
              <p className="col-span-full text-center py-8 text-xs text-slate-400">
                Belum ada anggota tim khusus yang ditugaskan di proyek ini.
              </p>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Tambah Acara */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        title="Tambah Jadwal Acara"
      >
        <form onSubmit={handleAddEvent} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Judul Acara *</label>
            <input
              type="text"
              required
              value={eventForm.title}
              onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Jenis Acara</label>
            <select
              value={eventForm.event_type}
              onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="Akad Nikah">Akad Nikah</option>
              <option value="Resepsi">Resepsi</option>
              <option value="Prewedding">Prewedding</option>
              <option value="Meeting Klien">Meeting Klien</option>
              <option value="Technical Meeting">Technical Meeting</option>
              <option value="Dokumentasi Acara">Dokumentasi Acara Lain</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mulai *</label>
              <input
                type="datetime-local"
                required
                value={eventForm.start_time}
                onChange={(e) => setEventForm({ ...eventForm, start_time: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Selesai *</label>
              <input
                type="datetime-local"
                required
                value={eventForm.end_time}
                onChange={(e) => setEventForm({ ...eventForm, end_time: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Lokasi</label>
            <input
              type="text"
              value={eventForm.location}
              onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsEventModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
            >
              Simpan & Cek Bentrok
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Tambah Pembayaran */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Catat Pembayaran Klien"
      >
        <form onSubmit={handleAddPayment} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pilih Tagihan Invoice</label>
            <select
              value={paymentForm.invoice_id || ''}
              onChange={(e) =>
                setPaymentForm({
                  ...paymentForm,
                  invoice_id: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">Pembayaran Proyek Umum</option>
              {project.invoices?.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoice_number} (Sisa: {formatRupiah(inv.remaining_amount)})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jenis Pembayaran</label>
              <select
                value={paymentForm.payment_type}
                onChange={(e) => setPaymentForm({ ...paymentForm, payment_type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="DP">DP (Uang Muka)</option>
                <option value="Cicilan">Cicilan Termin</option>
                <option value="Pelunasan">Pelunasan</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Metode</label>
              <select
                value={paymentForm.payment_method}
                onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Transfer Bank">Transfer Bank</option>
                <option value="Tunai">Tunai</option>
                <option value="QRIS">QRIS</option>
                <option value="Kartu Kredit/Debit">Kartu Kredit/Debit</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nominal Diterima (Rp) *</label>
            <input
              type="number"
              required
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">No. Referensi Bank / Catatan</label>
            <input
              type="text"
              placeholder="Contoh: BCA-TRX-998811"
              value={paymentForm.reference_number}
              onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_verif"
              checked={paymentForm.is_verified}
              onChange={(e) => setPaymentForm({ ...paymentForm, is_verified: e.target.checked })}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="is_verif" className="text-slate-700 font-medium cursor-pointer">
              Verifikasi Langsung (Uang telah masuk mutasi bank)
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
            >
              Simpan Pembayaran
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Tambah Pengeluaran */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Catat Pengeluaran Proyek"
      >
        <form onSubmit={handleAddExpense} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Kategori Pengeluaran</label>
            <select
              value={expenseForm.category}
              onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="Honor Tim">Honor Tim (Fotografer/Videografer/Editor)</option>
              <option value="Transportasi">Transportasi & Bensin</option>
              <option value="Konsumsi">Konsumsi Tim</option>
              <option value="Sewa Alat">Sewa Alat / Lensa / Lighting</option>
              <option value="Cetak Album/Frame">Cetak Album / Frame / Kanvas</option>
              <option value="Vendor Luar">Vendor Luar / Drone Operator</option>
              <option value="Lain-lain">Lain-lain</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Deskripsi Pengeluaran *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Honor Fotografer Utama & Asisten"
              value={expenseForm.title}
              onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nominal (Rp) *</label>
              <input
                type="number"
                required
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dibayarkan Kepada</label>
              <input
                type="text"
                placeholder="Nama penerima uang"
                value={expenseForm.paid_to}
                onChange={(e) => setExpenseForm({ ...expenseForm, paid_to: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsExpenseModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold"
            >
              Simpan Pengeluaran
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Tambah Notulensi */}
      <Modal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        title="Catat Notulensi Rapat"
      >
        <form onSubmit={handleAddNote} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Topik Rapat *</label>
            <input
              type="text"
              required
              value={noteForm.topic}
              onChange={(e) => setNoteForm({ ...noteForm, topic: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Peserta Hadir</label>
            <input
              type="text"
              value={noteForm.participants}
              onChange={(e) => setNoteForm({ ...noteForm, participants: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Permintaan Khusus Klien</label>
            <textarea
              rows={2}
              value={noteForm.special_requests}
              onChange={(e) => setNoteForm({ ...noteForm, special_requests: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Keputusan yang Disepakati</label>
            <textarea
              rows={2}
              value={noteForm.agreements}
              onChange={(e) => setNoteForm({ ...noteForm, agreements: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tindak Lanjut Pertama (Action Item)</label>
            <input
              type="text"
              placeholder="Contoh: Siapkan revisi rundown & konfirmasi ke WO"
              value={noteForm.action_item}
              onChange={(e) => setNoteForm({ ...noteForm, action_item: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsNoteModalOpen(false)}
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

      {/* MODAL: Tugaskan Anggota Tim */}
      <Modal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        title="Tugaskan Anggota Tim ke Proyek"
      >
        <form onSubmit={handleAssignTeam} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pilih Anggota Tim</label>
            <select
              value={teamForm.user_id}
              onChange={(e) => setTeamForm({ ...teamForm, user_id: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Peran dalam Proyek Ini</label>
            <input
              type="text"
              required
              placeholder="Contoh: Lead Photographer / Video Editor / Drone Pilot"
              value={teamForm.role_in_project}
              onChange={(e) => setTeamForm({ ...teamForm, role_in_project: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsTeamModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
            >
              Tugaskan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
