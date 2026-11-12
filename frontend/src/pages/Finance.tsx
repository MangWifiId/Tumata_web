import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  FileText,
  Filter,
} from 'lucide-react';
import { api, formatRupiah, formatDate } from '../services/api';
import { Invoice, Payment, Expense, Project } from '../types';
import { Modal } from '../components/common/Modal';

export const Finance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments' | 'expenses'>('invoices');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Forms
  const [invoiceForm, setInvoiceForm] = useState({
    project_id: 0,
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    item_desc: 'Pelunasan Layanan Paket Dokumentasi Wedding',
    item_qty: 1,
    item_price: 5000000,
    notes: 'Harap sertakan bukti transfer via WhatsApp studio.',
  });

  const [paymentForm, setPaymentForm] = useState({
    project_id: 0,
    invoice_id: undefined as number | undefined,
    amount: 5000000,
    payment_type: 'DP',
    payment_method: 'Transfer Bank',
    payment_date: new Date().toISOString().split('T')[0],
    reference_number: '',
    is_verified: true,
    notes: '',
  });

  const [expenseForm, setExpenseForm] = useState({
    project_id: undefined as number | undefined,
    category: 'Honor Tim',
    title: '',
    amount: 1000000,
    date: new Date().toISOString().split('T')[0],
    paid_to: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invs, pays, exps, projs, rep] = await Promise.all([
        api.getInvoices(),
        api.getPayments(),
        api.getExpenses(),
        api.getProjects(),
        api.getFinancialReport(),
      ]);
      setInvoices(invs);
      setPayments(pays);
      setExpenses(exps);
      setProjects(projs);
      setReport(rep);
      if (projs.length > 0) {
        setInvoiceForm((prev) => ({ ...prev, project_id: projs[0].id }));
        setPaymentForm((prev) => ({ ...prev, project_id: projs[0].id }));
      }
    } catch (err) {
      console.error('Failed to load finance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (id: number) => {
    try {
      await api.verifyPayment(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal memverifikasi');
    }
  };

  const handleGeneratePDF = async (docType: string, refId: number) => {
    try {
      const res = await api.generateDocument(docType, refId);
      alert(`${res.message}! File PDF tersimpan.`);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menerbitkan dokumen');
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createInvoice({
        project_id: invoiceForm.project_id,
        issue_date: new Date(invoiceForm.issue_date).toISOString(),
        due_date: new Date(invoiceForm.due_date).toISOString(),
        notes: invoiceForm.notes,
        terms: '',
        items: [
          {
            description: invoiceForm.item_desc,
            quantity: Number(invoiceForm.item_qty),
            unit_price: Number(invoiceForm.item_price),
            subtotal: Number(invoiceForm.item_qty) * Number(invoiceForm.item_price),
          },
        ],
      });
      setIsInvoiceModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal membuat invoice');
    }
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createPayment({
        project_id: paymentForm.project_id,
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
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal mencatat pembayaran');
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createExpense({
        project_id: expenseForm.project_id || undefined,
        category: expenseForm.category as any,
        title: expenseForm.title,
        amount: Number(expenseForm.amount),
        date: new Date(expenseForm.date).toISOString(),
        paid_to: expenseForm.paid_to,
        notes: expenseForm.notes,
      });
      setIsExpenseModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal mencatat pengeluaran');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Keuangan & Pembayaran</h2>
          <p className="text-xs text-slate-500">
            Kelola penagihan invoice, kwitansi pembayaran terverifikasi, dan pembukuan pengeluaran
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsInvoiceModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Invoice</span>
          </button>
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Pembayaran</span>
          </button>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Pengeluaran</span>
          </button>
        </div>
      </div>

      {/* Financial Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-xs">
        <div>
          <span className="text-slate-400 font-medium block">Total Nilai Kontrak</span>
          <span className="font-bold text-slate-900 text-sm">
            {formatRupiah(report?.total_contracts)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-medium block">Uang Diterima (Sah)</span>
          <span className="font-bold text-emerald-700 text-sm">
            {formatRupiah(report?.total_verified_revenue)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-medium block">Piutang Klien</span>
          <span className="font-bold text-amber-700 text-sm">
            {formatRupiah(report?.total_receivable)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-medium block">Total Pengeluaran</span>
          <span className="font-bold text-rose-600 text-sm">
            {formatRupiah(report?.total_expenses)}
          </span>
        </div>
        <div className="col-span-2 lg:col-span-1">
          <span className="text-slate-400 font-medium block">Laba Bersih Terverifikasi</span>
          <span className="font-bold text-teal-800 text-sm">
            {formatRupiah(report?.net_profit)}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-0.5 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2.5 border-b-2 transition ${
            activeTab === 'invoices'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Daftar Invoice ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 border-b-2 transition ${
            activeTab === 'payments'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Pembayaran & Kwitansi ({payments.length})
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2.5 border-b-2 transition ${
            activeTab === 'expenses'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Pengeluaran & Honor ({expenses.length})
        </button>
      </div>

      {/* TAB 1: INVOICES */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-4">No. Invoice</th>
                  <th className="py-3 px-4">Klien & Proyek</th>
                  <th className="py-3 px-4">Tanggal Jatuh Tempo</th>
                  <th className="py-3 px-4">Total Tagihan</th>
                  <th className="py-3 px-4">Sudah Dibayar</th>
                  <th className="py-3 px-4">Sisa Tagihan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-bold text-slate-800">{inv.invoice_number}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{inv.project?.client?.name}</span>
                      <span className="block text-[11px] text-slate-400">{inv.project?.project_number}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{formatDate(inv.due_date)}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{formatRupiah(inv.total_amount)}</td>
                    <td className="py-3 px-4 font-semibold text-emerald-700">{formatRupiah(inv.paid_amount)}</td>
                    <td className="py-3 px-4 font-bold text-rose-600">{formatRupiah(inv.remaining_amount)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700'
                            : inv.status === 'partial'
                            ? 'bg-sky-50 text-sky-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleGeneratePDF('invoice', inv.id)}
                        className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-[11px] transition"
                      >
                        Terbitkan PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-4">No. Kwitansi</th>
                  <th className="py-3 px-4">Klien & Proyek</th>
                  <th className="py-3 px-4">Tanggal Pembayaran</th>
                  <th className="py-3 px-4">Jenis & Metode</th>
                  <th className="py-3 px-4">Nominal Masuk</th>
                  <th className="py-3 px-4">Status Verifikasi</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-bold text-slate-800">{pay.receipt_number}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{pay.project?.client?.name}</span>
                      <span className="block text-[11px] text-slate-400">{pay.project?.project_number}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{formatDate(pay.payment_date)}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{pay.payment_type}</span>
                      <span className="block text-[11px] text-slate-500">{pay.payment_method}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700 text-sm">
                      {formatRupiah(pay.amount)}
                    </td>
                    <td className="py-3 px-4">
                      {pay.is_verified ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                          Terverifikasi
                        </span>
                      ) : (
                        <button
                          onClick={() => handleVerifyPayment(pay.id)}
                          className="px-2 py-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 text-[10px] font-bold transition"
                        >
                          Verifikasi Pembayaran
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {pay.is_verified ? (
                        <button
                          onClick={() => handleGeneratePDF('kwitansi', pay.id)}
                          className="px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-[11px] transition"
                        >
                          Kwitansi PDF
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Verifikasi dulu</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: EXPENSES */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Keperluan / Keterangan</th>
                  <th className="py-3 px-4">Proyek Terkait</th>
                  <th className="py-3 px-4">Penerima Dana</th>
                  <th className="py-3 px-4 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 text-slate-600">{formatDate(exp.date)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{exp.title}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {exp.project?.client?.name || 'Operasional Studio'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{exp.paid_to || '-'}</td>
                    <td className="py-3 px-4 font-bold text-rose-600 text-right">
                      {formatRupiah(exp.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Buat Invoice */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Buat Invoice Tagihan Baru"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pilih Proyek Klien *</label>
            <select
              value={invoiceForm.project_id}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, project_id: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_number} — {p.client?.name} (Sisa Tagihan: {formatRupiah(p.remaining_amount)})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Terbit</label>
              <input
                type="date"
                required
                value={invoiceForm.issue_date}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, issue_date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jatuh Tempo *</label>
              <input
                type="date"
                required
                value={invoiceForm.due_date}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Deskripsi Item Tagihan *</label>
            <input
              type="text"
              required
              value={invoiceForm.item_desc}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, item_desc: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Total Tagihan (Rp) *</label>
            <input
              type="number"
              required
              value={invoiceForm.item_price}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, item_price: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsInvoiceModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
            >
              Simpan & Terbitkan
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Catat Pembayaran */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Catat Pembayaran Masuk"
      >
        <form onSubmit={handleCreatePayment} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pilih Proyek Klien *</label>
            <select
              value={paymentForm.project_id}
              onChange={(e) => setPaymentForm({ ...paymentForm, project_id: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_number} — {p.client?.name} (Sisa: {formatRupiah(p.remaining_amount)})
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
                <option value="DP">DP</option>
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
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_verif2"
              checked={paymentForm.is_verified}
              onChange={(e) => setPaymentForm({ ...paymentForm, is_verified: e.target.checked })}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="is_verif2" className="text-slate-700 font-medium cursor-pointer">
              Verifikasi Langsung (Kwitansi sah dapat diterbitkan)
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

      {/* MODAL: Catat Pengeluaran */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Catat Pengeluaran Biaya"
      >
        <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Kategori Pengeluaran</label>
            <select
              value={expenseForm.category}
              onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="Honor Tim">Honor Tim</option>
              <option value="Transportasi">Transportasi</option>
              <option value="Konsumsi">Konsumsi</option>
              <option value="Sewa Alat">Sewa Alat</option>
              <option value="Cetak Album/Frame">Cetak Album/Frame</option>
              <option value="Vendor Luar">Vendor Luar</option>
              <option value="Lain-lain">Lain-lain</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Keterangan Biaya *</label>
            <input
              type="text"
              required
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
    </div>
  );
};
