export type UserRole =
  | 'admin'
  | 'fotografer'
  | 'videografer'
  | 'editor foto'
  | 'editor video'
  | 'koordinator'
  | 'pemilik';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  created_at?: string;
}

export interface StudioSetting {
  id?: number;
  studio_name: string;
  tagline: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  bank_name: string;
  bank_account: string;
  bank_holder: string;
  signer_name: string;
  signer_role: string;
  terms_and_conditions: string;
  logo_path?: string;
}

export type ClientSource =
  | 'Instagram'
  | 'TikTok'
  | 'Rekomendasi'
  | 'Walk-in'
  | 'Website'
  | 'Lainnya';

export interface Client {
  id: number;
  name: string;
  bride_name?: string;
  groom_name?: string;
  whatsapp: string;
  email?: string;
  address?: string;
  instagram?: string;
  source: ClientSource;
  notes?: string;
  special_requests?: string;
  projects?: Project[];
  documents?: DocumentItem[];
  created_at: string;
}

export interface Package {
  id: number;
  name: string;
  category: 'Akad' | 'Resepsi' | 'Prewedding' | 'All-In' | 'Custom';
  price: number;
  description: string;
  features: string;
  is_active: boolean;
}

export type ProjectStatus =
  | 'Lead'
  | 'Penawaran'
  | 'Menunggu DP'
  | 'Booked'
  | 'Persiapan'
  | 'Berlangsung'
  | 'Editing'
  | 'Review/Revisi'
  | 'Selesai'
  | 'Diarsipkan';

export interface Project {
  id: number;
  project_number: string;
  client_id: number;
  client?: Client;
  package_id?: number;
  package?: Package;
  contract_value: number;
  status: ProjectStatus;
  event_date?: string;
  event_start_time?: string;
  event_end_time?: string;
  venue_name?: string;
  venue_address?: string;
  pic_id?: number;
  pic?: User;
  notes?: string;
  special_requests?: string;
  events?: CalendarEvent[];
  tasks?: Task[];
  members?: ProjectMember[];
  invoices?: Invoice[];
  payments?: Payment[];
  expenses?: Expense[];
  meeting_notes?: MeetingNote[];
  documents?: DocumentItem[];
  total_paid?: number;
  remaining_amount?: number;
  total_expenses?: number;
  profit?: number;
  progress_percent?: number;
  created_at: string;
}

export type EventType =
  | 'Akad Nikah'
  | 'Resepsi'
  | 'Prewedding'
  | 'Meeting Klien'
  | 'Technical Meeting'
  | 'Dokumentasi Acara'
  | 'Deadline Editing'
  | 'Deadline Penyerahan';

export interface CalendarEvent {
  id: number;
  project_id: number;
  project?: Project;
  title: string;
  event_type: EventType;
  start_time: string;
  end_time: string;
  location?: string;
  notes?: string;
  conflict_warning?: string;
}

export interface ConflictDetail {
  type: string;
  message: string;
  project_name: string;
  event_title: string;
  start_time: string;
  end_time: string;
}

export interface ProjectMember {
  id: number;
  project_id: number;
  user_id: number;
  user?: User;
  role_in_project: string;
  notes?: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'review' | 'completed';

export interface Task {
  id: number;
  project_id: number;
  stage: number;
  title: string;
  description?: string;
  assignee_id?: number;
  assignee?: User;
  status: TaskStatus;
  deadline?: string;
  notes?: string;
  completed_at?: string;
}

export interface MeetingNote {
  id: number;
  project_id: number;
  meeting_date: string;
  participants: string;
  topic: string;
  special_requests?: string;
  agreements?: string;
  created_by?: User;
  actions?: NoteAction[];
}

export interface NoteAction {
  id: number;
  meeting_note_id: number;
  action_item: string;
  assignee_id?: number;
  assignee?: User;
  deadline?: string;
  is_done: boolean;
}

export interface InvoiceItem {
  id?: number;
  invoice_id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  project_id: number;
  project?: Project;
  issue_date: string;
  due_date: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: 'unpaid' | 'partial' | 'paid' | 'cancelled';
  notes?: string;
  terms?: string;
  items?: InvoiceItem[];
  created_at: string;
}

export interface Payment {
  id: number;
  project_id: number;
  project?: Project;
  invoice_id?: number;
  invoice?: Invoice;
  receipt_number: string;
  amount: number;
  payment_type: 'DP' | 'Cicilan' | 'Pelunasan';
  payment_method: 'Transfer Bank' | 'Tunai' | 'QRIS' | 'Kartu Kredit/Debit';
  payment_date: string;
  reference_number?: string;
  proof_image?: string;
  is_verified: boolean;
  verified_at?: string;
  notes?: string;
}

export interface Expense {
  id: number;
  project_id?: number;
  project?: Project;
  category:
    | 'Honor Tim'
    | 'Transportasi'
    | 'Konsumsi'
    | 'Sewa Alat'
    | 'Cetak Album/Frame'
    | 'Vendor Luar'
    | 'Lain-lain';
  title: string;
  amount: number;
  date: string;
  paid_to?: string;
  notes?: string;
}

export interface DocumentItem {
  id: number;
  document_number: string;
  doc_type: 'penawaran' | 'invoice' | 'kwitansi' | 'kontrak';
  project_id: number;
  project?: Project;
  client_id: number;
  client?: Client;
  file_path: string;
  status: string;
  created_at: string;
}

export interface DashboardMetrics {
  projects_this_month: number;
  ongoing_projects_count: number;
  overdue_projects_count: number;
  pending_payments_count: number;
  unfinished_tasks_count: number;
  total_contract_value: number;
  total_payments_received: number;
  total_receivable: number;
  total_expenses: number;
  net_profit: number;
  upcoming_events: CalendarEvent[];
  unpaid_invoices: Invoice[];
  active_projects: Project[];
  pending_tasks: Task[];
}
