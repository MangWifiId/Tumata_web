import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  PieChart,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { api, formatRupiah } from '../services/api';

export const Reports: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await api.getFinancialReport();
      setReport(data);
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  const netProfit = report?.net_profit || 0;
  const verifiedRev = report?.total_verified_revenue || 0;
  const marginPercent = verifiedRev > 0 ? Math.round((netProfit / verifiedRev) * 100) : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Laporan & Analitik Studio</h2>
        <p className="text-xs text-slate-500">
          Analisis kinerja keuangan, realisasi pendapatan, alokasi biaya operasional, dan profitabilitas
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-slate-400 font-semibold text-xs uppercase block">Total Nilai Kontrak</span>
          <span className="text-2xl font-bold text-slate-900 mt-2 block">
            {formatRupiah(report?.total_contracts)}
          </span>
          <p className="text-xs text-slate-500 mt-1">Akumulasi seluruh booking wedding</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-slate-400 font-semibold text-xs uppercase block">Kas Diterima (Sah)</span>
          <span className="text-2xl font-bold text-emerald-700 mt-2 block">
            {formatRupiah(report?.total_verified_revenue)}
          </span>
          <p className="text-xs text-emerald-600 mt-1">Pembayaran telah diverifikasi</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-slate-400 font-semibold text-xs uppercase block">Pengeluaran & Honor</span>
          <span className="text-2xl font-bold text-rose-600 mt-2 block">
            {formatRupiah(report?.total_expenses)}
          </span>
          <p className="text-xs text-slate-500 mt-1">Honor tim, cetak, transportasi, sewa</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-slate-400 font-semibold text-xs uppercase block">Margin Laba Bersih</span>
          <span className="text-2xl font-bold text-teal-800 mt-2 block">
            {marginPercent}%
          </span>
          <p className="text-xs text-slate-500 mt-1">Laba: {formatRupiah(netProfit)}</p>
        </div>
      </div>

      {/* Expense Breakdown Table & Visual Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Alokasi Biaya Pengeluaran</h3>
          <p className="text-xs text-slate-500">Distribusi realisasi biaya operasional studio</p>

          <div className="space-y-3 pt-2">
            {report?.expense_breakdown && report.expense_breakdown.length > 0 ? (
              report.expense_breakdown.map((item: any) => {
                const percent = report.total_expenses > 0
                  ? Math.round((item.total / report.total_expenses) * 100)
                  : 0;
                return (
                  <div key={item.category} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">{item.category}</span>
                      <span className="text-slate-900">{formatRupiah(item.total)} ({percent}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-400 text-xs">Belum ada pengeluaran dicatat.</p>
            )}
          </div>
        </div>

        {/* Studio Health & Principles */}
        <div className="bg-emerald-950 text-white rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800 text-emerald-200 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Standar Pengelolaan Tumata</span>
            </div>
            <h3 className="text-lg font-bold font-serif text-emerald-100">
              Integritas & Akuntabilitas Finansial
            </h3>
            <p className="text-xs text-emerald-200/80 leading-relaxed">
              Sesuai aturan bisnis di README, penerbitan kwitansi hanya dilakukan dari transaksi yang terverifikasi via mutasi bank, dan seluruh dokumen yang diterbitkan mempertahankan snapshot permanen untuk menghindari perubahan harga tak terdokumentasi.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-900/60 border border-emerald-800/60 text-xs space-y-2">
            <div className="flex justify-between text-emerald-200">
              <span>Sisa Piutang Berjalan:</span>
              <strong className="text-white">{formatRupiah(report?.total_receivable)}</strong>
            </div>
            <div className="flex justify-between text-emerald-200">
              <span>Laba Bersih Realisasi:</span>
              <strong className="text-white">{formatRupiah(report?.net_profit)}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
