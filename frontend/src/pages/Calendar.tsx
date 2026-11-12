import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  AlertTriangle,
  Clock,
  MapPin,
  CheckCircle,
} from 'lucide-react';
import { api, formatDate, formatDateTime } from '../services/api';
import { CalendarEvent, Project } from '../types';
import { Modal } from '../components/common/Modal';

export const Calendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Form
  const [formData, setFormData] = useState({
    project_id: 0,
    title: '',
    event_type: 'Akad Nikah',
    start_time: '',
    end_time: '',
    location: '',
    notes: '',
  });

  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
    loadProjects();
  }, [currentDate]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await api.getEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load calendar events:', err);
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

  // Calendar math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleOpenAdd = (dayNum?: number) => {
    const d = dayNum ? new Date(year, month, dayNum, 8, 0) : new Date();
    const end = new Date(d.getTime() + 4 * 60 * 60 * 1000);

    const toLocalISO = (date: Date) => {
      const tzOffset = date.getTimezoneOffset() * 60000;
      return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    };

    setFormData({
      project_id: projects[0]?.id || 0,
      title: 'Akad Nikah',
      event_type: 'Akad Nikah',
      start_time: toLocalISO(d),
      end_time: toLocalISO(end),
      location: '',
      notes: '',
    });
    setConflictWarning(null);
    setIsModalOpen(true);
  };

  const checkConflictOnFly = async (pId: number, startStr: string, endStr: string) => {
    if (!pId || !startStr || !endStr) return;
    try {
      const res = await api.checkConflict({
        project_id: pId,
        start_time: new Date(startStr).toISOString(),
        end_time: new Date(endStr).toISOString(),
      });
      if (res.has_conflict) {
        setConflictWarning(res.conflicts.map((c) => c.message).join('\n'));
      } else {
        setConflictWarning(null);
      }
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createEvent({
        ...formData,
        event_type: formData.event_type as any,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
      });
      if (res.has_conflict) {
        alert('PERHATIAN: Bentrok jadwal terdeteksi pada penugasan atau slot waktu ini!');
      }
      setIsModalOpen(false);
      loadEvents();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan jadwal');
    }
  };

  // Group events by day in month
  const eventsByDay: { [key: number]: CalendarEvent[] } = {};
  events.forEach((ev) => {
    const d = new Date(ev.start_time);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!eventsByDay[day]) eventsByDay[day] = [];
      eventsByDay[day].push(ev);
    }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Kalender & Jadwal Acara</h2>
          <p className="text-xs text-slate-500">
            Pemeriksaan bentrok waktu acara, lokasi venue, dan ketersediaan tim dokumentasi
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-lg transition ${
                viewMode === 'month' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              Bulanan
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg transition ${
                viewMode === 'list' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              Daftar Agenda
            </button>
          </div>

          <button
            onClick={() => handleOpenAdd()}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jadwal</span>
          </button>
        </div>
      </div>

      {/* Month Navigation Banner */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-slate-900 font-serif">
            {monthNames[month]} {year}
          </h3>
          <button
            onClick={handleToday}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
          >
            Hari Ini
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50 text-center text-xs font-semibold text-slate-600 py-2.5">
            <span className="text-rose-600">Minggu</span>
            <span>Senin</span>
            <span>Selasa</span>
            <span>Rabu</span>
            <span>Kamis</span>
            <span>Jumat</span>
            <span className="text-emerald-700">Sabtu</span>
          </div>

          {/* Grid of days */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 text-xs min-h-[550px]">
            {/* Blank cells for offset */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`blank-${i}`} className="bg-slate-50/40 p-2 min-h-[90px]" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = eventsByDay[day] || [];
              const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => handleOpenAdd(day)}
                  className={`p-2 min-h-[90px] hover:bg-emerald-50/30 transition cursor-pointer flex flex-col justify-between group ${
                    isToday ? 'bg-emerald-50/60' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        isToday
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'text-slate-700 group-hover:text-emerald-700'
                      }`}
                    >
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold text-slate-400">
                        {dayEvents.length} acara
                      </span>
                    )}
                  </div>

                  {/* Day Events Pills */}
                  <div className="space-y-1 mt-1 overflow-y-auto max-h-[70px] custom-scrollbar">
                    {dayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(ev);
                        }}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold truncate border ${
                          ev.conflict_warning
                            ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold animate-pulse'
                            : 'bg-emerald-100/70 border-emerald-200 text-emerald-900'
                        }`}
                        title={`${ev.title} (${ev.event_type})`}
                      >
                        {ev.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LIST / AGENDA VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Agenda Acara Terjadwal</h3>
          <div className="space-y-3">
            {events.length > 0 ? (
              events.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-emerald-200 bg-slate-50/50 hover:bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs cursor-pointer transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {ev.event_type}
                      </span>
                      <h4 className="font-bold text-slate-900">{ev.title}</h4>
                      {ev.conflict_warning && (
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Bentrok!</span>
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600">
                      Proyek: <strong className="text-slate-800">{ev.project?.client?.name}</strong> ({ev.project?.project_number})
                    </p>
                    <p className="text-slate-500">📍 {ev.location || 'Lokasi belum ditentukan'}</p>
                    {ev.conflict_warning && (
                      <p className="text-rose-600 text-[11px] font-medium">{ev.conflict_warning}</p>
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
                Belum ada jadwal tersimpan.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Add Event Modal with Conflict Alert */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Jadwal Acara & Deteksi Bentrok"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pilih Proyek Klien *</label>
            <select
              value={formData.project_id}
              onChange={(e) => {
                const pId = Number(e.target.value);
                setFormData({ ...formData, project_id: pId });
                checkConflictOnFly(pId, formData.start_time, formData.end_time);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_number} — {p.client?.name} ({p.package?.name || 'Kustom'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Judul Acara *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Akad Nikah / Resepsi / Prewedding Outdoor"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Kategori Jadwal</label>
            <select
              value={formData.event_type}
              onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="Akad Nikah">Akad Nikah</option>
              <option value="Resepsi">Resepsi</option>
              <option value="Prewedding">Prewedding</option>
              <option value="Meeting Klien">Meeting Klien</option>
              <option value="Technical Meeting">Technical Meeting</option>
              <option value="Dokumentasi Acara">Dokumentasi Acara Lain</option>
              <option value="Deadline Editing">Deadline Editing</option>
              <option value="Deadline Penyerahan">Deadline Penyerahan</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Waktu Mulai *</label>
              <input
                type="datetime-local"
                required
                value={formData.start_time}
                onChange={(e) => {
                  setFormData({ ...formData, start_time: e.target.value });
                  checkConflictOnFly(formData.project_id, e.target.value, formData.end_time);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Waktu Selesai *</label>
              <input
                type="datetime-local"
                required
                value={formData.end_time}
                onChange={(e) => {
                  setFormData({ ...formData, end_time: e.target.value });
                  checkConflictOnFly(formData.project_id, formData.start_time, e.target.value);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Lokasi / Venue</label>
            <input
              type="text"
              placeholder="Gedung, ballroom, atau studio"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Conflict Warning Box */}
          {conflictWarning && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-rose-700">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Peringatan Bentrok Terdeteksi!</span>
              </div>
              <p className="whitespace-pre-line text-[11px] leading-relaxed">{conflictWarning}</p>
            </div>
          )}

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
              Simpan Jadwal
            </button>
          </div>
        </form>
      </Modal>

      {/* Event Detail Modal */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title || 'Detail Acara'}
      >
        {selectedEvent && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  {selectedEvent.event_type}
                </span>
                <span className="font-semibold text-slate-800">
                  {formatDate(selectedEvent.start_time)}
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{selectedEvent.title}</h4>
              <p className="text-slate-600">
                Proyek: {selectedEvent.project?.client?.name} ({selectedEvent.project?.project_number})
              </p>
              <p className="text-slate-500">📍 {selectedEvent.location || 'Lokasi belum ditentukan'}</p>
              <div className="text-slate-500 text-[11px] pt-1 border-t border-slate-200">
                Waktu: {formatDateTime(selectedEvent.start_time)} — {formatDateTime(selectedEvent.end_time)}
              </div>
            </div>

            {selectedEvent.conflict_warning && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-rose-700">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Peringatan Bentrok Terdaftar</span>
                </div>
                <p className="whitespace-pre-line text-[11px]">{selectedEvent.conflict_warning}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Link
                to={`/projects/${selectedEvent.project_id}`}
                className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition"
              >
                Buka Proyek Terkait
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
