import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { configStore } from '../lib/config/store';
import { testSupabaseConnection, resetSupabaseClient, getSupabase } from '../lib/supabase/client';
import { testGroqConnection } from '../lib/groq/client';
import { verifyVendorCode, registerCollege, generateCollegeId } from '../lib/vendor/registry';
import {
  Lock, GraduationCap, Database, Zap, ShieldCheck, CheckCircle2,
  Eye, EyeOff, Loader2, ArrowRight, AlertTriangle, Copy, Check, Building2, Link,
} from 'lucide-react';
import toast from 'react-hot-toast';

type Step = 'access' | 'college' | 'database' | 'schema' | 'ai' | 'superadmin' | 'done';
const STEPS: Step[] = ['access', 'college', 'database', 'schema', 'ai', 'superadmin', 'done'];

const SIDE_STEPS = [
  { id: 'access', label: 'Access Code', icon: Lock },
  { id: 'college', label: 'College Info', icon: Building2 },
  { id: 'database', label: 'Database', icon: Database },
  { id: 'schema', label: 'Schema Setup', icon: ShieldCheck },
  { id: 'ai', label: 'AI Engine', icon: Zap },
  { id: 'superadmin', label: 'Master Admin', icon: GraduationCap },
];

interface Props { onComplete: () => void; }

