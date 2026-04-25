import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { verifyVendorCode, getAllColleges, type RegisteredCollege } from '../lib/vendor/registry';
import {
  GraduationCap, Lock, Eye, EyeOff, Loader2, Building2,
  CheckCircle2, XCircle, Zap, Calendar, Users, ArrowRight, Copy,
} from 'lucide-react';
import toast from 'react-hot-toast';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 30) return `${d} days ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function VendorDashboard() {
  const [code, setCode] = useState('');
  const [show, setShow] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [colleges, setColleges] = useState<RegisteredCollege[]>([]);
  const [loading, setLoading] = useState(false);

  const verify = () => {
    if (!verifyVendorCode(code)) { toast.error('Wrong access code'); return; }
    setAuthed(true);
  };

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    getAllColleges().then(data => {
      setColleges(data as RegisteredCollege[]);
      setLoading(false);
    });
  }, [authed]);

  const thisMonth = colleges.filter(c => {
    const d = new Date(c.setup_completed_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const withAI = colleges.filter(c => c.groq_configured).length;

  // ── Lock screen ──────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex w-14 h-14 bg-blue-600 rounded-2xl items-center justify-center mb-4">
              <GraduationCap size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Vendor Console</h1>
            <p className="text-slate-400 text-sm mt-1">Schedulify — Central Registry</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Lock size={15} className="text-blue-400" />
              Enter vendor access code to continue
            </div>
            <div className="relative">
              <input
                className="input font-mono tracking-widest pr-10"
                type={show ? 'text' : 'password'}
                placeholder="schedulify-xxxx-xxxx"
                value={code}
                onChange={e => setCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && verify()}
              />
              <button onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition">
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <button onClick={verify} className="w-full btn-primary py-2.5 flex items-center justify-center gap-2">
              Access Dashboard <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-white/5 bg-slate-900/60 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="text-white font-semibold">Schedulify</span>
            <span className="text-slate-600 text-sm">/ Vendor Console</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-medium">Live</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Colleges', value: colleges.length, icon: Building2, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
            { label: 'Registered This Month', value: thisMonth, icon: Calendar, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            { label: 'With AI Enabled', value: withAI, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className={`border rounded-2xl p-5 flex items-center gap-4 ${bg}`}>
              <div className={`p-2.5 rounded-xl bg-white/5`}>
                <Icon size={22} className={color} />
              </div>
              <div>
                <p className="text-slate-400 text-sm">{label}</p>
                <p className="text-white text-3xl font-bold">{loading ? '—' : value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-slate-400" />
              <h2 className="text-white font-semibold">Registered Colleges</h2>
            </div>
            <button onClick={() => { setLoading(true); getAllColleges().then(d => { setColleges(d as RegisteredCollege[]); setLoading(false); }); }}
              className="text-slate-400 hover:text-white text-xs transition">
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <Loader2 size={20} className="text-blue-400 animate-spin" />
              <span className="text-slate-400 text-sm">Loading registry…</span>
            </div>
          ) : colleges.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-sm">No colleges registered yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-white/10 bg-white/5">
                  <tr>
                    {['College', 'College ID & Link', 'Contact', 'AI', 'Plan', 'Registered'].map(h => (
                      <th key={h} className="text-left text-slate-500 text-xs font-semibold px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {colleges.map((c, i) => {
                    const shareUrl = `${window.location.origin}?college=${c.college_id}`;
                    return (
                      <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                        className="border-b border-white/5 hover:bg-white/5 transition">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 bg-blue-600/20 rounded-lg flex items-center justify-center shrink-0">
                              <Building2 size={13} className="text-blue-400" />
                            </div>
                            <span className="text-white font-medium">{c.college_name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="space-y-1">
                            <p className="font-mono text-sm font-bold text-blue-300">{c.college_id}</p>
                            <button
                              onClick={() => { navigator.clipboard.writeText(shareUrl); toast.success('Link copied!'); }}
                              className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-400 transition"
                            >
                              <Copy size={10} /> Copy login link
                            </button>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-slate-400">{c.contact_email ?? '—'}</td>
                        <td className="px-5 py-3">
                          {c.groq_configured
                            ? <span className="flex items-center gap-1 text-emerald-400 text-xs"><CheckCircle2 size={13} /> Enabled</span>
                            : <span className="flex items-center gap-1 text-slate-600 text-xs"><XCircle size={13} /> Not set</span>}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full border capitalize
                            ${c.plan === 'free' ? 'border-white/10 text-slate-500' : 'border-blue-500/40 text-blue-400'}`}>
                            {c.plan}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-500 text-xs">{timeAgo(c.setup_completed_at)}</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-center text-slate-700 text-xs">Schedulify Vendor Console · Data stored in your central Supabase registry</p>
      </main>
    </div>
  );
}
