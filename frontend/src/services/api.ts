import {
  Client,
  DashboardMetrics,
  DocumentItem,
  Expense,
  Invoice,
  Package,
  Payment,
  Project,
  CalendarEvent,
  StudioSetting,
  Task,
  User,
  MeetingNote,
} from '../types';

const API_BASE = '/api';

export const getAuthToken = () => localStorage.getItem('tumata_token');
export const setAuthToken = (token: string) => localStorage.setItem('tumata_token', token);
export const removeAuthToken = () => localStorage.removeItem('tumata_token');

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem('tumata_user');
  return user ? JSON.parse(user) : null;
};
export const setCurrentUser = (user: User) => localStorage.setItem('tumata_user', JSON.stringify(user));
export const removeCurrentUser = () => localStorage.removeItem('tumata_user');

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    removeAuthToken();
    removeCurrentUser();
    window.location.href = '/login';
    throw new Error('Sesi telah berakhir. Silakan login kembali.');
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}

// Helpers
export const formatRupiah = (val: number | undefined | null): string => {
  if (val === undefined || val === null) return 'Rp 0';
  return 'Rp ' + val.toLocaleString('id-ID');
};

export const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const formatDateTime = (dateStr?: string | null): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  getProfile: () => request<User>('/auth/profile'),
  changePassword: (data: { current_password: string; new_password: string }) =>
    request<{ message: string }>('/auth/password', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  getUsers: () => request<User[]>('/users'),
  createUser: (data: Partial<User> & { password?: string }) =>
    request<User>('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: number, data: Partial<User>) =>
    request<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  resetUserPassword: (id: number, new_password: string) =>
    request<{ message: string }>(`/users/${id}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ new_password }),
    }),
  deleteUser: (id: number) =>
    request<{ message: string }>(`/users/${id}`, { method: 'DELETE' }),

  // Dashboard
  getDashboardMetrics: () => request<DashboardMetrics>('/dashboard/metrics'),

  // Clients
  getClients: (search?: string) =>
    request<Client[]>(`/clients${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getClient: (id: number) => request<Client>(`/clients/${id}`),
  createClient: (data: Partial<Client>) =>
    request<Client>('/clients', { method: 'POST', body: JSON.stringify(data) }),
  updateClient: (id: number, data: Partial<Client>) =>
    request<Client>(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteClient: (id: number) => request<{ message: string }>(`/clients/${id}`, { method: 'DELETE' }),

  // Packages
  getPackages: () => request<Package[]>('/packages'),
  createPackage: (data: Partial<Package>) =>
    request<Package>('/packages', { method: 'POST', body: JSON.stringify(data) }),
  updatePackage: (id: number, data: Partial<Package>) =>
    request<Package>(`/packages/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePackage: (id: number) => request<{ message: string }>(`/packages/${id}`, { method: 'DELETE' }),

  // Projects
  getProjects: (params?: { status?: string; search?: string; client_id?: number }) => {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.search) q.append('search', params.search);
    if (params?.client_id) q.append('client_id', params.client_id.toString());
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return request<Project[]>(`/projects${queryStr}`);
  },
  getProject: (id: number) => request<Project>(`/projects/${id}`),
  createProject: (data: Partial<Project>) =>
    request<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id: number, data: Partial<Project>) =>
    request<Project>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id: number) => request<{ message: string }>(`/projects/${id}`, { method: 'DELETE' }),

  // Events & Calendar
  getEvents: (params?: { project_id?: number; start_date?: string; end_date?: string }) => {
    const q = new URLSearchParams();
    if (params?.project_id) q.append('project_id', params.project_id.toString());
    if (params?.start_date) q.append('start_date', params.start_date);
    if (params?.end_date) q.append('end_date', params.end_date);
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return request<CalendarEvent[]>(`/events${queryStr}`);
  },
  createEvent: (data: Partial<CalendarEvent>) =>
    request<{ event: CalendarEvent; has_conflict: boolean; conflicts: any[] }>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateEvent: (id: number, data: Partial<CalendarEvent>) =>
    request<{ event: CalendarEvent; has_conflict: boolean; conflicts: any[] }>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteEvent: (id: number) => request<{ message: string }>(`/events/${id}`, { method: 'DELETE' }),
  checkConflict: (data: { project_id: number; start_time: string; end_time: string; exclude_event_id?: number }) =>
    request<{ has_conflict: boolean; conflicts: any[] }>('/events/check-conflict', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Tasks & Production Stages
  getTasks: (params?: { project_id?: number; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.project_id) q.append('project_id', params.project_id.toString());
    if (params?.status) q.append('status', params.status);
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return request<Task[]>(`/tasks${queryStr}`);
  },
  updateTask: (id: number, data: Partial<Task>) =>
    request<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateTaskStatus: (id: number, status: string) =>
    request<Task>(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Meeting Notes
  getNotes: (project_id?: number) =>
    request<MeetingNote[]>(`/notes${project_id ? `?project_id=${project_id}` : ''}`),
  createNote: (data: any) => request<MeetingNote>('/notes', { method: 'POST', body: JSON.stringify(data) }),
  toggleActionItem: (action_id: number) =>
    request<any>(`/notes/actions/${action_id}/toggle`, { method: 'PATCH' }),
  deleteNote: (id: number) => request<{ message: string }>(`/notes/${id}`, { method: 'DELETE' }),

  // Finance
  getInvoices: (project_id?: number) =>
    request<Invoice[]>(`/finance/invoices${project_id ? `?project_id=${project_id}` : ''}`),
  createInvoice: (data: any) =>
    request<Invoice>('/finance/invoices', { method: 'POST', body: JSON.stringify(data) }),
  getPayments: (project_id?: number) =>
    request<Payment[]>(`/finance/payments${project_id ? `?project_id=${project_id}` : ''}`),
  createPayment: (data: any) =>
    request<Payment>('/finance/payments', { method: 'POST', body: JSON.stringify(data) }),
  verifyPayment: (id: number) =>
    request<Payment>(`/finance/payments/${id}/verify`, { method: 'PATCH' }),
  getExpenses: (project_id?: number) =>
    request<Expense[]>(`/finance/expenses${project_id ? `?project_id=${project_id}` : ''}`),
  createExpense: (data: Partial<Expense>) =>
    request<Expense>('/finance/expenses', { method: 'POST', body: JSON.stringify(data) }),
  deleteExpense: (id: number) =>
    request<{ message: string }>(`/finance/expenses/${id}`, { method: 'DELETE' }),
  getFinancialReport: () => request<any>('/finance/report'),

  // Documents
  getDocuments: (params?: { project_id?: number; client_id?: number; doc_type?: string }) => {
    const q = new URLSearchParams();
    if (params?.project_id) q.append('project_id', params.project_id.toString());
    if (params?.client_id) q.append('client_id', params.client_id.toString());
    if (params?.doc_type) q.append('doc_type', params.doc_type);
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return request<DocumentItem[]>(`/documents${queryStr}`);
  },
  generateDocument: (doc_type: string, ref_id: number) =>
    request<{ message: string; file_path: string; document: DocumentItem }>('/documents/generate', {
      method: 'POST',
      body: JSON.stringify({ doc_type, ref_id }),
    }),
  getWhatsAppLink: (document_id: number) =>
    request<{ whatsapp_url: string; message_text: string; client_phone: string }>(
      `/documents/${document_id}/whatsapp-link`
    ),
  downloadDocumentUrl: (document_id: number) => `/api/documents/${document_id}/download`,

  // Team
  getTeamMembers: () => request<any[]>('/team'),
  assignMember: (data: { project_id: number; user_id: number; role_in_project: string; notes?: string }) =>
    request<any>('/team/assign', { method: 'POST', body: JSON.stringify(data) }),
  removeMember: (id: number) => request<{ message: string }>(`/team/assign/${id}`, { method: 'DELETE' }),

  // Settings
  getSettings: () => request<StudioSetting>('/settings'),
  updateSettings: (data: Partial<StudioSetting>) =>
    request<StudioSetting>('/settings', { method: 'PUT', body: JSON.stringify(data) }),
};
