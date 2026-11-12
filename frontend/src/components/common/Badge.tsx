import React from 'react';
import { ProjectStatus, TaskStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'amber' | 'blue' | 'red' | 'purple' | 'gray';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'gray', className = '' }) => {
  const variantStyles = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20',
    amber: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20',
    blue: 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-600/20',
    red: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-600/20',
    gray: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-600/20',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
};

export const ProjectStatusBadge: React.FC<{ status: ProjectStatus }> = ({ status }) => {
  switch (status) {
    case 'Lead':
      return <Badge variant="gray">Lead</Badge>;
    case 'Penawaran':
      return <Badge variant="blue">Penawaran</Badge>;
    case 'Menunggu DP':
      return <Badge variant="amber">Menunggu DP</Badge>;
    case 'Booked':
      return <Badge variant="green">Booked</Badge>;
    case 'Persiapan':
      return <Badge variant="purple">Persiapan</Badge>;
    case 'Berlangsung':
      return <Badge variant="blue">Berlangsung</Badge>;
    case 'Editing':
      return <Badge variant="amber">Editing</Badge>;
    case 'Review/Revisi':
      return <Badge variant="purple">Review / Revisi</Badge>;
    case 'Selesai':
      return <Badge variant="green">Selesai</Badge>;
    case 'Diarsipkan':
      return <Badge variant="gray">Diarsipkan</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export const TaskStatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  switch (status) {
    case 'completed':
      return <Badge variant="green">Selesai</Badge>;
    case 'in_progress':
      return <Badge variant="blue">Dikerjakan</Badge>;
    case 'review':
      return <Badge variant="purple">Review</Badge>;
    case 'pending':
    default:
      return <Badge variant="gray">Menunggu</Badge>;
  }
};
