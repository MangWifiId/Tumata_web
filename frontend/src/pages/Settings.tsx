import React, { useEffect, useState } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Building,
  CreditCard,
  FileText,
  Phone,
  Mail,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { StudioSetting } from '../types';

export const Settings: React.FC = () => {
  const [setting, setSetting] = useState<StudioSetting>({
    studio_name: 'TUMATA Wedding Studio',
    tagline: 'Capturing Every Sacred Moment with Elegance',
    address: 'Jl. Melati Indah No. 88, Jakarta Selatan',
    phone: '+62 812-3456-7890',
    whatsapp: '6281234567890',
    email: 'hello@tumatawedding.com',
    bank_name: 'Bank Central Asia (BCA)',
    bank_account: '8830192831',
    bank_holder: 'TUMATA CREATIVE STUDIO',
    signer_name: 'Dimas Anggara',
    signer_role: 'Studio Director & Lead Artist',
    terms_and_conditions:
      '1. Pembayaran DP minimal 30% untuk mengamankan tanggal acara.\n2. Pelunasan dilakukan maksimal 7 hari sebelum acara.\n3. Hasil dokumentasi diserahkan maksimal 21 hari kerja.',
    logo_path: 'assets/tumata-logo.png',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getSettings();
      if (data) setSetting(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.updateSettings(setting);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Pengaturan Studio & Branding</h2>
          <p className="text-xs text-slate-500">
            Atur identitas resmi studio, rekening bank pembayaran, penandatangan, dan template syarat kontrak
          </p>
        </div>

        {savedSuccess && (
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 animate-in fade-in">
            ✓ Pengaturan berhasil disimpan!
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Studio Identity Box */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Identitas Visual & Studio</h3>
              <p className="text-[11px] text-slate-500">Kop surat dan logo resmi pada dokumen PDF</p>
            </div>
          </div>

          <div className="flex items-center gap-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center">
              <img
                src="/assets/tumata-logo.png"
                alt="Logo TUMATA"
                className="h-12 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="text-xs">
              <span className="font-bold text-slate-800 block">Logo Resmi TUMATA</span>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Logo resmi format PNG transparan dengan identitas warna hijau zamrud studio.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Studio *</label>
              <input
                type="text"
                required
                value={setting.studio_name}
                onChange={(e) => setSetting({ ...setting, studio_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tagline / Deskripsi Layanan</label>
              <input
                type="text"
                value={setting.tagline}
                onChange={(e) => setSetting({ ...setting, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Alamat Studio *</label>
              <input
                type="text"
                required
                value={setting.address}
                onChange={(e) => setSetting({ ...setting, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp *</label>
              <input
                type="text"
                required
                value={setting.whatsapp}
                onChange={(e) => setSetting({ ...setting, whatsapp: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Resmi *</label>
              <input
                type="email"
                required
                value={setting.email}
                onChange={(e) => setSetting({ ...setting, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bank Account Box */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Rekening Pembayaran Studio</h3>
              <p className="text-[11px] text-slate-500">Tercantum pada instruksi pembayaran Invoice & Penawaran</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Bank *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Bank Central Asia (BCA)"
                value={setting.bank_name}
                onChange={(e) => setSetting({ ...setting, bank_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor Rekening *</label>
              <input
                type="text"
                required
                placeholder="883019xxxx"
                value={setting.bank_account}
                onChange={(e) => setSetting({ ...setting, bank_account: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Atas Nama Rekening *</label>
              <input
                type="text"
                required
                placeholder="TUMATA CREATIVE STUDIO"
                value={setting.bank_holder}
                onChange={(e) => setSetting({ ...setting, bank_holder: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Signer & Legal Terms Box */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Penandatangan & Syarat Layanan</h3>
              <p className="text-[11px] text-slate-500">Tanda tangan resmi dan klausul syarat & ketentuan</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Penandatangan Resmi *</label>
              <input
                type="text"
                required
                placeholder="Dimas Anggara"
                value={setting.signer_name}
                onChange={(e) => setSetting({ ...setting, signer_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jabatan / Role Penandatangan *</label>
              <input
                type="text"
                required
                placeholder="Studio Director & Founder"
                value={setting.signer_role}
                onChange={(e) => setSetting({ ...setting, signer_role: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Syarat & Ketentuan Pembayaran dan Layanan (T&C Template)
              </label>
              <textarea
                rows={5}
                value={setting.terms_and_conditions}
                onChange={(e) => setSetting({ ...setting, terms_and_conditions: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-md shadow-emerald-900/20 flex items-center gap-2 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Seluruh Pengaturan'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
