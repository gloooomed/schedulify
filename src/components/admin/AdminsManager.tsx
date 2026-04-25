import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import Modal from '../ui/Modal';
import { Plus, Pencil, ShieldCheck, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Profile } from '../../types';

interface AdminForm { first_name: string; last_name: string; email: string; password: string; department: string; phone: string; }
const EMPTY: AdminForm = { first_name: '', last_name: '', email: '', password: '', department: '', phone: '' };

export default function AdminsManager() {
  const [admins, setAdmins] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Profile | null }>({ open: false, editing: null });
  const [form, setForm] = useState<AdminForm>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('profiles').select('*').in('role', ['admin']).order('first_name');
    setAdmins((data ?? []) as Profile[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.first_name || !form.last_name) return toast.error('Name is required');
    if (!modal.editing && (!form.email || !form.password)) return toast.error('Email and password required');
    setSaving(true);
    try {
      if (!modal.editing) {
        const { data, error } = await supabase.auth.signUp({ email: form.email, password: form.password });
        if (error || !data.user) throw new Error(error?.message ?? 'Failed to create account');
        const { error: pe } = await supabase.from('profiles').insert({
          id: data.user.id, role: 'admin', first_name: form.first_name, last_name: form.last_name,
          department: form.department || null, phone: form.phone || null, is_active: true,
        });
        if (pe) throw new Error(pe.message);
        toast.success(`Admin ${form.first_name} created. They can log in immediately.`);
      } else {
        const { error } = await supabase.from('profiles').update({
          first_name: form.first_name, last_name: form.last_name,
          department: form.department || null, phone: form.phone || null,
        }).eq('id', modal.editing.id);
        if (error) throw new Error(error.message);
        toast.success('Updated');
      }
      setModal({ open: false, editing: null }); load();
    } catch (e: any) { toast.error(e.message); }
    setSaving(false);
  };

  const toggleActive = async (u: Profile) => {
    await supabase.from('profiles').update({ is_active: !u.is_active }).eq('id', u.id);
    load();
  };

  const f = (k: keyof AdminForm) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-rose-400" />
          <h2 className="text-white font-semibold text-lg">College Admins <span className="text-slate-500 text-sm font-normal">({admins.length})</span></h2>
        </div>
        <button onClick={() => { setForm(EMPTY); setModal({ open: true, editing: null }); }} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          <Plus size={15} /> Create Admin
        </button>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-sm text-slate-400">
        Admins you create here can manage courses, faculty, students, classrooms, and timetables — but cannot create other admins.
      </div>

      {loading ? <div className="space-y-2">{Array(3).fill(0).map((_, i) => <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />)}</div>
        : admins.length === 0 ? <div className="text-center py-10 text-slate-500">No college admins yet. Create one to hand off operations.</div>
        : (
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 bg-white/5">
                <tr>{['Name', 'Department', 'Phone', 'Status', ''].map(h => <th key={h} className="text-left text-slate-400 text-xs font-semibold px-4 py-3">{h}</th>)}</tr>
              </thead>
              <tbody>
                {admins.map(u => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="px-4 py-3 text-white font-medium">{u.first_name} {u.last_name}</td>
                    <td className="px-4 py-3 text-slate-400">{u.department ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-400">{u.phone ?? '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(u)} className="flex items-center gap-1 text-xs">
                        {u.is_active ? <><ToggleRight size={18} className="text-emerald-400" /><span className="text-emerald-400">Active</span></> : <><ToggleLeft size={18} className="text-slate-500" /><span className="text-slate-500">Inactive</span></>}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setForm({ first_name: u.first_name, last_name: u.last_name, email: '', password: '', department: u.department ?? '', phone: u.phone ?? '' }); setModal({ open: true, editing: u }); }} className="text-slate-400 hover:text-white transition p-1"><Pencil size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      <Modal open={modal.open} onClose={() => setModal({ open: false, editing: null })} title={modal.editing ? 'Edit Admin' : 'Create College Admin'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">First Name *</label><input className="input" placeholder="Priya" value={form.first_name} onChange={f('first_name')} /></div>
            <div><label className="label">Last Name *</label><input className="input" placeholder="Verma" value={form.last_name} onChange={f('last_name')} /></div>
          </div>
          {!modal.editing && <>
            <div><label className="label">Email *</label><input className="input" type="email" placeholder="admin@college.edu" value={form.email} onChange={f('email')} /></div>
            <div><label className="label">Password *</label><input className="input" type="password" placeholder="min 8 characters" value={form.password} onChange={f('password')} /></div>
          </>}
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Department</label><input className="input" placeholder="Administration" value={form.department} onChange={f('department')} /></div>
            <div><label className="label">Phone</label><input className="input" type="tel" value={form.phone} onChange={f('phone')} /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal({ open: false, editing: null })} className="flex-1 btn-secondary">Cancel</button>
            <button onClick={save} disabled={saving} className="flex-1 btn-primary">{saving ? 'Creating…' : modal.editing ? 'Update' : 'Create Admin'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
