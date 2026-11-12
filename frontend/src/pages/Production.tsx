import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  User,
  Calendar,
} from 'lucide-react';
import { api, formatDate } from '../services/api';
import { Task, TaskStatus } from '../types';
import { TaskStatusBadge } from '../components/common/Badge';

export const Production: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [stageFilter, setStageFilter] = useState<string>('');

  const stagesList = [
    { num: 1, title: '1. Pengambilan foto/video' },
    { num: 2, title: '2. Backup file' },
    { num: 3, title: '3. Seleksi foto' },
    { num: 4, title: '4. Editing foto' },
    { num: 5, title: '5. Editing video' },
    { num: 6, title: '6. Review internal' },
    { num: 7, title: '7. Revisi klien' },
    { num: 8, title: '8. Finalisasi' },
    { num: 9, title: '9. Pengiriman hasil' },
    { num: 10, title: '10. Konfirmasi penyerahan' },
  ];

  useEffect(() => {
    loadTasks();
  }, [statusFilter]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await api.getTasks({
        status: statusFilter || undefined,
      });
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    try {
      await api.updateTaskStatus(taskId, newStatus);
      loadTasks();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status');
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (stageFilter && t.stage.toString() !== stageFilter) return false;
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Progres Produksi Studio</h2>
          <p className="text-xs text-slate-500">
            Pantau 10 tahapan alur kerja dokumentasi dan status pengerjaan tim kreatif
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="in_progress">Sedang Dikerjakan</option>
            <option value="review">Review Internal/Klien</option>
            <option value="completed">Selesai</option>
          </select>

          {/* Stage Filter */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">Semua Tahapan (1-10)</option>
            {stagesList.map((s) => (
              <option key={s.num} value={s.num}>
                Tahap {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 10-Stages Horizontal Stepper Indicator */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-2 min-w-[800px] text-[11px]">
          {stagesList.map((s) => {
            const count = tasks.filter((t) => t.stage === s.num).length;
            const completed = tasks.filter((t) => t.stage === s.num && t.status === 'completed').length;
            return (
              <button
                key={s.num}
                onClick={() => setStageFilter(stageFilter === s.num.toString() ? '' : s.num.toString())}
                className={`flex-1 p-2.5 rounded-xl border text-left transition ${
                  stageFilter === s.num.toString()
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs'
                    : 'border-slate-100 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs text-emerald-800">
                  <span>Tahap {s.num}</span>
                  <span className="text-[10px] text-slate-400">
                    {completed}/{count}
                  </span>
                </div>
                <p className="text-[10px] text-slate-600 font-medium truncate mt-0.5">
                  {s.title.split('. ')[1]}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tasks Table / Kanban Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <CheckSquare className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p>Tidak ada tugas produksi pada filter ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Tahap</th>
                  <th className="py-3 px-4">Nama Pekerjaan</th>
                  <th className="py-3 px-4">Penanggung Jawab</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ubah Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                        {task.stage}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 block">{task.title}</span>
                      <span className="text-[11px] text-slate-400">{task.description}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {task.assignee?.name || 'Studio PIC'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {formatDate(task.deadline)}
                    </td>
                    <td className="py-3 px-4">
                      <TaskStatusBadge status={task.status} />
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                      >
                        <option value="pending">Menunggu</option>
                        <option value="in_progress">Dikerjakan</option>
                        <option value="review">Review</option>
                        <option value="completed">Selesai</option>
                      </select>
                      <Link
                        to={`/projects/${task.project_id}`}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition inline-block"
                      >
                        Proyek
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
