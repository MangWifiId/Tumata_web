import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  { name: 'Dimas Anggara', role: 'Admin / Pemilik', email: 'admin@tumata.com', password: 'admin123' },
  { name: 'Budi Santoso', role: 'Fotografer', email: 'budi@tumata.com', password: 'budi123' },
  { name: 'Reza Pratama', role: 'Videografer', email: 'reza@tumata.com', password: 'reza123' },
  { name: 'Siti Rahayu', role: 'Editor Foto', email: 'siti@tumata.com', password: 'siti123' },
  { name: 'Dani Firmansyah', role: 'Editor Video', email: 'dani@tumata.com', password: 'dani123' },
  { name: 'Maya Wulandari', role: 'Koordinator Acara', email: 'maya@tumata.com', password: 'maya123' },
];

export const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@tumata.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.login({ email, password });
      login(res.token, res.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa kembali email dan kata sandi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <img
              src="/assets/tumata-logo.png"
              alt="TUMATA"
              className="h-14 w-auto mx-auto mb-3"
            />
            <p className="text-xs uppercase tracking-widest text-emerald-700 font-semibold mt-1">
              Wedding Studio Management System
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@tumata.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-semibold text-sm shadow-lg shadow-emerald-800/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials helper */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold text-center mb-3">
              Daftar Akun Demo — klik untuk mengisi
            </p>
            <div className="space-y-1.5">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword(acc.password);
                    setError(null);
                  }}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/60 transition text-left"
                >
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold text-slate-700 truncate">
                      {acc.name}
                    </span>
                    <span className="block text-[10px] text-slate-400">{acc.role}</span>
                  </span>
                  <span className="text-right shrink-0">
                    <span className="block text-[11px] font-mono text-slate-600">{acc.email}</span>
                    <span className="block text-[10px] font-mono text-slate-400">{acc.password}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