export default function SetupWizard({ onComplete }: Props) {
  const [step, setStep] = useState<Step>('access');
  const [vendorCode, setVendorCode] = useState('');
  const [showVendorCode, setShowVendorCode] = useState(false);
  const [collegeName, setCollegeName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [groqKey, setGroqKey] = useState('');
  const [showGroq, setShowGroq] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [testing, setTesting] = useState(false);
  const [dbTested, setDbTested] = useState<boolean | null>(null);
  const [groqTested, setGroqTested] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [schemaCopied, setSchemaCopied] = useState(false);
  const [collegeId, setCollegeId] = useState('');
  const [urlCopied, setUrlCopied] = useState(false);

  const stepIndex = STEPS.indexOf(step);
  const goNext = () => setStep(STEPS[stepIndex + 1]);

  const verifyAccess = () => {
    if (!verifyVendorCode(vendorCode)) {
      toast.error('Invalid access code. Contact Schedulify support.');
      return;
    }
    toast.success('Access granted!');
    goNext();
  };

  const testDb = async () => {
    if (!supabaseUrl || !supabaseKey) return toast.error('Enter URL and key first');
    setTesting(true); setDbTested(null);
    const { ok, normalizedUrl } = await testSupabaseConnection(supabaseUrl.trim(), supabaseKey.trim());
    setDbTested(ok);
    setTesting(false);
    if (ok) {
      setSupabaseUrl(normalizedUrl); // Auto-correct the URL in the field
      configStore.set({ supabaseUrl: normalizedUrl, supabaseAnonKey: supabaseKey.trim() });
      resetSupabaseClient();
      toast.success('Connected!');
    } else {
      toast.error('Connection failed — check your URL and key');
    }
  };

  const testGroq = async () => {
    if (!groqKey) return toast.error('Enter API key first');
    setTesting(true); setGroqTested(null);
    const ok = await testGroqConnection(groqKey.trim());
    setGroqTested(ok);
    setTesting(false);
    if (ok) { configStore.set({ groqApiKey: groqKey.trim() }); toast.success('Groq connected!'); }
    else toast.error('Invalid Groq API key');
  };

  const copySchema = async () => {
    try {
      const res = await fetch('/supabase/migrations/001_schema.sql');
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setSchemaCopied(true);
      setTimeout(() => setSchemaCopied(false), 3000);
      toast.success('SQL copied!');
    } catch { toast.error('Could not copy — open SQL file manually'); }
  };

  const createSuperAdmin = async () => {
    if (!firstName || !lastName || !email || !password) return toast.error('All fields required');
    if (password.length < 8) return toast.error('Password must be at least 8 characters');
    setSaving(true);
    try {
      const sb = getSupabase();
      let userId: string | null = null;

      const { data: signUpData, error: signUpError } = await sb.auth.signUp({ email, password });

      if (signUpError) {
        const isRateLimit = signUpError.message.toLowerCase().includes('after');
        const isExists = signUpError.message.toLowerCase().includes('already');
        if (isRateLimit || isExists) {
          const { data: signInData, error: signInError } = await sb.auth.signInWithPassword({ email, password });
          if (signInError) throw new Error('Account exists but password is wrong, or wait 40s and retry.');
          userId = signInData.user?.id ?? null;
        } else {
          throw new Error(signUpError.message);
        }
      } else {
        userId = signUpData.user?.id ?? null;
      }

      if (!userId) throw new Error('Could not get user ID. Please retry.');

      const { error: pe } = await sb.from('profiles').upsert({
        id: userId, role: 'super_admin',
        first_name: firstName, last_name: lastName, is_active: true,
      }, { onConflict: 'id' });
      if (pe) throw new Error(pe.message);

      // Generate College ID and register in vendor registry
      const id = generateCollegeId(collegeName || 'College');
      setCollegeId(id);
      configStore.set({ collegeName: collegeName || 'My College', setupComplete: true });
      await registerCollege({
        college_id: id,
        college_name: collegeName,
        contact_email: contactEmail,
        supabase_url: supabaseUrl,
        anon_key: supabaseKey,
        groq_configured: !!groqKey,
      });
      setStep('done');
    } catch (e: any) { toast.error(e.message); }
    setSaving(false);
  };

  const isCompleted = (s: string) => stepIndex > STEPS.indexOf(s as Step);
  const isCurrent = (s: string) => step === s;

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-80 shrink-0 flex-col bg-slate-900 border-r border-white/5 p-8">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <GraduationCap size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none">Schedulify</p>
            <p className="text-slate-500 text-xs mt-0.5">Setup Wizard</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {SIDE_STEPS.map(({ id, label, icon: Icon }) => {
            const done = isCompleted(id);
            const active = isCurrent(id);
            return (
              <div key={id} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                ${active ? 'bg-blue-600/20 border border-blue-500/30' : 'border border-transparent'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all
                  ${done ? 'bg-emerald-500' : active ? 'bg-blue-600' : 'bg-white/5 border border-white/10'}`}>
                  {done ? <Check size={13} className="text-white" /> : <Icon size={13} className={active ? 'text-white' : 'text-slate-500'} />}
                </div>
                <span className={`text-sm font-medium transition-colors ${active ? 'text-white' : done ? 'text-slate-400' : 'text-slate-600'}`}>{label}</span>
              </div>
            );
          })}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5">
          <p className="text-slate-600 text-xs leading-relaxed">
            Your college data stays in your own Supabase. Schedulify never stores your student or academic records.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >

              {/* ACCESS CODE */}
              {step === 'access' && (
                <div className="space-y-6">
                  <div>
                    <div className="inline-flex w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl items-center justify-center mb-4">
                      <Lock size={22} className="text-blue-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Enter Access Code</h1>
                    <p className="text-slate-400 mt-1.5 text-sm">Contact <span className="text-blue-400">schedulify.app/contact</span> to get your unique access code.</p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-slate-400 flex gap-2.5">
                    <Lock size={15} className="text-amber-400 shrink-0 mt-0.5" />
                    <p>Schedulify is a licensed platform. An access code is required to set up a new college instance.</p>
                  </div>
                  <div>
                    <label className="label">Access Code</label>
                    <div className="relative">
                      <input
                        className="input pr-10 font-mono tracking-widest"
                        type={showVendorCode ? 'text' : 'password'}
                        placeholder="schedulify-xxxx-xxxx"
                        value={vendorCode}
                        onChange={e => setVendorCode(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && verifyAccess()}
                      />
                      <button onClick={() => setShowVendorCode(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition">
                        {showVendorCode ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <button onClick={verifyAccess} className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-base font-semibold">
                    Verify & Continue <ArrowRight size={17} />
                  </button>
                </div>
              )}

              {/* COLLEGE INFO */}
              {step === 'college' && (
                <div className="space-y-6">
                  <div>
                    <div className="inline-flex w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl items-center justify-center mb-4">
                      <Building2 size={22} className="text-emerald-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Your Institution</h1>
                    <p className="text-slate-400 mt-1.5 text-sm">Basic info about your college. This appears throughout the platform.</p>
                  </div>
                  <div>
                    <label className="label">College / Institution Name *</label>
                    <input className="input text-base" placeholder="Delhi Institute of Technology" value={collegeName} onChange={e => setCollegeName(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Admin Contact Email</label>
                    <input className="input" type="email" placeholder="admin@college.edu" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
                    <p className="text-slate-600 text-xs mt-1.5">Used for support and platform updates.</p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setStep('access')} className="btn-secondary px-5">←</button>
                    <button onClick={() => { if (!collegeName.trim()) return toast.error('College name required'); goNext(); }} className="flex-1 btn-primary flex items-center justify-center gap-2">
                      Continue <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* DATABASE */}
              {step === 'database' && (
                <div className="space-y-6">
                  <div>
                    <div className="inline-flex w-12 h-12 bg-sky-500/10 border border-sky-500/20 rounded-xl items-center justify-center mb-4">
                      <Database size={22} className="text-sky-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Connect Database</h1>
                    <p className="text-slate-400 mt-1.5 text-sm">Create a free project at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">supabase.com</a> then paste your credentials.</p>
                  </div>
                  <div className="bg-slate-800/60 border border-white/10 rounded-xl p-4 text-xs text-slate-400 space-y-1">
                    <p className="font-semibold text-slate-300">Where to find these:</p>
                    <p>Supabase Dashboard → Settings → API → <span className="text-white">Project URL</span> + <span className="text-white">anon / public key</span></p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="label">Project URL *</label>
                      <input className="input font-mono text-xs" placeholder="https://xxxxxxxxxxxx.supabase.co" value={supabaseUrl} onChange={e => { setSupabaseUrl(e.target.value); setDbTested(null); }} />
                      <p className="text-slate-600 text-xs mt-1.5">You can also paste just the project ID (e.g. <span className="text-slate-500 font-mono">xyzabcdef</span>) — we'll auto-format it.</p>
                    </div>
                    <div>
                      <label className="label">Anon / Public Key *</label>
                      <div className="relative">
                        <input className="input font-mono text-xs pr-10" type={showKey ? 'text' : 'password'} placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." value={supabaseKey} onChange={e => { setSupabaseKey(e.target.value); setDbTested(null); }} />
                        <button onClick={() => setShowKey(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition">
                          {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      <p className="text-slate-600 text-xs mt-1.5">✓ This is the public anon key — safe to use client-side.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep('college')} className="btn-secondary px-5">←</button>
                    <button onClick={testDb} disabled={testing} className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-lg transition border
                      ${dbTested === true ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-400' : dbTested === false ? 'bg-rose-600/20 border-rose-500/40 text-rose-400' : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'}`}>
                      {testing ? <Loader2 size={14} className="animate-spin" /> : dbTested === true ? <CheckCircle2 size={14} /> : dbTested === false ? <AlertTriangle size={14} /> : <Database size={14} />}
                      {testing ? 'Testing…' : dbTested === true ? 'Connected ✓' : dbTested === false ? 'Failed — retry' : 'Test Connection'}
                    </button>
                    <button onClick={() => { if (!dbTested) return toast.error('Test connection first'); goNext(); }} className="flex-1 btn-primary flex items-center justify-center gap-2">
                      Next <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* SCHEMA */}
              {step === 'schema' && (
                <div className="space-y-6">
                  <div>
                    <div className="inline-flex w-12 h-12 bg-violet-500/10 border border-violet-500/20 rounded-xl items-center justify-center mb-4">
                      <ShieldCheck size={22} className="text-violet-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Database Schema</h1>
                    <p className="text-slate-400 mt-1.5 text-sm">Run our SQL in your Supabase to create all tables and security policies.</p>
                  </div>
                  <div className="bg-slate-800/80 border border-white/10 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-rose-500/60" />
                        <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                      </div>
                      <button onClick={copySchema} className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition font-medium">
                        {schemaCopied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy SQL</>}
                      </button>
                    </div>
                    <div className="px-4 py-3 font-mono text-xs text-slate-500 space-y-0.5">
                      <p className="text-slate-400">CREATE EXTENSION IF NOT EXISTS "uuid-ossp";</p>
                      <p>CREATE TABLE profiles ( id UUID PRIMARY KEY ... );</p>
                      <p>CREATE TABLE departments ( ... );</p>
                      <p>CREATE TABLE courses ( ... );  <span className="text-slate-600">-- no student limits</span></p>
                      <p>CREATE TABLE timetables ( ... );</p>
                      <p className="text-slate-600">-- + RLS policies for each role</p>
                    </div>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <p className="text-amber-300 font-medium text-sm mb-2">Steps:</p>
                    <ol className="text-slate-400 text-xs space-y-1.5 list-decimal list-inside">
                      <li>Click <strong className="text-white">Copy SQL</strong> above</li>
                      <li>Open <strong className="text-white">supabase.com → your project → SQL Editor</strong></li>
                      <li>Paste and click <strong className="text-white">Run</strong></li>
                      <li>Come back and click Continue</li>
                    </ol>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-xs text-slate-400 space-y-1">
                    <p className="text-blue-300 font-semibold">⚡ Important — disable email confirmation:</p>
                    <p>Supabase Dashboard → <strong className="text-white">Authentication → Providers → Email</strong> → turn OFF <strong className="text-white">"Confirm email"</strong> → Save.</p>
                    <p className="text-slate-600">Without this, you'll get a rate-limit error when logging in after setup.</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep('database')} className="btn-secondary px-5">←</button>
                    <button onClick={goNext} className="flex-1 btn-primary flex items-center justify-center gap-2">
                      I've run it — Continue <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* AI */}
              {step === 'ai' && (
                <div className="space-y-6">
                  <div>
                    <div className="inline-flex w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl items-center justify-center mb-4">
                      <Zap size={22} className="text-amber-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">AI Engine</h1>
                    <p className="text-slate-400 mt-1.5 text-sm">Get a free key at <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">console.groq.com</a> — no credit card needed.</p>
                  </div>
                  <div>
                    <label className="label">Groq API Key</label>
                    <div className="relative">
                      <input className="input font-mono text-xs pr-10" type={showGroq ? 'text' : 'password'} placeholder="gsk_..." value={groqKey} onChange={e => { setGroqKey(e.target.value); setGroqTested(null); }} />
                      <button onClick={() => setShowGroq(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition">
                        {showGroq ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  <div className="bg-slate-800/60 border border-white/10 rounded-xl p-4 text-xs text-slate-500">
                    Used for: parsing uploaded schedule files, detecting timetable conflicts. The system fully works without AI — you can skip this.
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep('schema')} className="btn-secondary px-5">←</button>
                    <button onClick={testGroq} disabled={testing || !groqKey} className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-lg transition border
                      ${groqTested === true ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'}`}>
                      {testing ? <Loader2 size={14} className="animate-spin" /> : groqTested === true ? <CheckCircle2 size={14} /> : <Zap size={14} />}
                      {testing ? 'Testing…' : groqTested === true ? 'Connected ✓' : 'Test Key'}
                    </button>
                    <button onClick={() => { if (groqKey && !groqTested) return toast.error('Test your key or clear it to skip'); goNext(); }} className="flex-1 btn-primary flex items-center justify-center gap-2">
                      {groqKey ? 'Next' : 'Skip'} <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* SUPER ADMIN */}
              {step === 'superadmin' && (
                <div className="space-y-6">
                  <div>
                    <div className="inline-flex w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-xl items-center justify-center mb-4">
                      <GraduationCap size={22} className="text-rose-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Master Admin Account</h1>
                    <p className="text-slate-400 mt-1.5 text-sm">This account has full control — creating other admins, managing the entire system.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="label">First Name *</label><input className="input" placeholder="Rajesh" value={firstName} onChange={e => setFirstName(e.target.value)} /></div>
                    <div><label className="label">Last Name *</label><input className="input" placeholder="Kumar" value={lastName} onChange={e => setLastName(e.target.value)} /></div>
                  </div>
                  <div><label className="label">Email *</label><input className="input" type="email" placeholder="admin@college.edu" value={email} onChange={e => setEmail(e.target.value)} /></div>
                  <div>
                    <label className="label">Password * (min 8 chars)</label>
                    <div className="relative">
                      <input className="input pr-10" type={showPass ? 'text' : 'password'} placeholder="Strong password" value={password} onChange={e => setPassword(e.target.value)} />
                      <button onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition">
                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep('ai')} className="btn-secondary px-5">←</button>
                    <button onClick={createSuperAdmin} disabled={saving} className="flex-1 btn-primary flex items-center justify-center gap-2">
                      {saving ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
                      {saving ? 'Creating…' : 'Create & Finish Setup'}
                    </button>
                  </div>
                </div>
              )}

              {/* DONE */}
              {step === 'done' && (() => {
                const shareUrl = `${window.location.origin}?college=${collegeId}`;
                const copyUrl = () => {
                  navigator.clipboard.writeText(shareUrl);
                  setUrlCopied(true);
                  setTimeout(() => setUrlCopied(false), 2500);
                  toast.success('URL copied!');
                };
                return (
                  <div className="space-y-5">
                    <div className="text-center">
                      <div className="inline-flex w-14 h-14 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={30} className="text-emerald-400" />
                      </div>
                      <h1 className="text-2xl font-bold text-white">{collegeName} is ready!</h1>
                      <p className="text-slate-400 mt-1.5 text-sm">Share the link below with your students, faculty and admins.</p>
                    </div>

                    {/* College ID card */}
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-5 text-center">
                      <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Your College ID</p>
                      <p className="text-4xl font-bold font-mono text-blue-300 tracking-widest mb-1">{collegeId}</p>
                      <p className="text-slate-600 text-xs">Anyone can use this ID to connect to your college</p>
                    </div>

                    {/* Shareable URL */}
                    <div className="bg-slate-800/80 border border-white/10 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <Link size={13} className="text-slate-400" />
                          <span className="text-slate-400 text-xs font-medium">Shareable login link</span>
                        </div>
                        <button onClick={copyUrl} className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium transition">
                          {urlCopied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                        </button>
                      </div>
                      <p className="px-4 py-3 font-mono text-xs text-slate-400 break-all">{shareUrl}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      {[
                        { label: 'Database', ok: true },
                        { label: 'Schema installed', ok: true },
                        { label: 'AI engine', ok: !!groqKey },
                        { label: 'Master admin', ok: true },
                      ].map(({ label, ok }) => (
                        <div key={label} className={`p-2.5 rounded-lg border flex items-center gap-2
                          ${ok ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                          {ok ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                          {label}{!ok ? ' (skipped)' : ''}
                        </div>
                      ))}
                    </div>

                    <button onClick={() => { window.location.replace('/login'); }} className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-base font-semibold">
                      Go to Login <ArrowRight size={17} />
                    </button>
                  </div>
                );
              })()}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
