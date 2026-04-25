import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { configStore } from '../lib/config/store';
import { getCollegeConfig } from '../lib/vendor/registry';
import { resetSupabaseClient } from '../lib/supabase/client';
import {
  GraduationCap, LogIn, Settings2, Database, Zap, ShieldCheck,
  Loader2, ArrowRight, ChevronRight, Hash, AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const FEATURES = [
  { icon: Database, title: 'Your Own Database', desc: 'Hosted on your Supabase account', color: 'text-blue-400 bg-blue-500/10' },
  { icon: Zap, title: 'AI-Powered', desc: 'Groq for smart schedule parsing', color: 'text-amber-400 bg-amber-500/10' },
  { icon: ShieldCheck, title: 'Role-Based Access', desc: 'Admin, Faculty & Student portals', color: 'text-emerald-400 bg-emerald-500/10' },
];

export default function GatewayPage() {
  const navigate = useNavigate();
  const [showConnect, setShowConnect] = useState(false);
  const [collegeIdInput, setCollegeIdInput] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [autoConnecting, setAutoConnecting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Auto-connect if ?college=ID in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('college');
    if (id) {
      setAutoConnecting(true);
      connectById(id).finally(() => setAutoConnecting(false));
    }
  }, []);

  const connectById = async (id: string) => {
    setNotFound(false);
    const trimmed = id.trim().toUpperCase();
    if (!trimmed) return toast.error('Enter a College ID');

    // Check if vendor registry is configured
    const config = await getCollegeConfig(trimmed);

    if (!config) {
      setNotFound(true);
      return;
    }

    configStore.set({
      supabaseUrl: config.supabase_url,
      supabaseAnonKey: config.anon_key,
      collegeName: config.college_name,
      setupComplete: true,
    });
    resetSupabaseClient();
    toast.success(`Connected to ${config.college_name}`);
    navigate('/login');
  };

  const handleConnect = async () => {
    setConnecting(true);
    await connectById(collegeIdInput);
    setConnecting(false);
  };

  const handleLogin = () => {
    if (configStore.isReady()) {
      navigate('/login');
    } else {
      setShowConnect(true);
    }
  };

  // Full-screen auto-connecting state
  if (autoConnecting) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
          <GraduationCap size={24} className="text-white" />
        </div>
        <Loader2 size={24} className="text-blue-400 animate-spin" />
        <p className="text-slate-400 text-sm">Connecting to your college…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex w-[45%] flex-col bg-slate-900 border-r border-white/5 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex items-center gap-3 mb-16">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
            <GraduationCap size={22} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-xl leading-none">Schedulify</p>
            <p className="text-slate-500 text-xs mt-0.5">College Schedule Management</p>
          </div>
        </div>

        <div className="relative flex-1 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-white leading-snug mb-3">
            Smart scheduling<br />for modern colleges
          </h1>
          <p className="text-slate-400 text-base leading-relaxed mb-10">
            Manage departments, courses, faculty and timetables — all in one platform, on your own infrastructure.
          </p>
          <div className="space-y-3">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3.5">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                  <Icon size={17} />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{title}</p>
                  <p className="text-slate-500 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-slate-700 text-xs mt-8">
          © {new Date().getFullYear()} Schedulify · Your data stays in your Supabase
        </p>
      </div>

      {/* Right action panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <p className="text-white font-bold text-lg">Schedulify</p>
          </div>

          <AnimatePresence mode="wait">
            {!showConnect ? (
              <motion.div
                key="gateway"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white">Welcome</h2>
                  <p className="text-slate-400 text-sm mt-1.5">Select an option to continue</p>
                </div>

                {/* Login */}
                <button
                  onClick={handleLogin}
                  className="w-full group bg-blue-600 hover:bg-blue-500 transition-all rounded-2xl p-5 flex items-center gap-4 text-left shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30"
                >
                  <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
                    <LogIn size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">Login to my college</p>
                    <p className="text-blue-200 text-xs mt-0.5">Students, Faculty & Admins</p>
                  </div>
                  <ChevronRight size={18} className="text-blue-300 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Setup */}
                <button
                  onClick={() => navigate('/setup')}
                  className="w-full group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all rounded-2xl p-5 flex items-center gap-4 text-left"
                >
                  <div className="w-11 h-11 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shrink-0">
                    <Settings2 size={20} className="text-slate-300" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">Set up new college</p>
                    <p className="text-slate-500 text-xs mt-0.5">Connect Supabase & configure platform</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-600 group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-center text-slate-600 text-xs pt-2">
                  Need access? Contact your college IT admin.
                </p>
              </motion.div>
            ) : (
              /* College ID connect screen */
              <motion.div
                key="connect"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <button
                    onClick={() => { setShowConnect(false); setNotFound(false); }}
                    className="text-slate-500 hover:text-white text-xs flex items-center gap-1 mb-6 transition"
                  >
                    ← Back
                  </button>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
                      <Hash size={18} className="text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Enter College ID</h2>
                      <p className="text-slate-400 text-xs mt-0.5">Get this from your college IT admin</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="label">College ID</label>
                  <input
                    className="input font-mono text-lg tracking-[0.25em] text-center uppercase"
                    placeholder="DIT-K2X9"
                    value={collegeIdInput}
                    onChange={e => { setCollegeIdInput(e.target.value.toUpperCase()); setNotFound(false); }}
                    onKeyDown={e => e.key === 'Enter' && handleConnect()}
                    maxLength={12}
                  />
                  {notFound && (
                    <div className="flex items-center gap-2 mt-2 text-rose-400 text-xs">
                      <AlertTriangle size={13} />
                      College ID not found. Check with your admin.
                    </div>
                  )}
                </div>

                <button
                  onClick={handleConnect}
                  disabled={connecting || !collegeIdInput.trim()}
                  className="w-full btn-primary py-3 flex items-center justify-center gap-2 font-semibold text-base"
                >
                  {connecting ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                  {connecting ? 'Connecting…' : 'Connect & Login'}
                </button>

                <div className="bg-slate-800/60 border border-white/10 rounded-xl p-4 text-xs text-slate-500 space-y-1">
                  <p className="text-slate-300 font-medium">Where to find your College ID:</p>
                  <p>→ Ask your IT admin or check the welcome email</p>
                  <p>→ Or visit the link your admin shared (e.g. schedulify.app?college=DIT-K2X9)</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
