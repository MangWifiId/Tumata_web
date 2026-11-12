import React, { useEffect, useState } from 'react';
import {
  FolderArchive,
  Download,
  Printer,
  Send,
  Eye,
  Plus,
  Search,
  FileCheck,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { api, formatDate, formatDateTime } from '../services/api';
import { DocumentItem, Project } from '../types';
import { Modal } from '../components/common/Modal';

export const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('');

  // Generate modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [docType, setDocType] = useState('penawaran');
  const [selectedProjectId, setSelectedProjectId] = useState<number>(0);

  // Preview modal
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  useEffect(() => {
    loadDocuments();
    loadProjects();
  }, [typeFilter]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await api.getDocuments({
        doc_type: typeFilter || undefined,
      });
      setDocuments(data);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
      if (data.length > 0) {
        setSelectedProjectId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      alert('Pilih proyek terlebih dahulu');
      return;
    }
    try {
      // For invoice or kwitansi, we find or use relevant ref
      let refId = selectedProjectId;
      if (docType === 'invoice') {
        const fullProj = await api.getProject(selectedProjectId);
        if (fullProj.invoices && fullProj.invoices.length > 0) {
          refId = fullProj.invoices[0].id;
        } else {
          alert('Proyek ini belum memiliki tagihan invoice.');
          return;
        }
      } else if (docType === 'kwitansi') {
        const fullProj = await api.getProject(selectedProjectId);
        const verifiedPay = fullProj.payments?.find((p) => p.is_verified);
        if (verifiedPay) {
          refId = verifiedPay.id;
        } else {
          alert('Belum ada pembayaran yang terverifikasi untuk menerbitkan kwitansi sah.');
          return;
        }
      }

      const res = await api.generateDocument(docType, refId);
      alert(`${res.message}! File PDF resmi berhasil dibuat.`);
      setIsModalOpen(false);
      loadDocuments();
    } catch (err: any) {
      alert(err.message || 'Gagal menerbitkan dokumen');
    }
  };

  const handleShareWhatsApp = async (docId: number) => {
    try {
      const res = await api.getWhatsAppLink(docId);
      window.open(res.whatsapp_url, '_blank');
    } catch (err: any) {
      alert(err.message || 'Gagal membuka link WhatsApp');
    }
  };

  const handlePrint = (docId: number) => {
    const url = `/api/documents/${docId}/download`;
    const w = window.open(url, '_blank');
    if (w) {
      w.focus();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Dokumen & Berkas PDF</h2>
          <p className="text-xs text-slate-500">
            Penawaran harga, invoice tagihan, kwitansi pembayaran sah, dan surat perjanjian kontrak
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">Semua Dokumen</option>
            <option value="penawaran">Penawaran Harga</option>
            <option value="invoice">Invoice Tagihan</option>
            <option value="kwitansi">Kwitansi Sah</option>
            <option value="kontrak">Kontrak Kerja</option>
          </select>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Terbitkan Dokumen</span>
          </button>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mx-auto" />
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <FolderArchive className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p>Belum ada dokumen PDF yang diterbitkan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Jenis Dokumen</th>
                  <th className="py-3.5 px-4">No. Dokumen</th>
                  <th className="py-3.5 px-4">Klien Terkait</th>
                  <th className="py-3.5 px-4">Tanggal Terbit</th>
                  <th className="py-3.5 px-4">Snapshot & Integritas</th>
                  <th className="py-3.5 px-4 text-right">Aksi Dokumen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          doc.doc_type === 'kwitansi'
                            ? 'bg-teal-50 text-teal-800 border border-teal-200'
                            : doc.doc_type === 'invoice'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : doc.doc_type === 'kontrak'
                            ? 'bg-purple-50 text-purple-800 border border-purple-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {doc.doc_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {doc.document_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">
                        {doc.client?.name || doc.project?.client?.name || 'Klien'}
                      </span>
                      <span className="block text-[11px] text-slate-400">
                        {doc.project?.project_number}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {formatDateTime(doc.created_at)}
                    </td>
                    <td className="py-3.5 px-4 text-emerald-700 font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Snapshot Terkunci</span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        title="Lihat Pratinjau PDF"
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <a
                        href={`/api/documents/${doc.id}/download`}
                        target="_blank"
                        rel="noreferrer"
                        title="Unduh PDF"
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition inline-block"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handlePrint(doc.id)}
                        title="Cetak (Browser Print)"
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleShareWhatsApp(doc.id)}
                        title="Buka WhatsApp dengan pesan siap kirim"
                        className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] inline-flex items-center gap-1 transition shadow-xs"
                      >
                        <Send className="w-3 h-3" />
                        <span>Kirim WA</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Document Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Terbitkan Dokumen PDF Resmi"
      >
        <form onSubmit={handleGenerate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Jenis Dokumen *</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="penawaran">Penawaran Harga (Quotation)</option>
              <option value="invoice">Invoice Tagihan</option>
              <option value="kwitansi">Kwitansi Sah (Pembayaran Terverifikasi)</option>
              <option value="kontrak">Surat Perjanjian Kontrak Kerja</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pilih Proyek Klien *</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_number} — {p.client?.name} ({p.package?.name || 'Kustom'})
                </option>
              ))}
            </select>
          </div>

          <p className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
            Dokumen yang diterbitkan akan otomatis menyimpan identitas studio TUMATA, kop surat, nomor dokumen unik, snapshot data permanen, dan siap diunduh atau dikirim via WhatsApp.
          </p>

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
              Terbitkan Dokumen
            </button>
          </div>
        </form>
      </Modal>

      {/* PDF Preview Modal */}
      <Modal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        title={`Pratinjau: ${previewDoc?.doc_type?.toUpperCase()} — ${previewDoc?.document_number}`}
        maxWidth="4xl"
      >
        {previewDoc && (
          <div className="space-y-4">
            <div className="w-full h-[600px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <iframe
                src={`/api/documents/${previewDoc.id}/download`}
                className="w-full h-full"
                title="Preview PDF"
              />
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">File: {previewDoc.file_path}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrint(previewDoc.id)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-1.5 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak</span>
                </button>
                <button
                  onClick={() => handleShareWhatsApp(previewDoc.id)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center gap-1.5 transition"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
