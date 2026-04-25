import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import Modal from '../ui/Modal';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Department, Profile } from '../../types';

interface DeptForm {
  name: string;
  code: string;
  description: string;
  head_id: string;
}

const EMPTY: DeptForm = { name: '', code: '', description: '', head_id: '' };

export default function DepartmentsManager() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [faculty, setFaculty] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Department | null }>({ open: false, editing: null });
  const [form, setForm] = useState<DeptForm>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [{ data: depts }, { data: fac }] = await Promise.all([
      supabase.from('departments').select('*, profiles(id,first_name,last_name)').order('name'),
      supabase.from('profiles').select('id,first_name,last_name').eq('role', 'faculty').eq('is_active', true).order('first_name'),
    ]);
    setDepartments((depts ?? []) as Department[]);
    setFaculty((fac ?? []) as Profile[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(EMPTY); setModal({ open: true, editing: null }); };
  const openEdit = (d: Department) => {
    setForm({ name: d.name, code: d.code, description: d.description ?? '', head_id: d.head_id ?? '' });
    setModal({ open: true, editing: d });
  };

  const save = async () => {
    if (!form.name.trim() || !form.code.trim()) return toast.error('Name and code are required');
    setSaving(true);
    const payload = { name: form.name.trim(), code: form.code.trim().toUpperCase(), description: form.description || null, head_id: form.head_id || null };
    const { error } = modal.editing
      ? await supabase.from('departments').update(payload).eq('id', modal.editing.id)
      : await supabase.from('departments').insert(payload);
    if (error) toast.error(error.message);
    else { toast.success(modal.editing ? 'Department updated' : 'Department added'); setModal({ open: false, editing: null }); load(); }
    setSaving(false);
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete department "${name}"? This may affect related courses.`)) return;
    const { error } = await supabase.from('departments').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Deleted'); load(); }
  };

  const f = (k: keyof DeptForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 size={20} className="text-blue-400" />
          <h2 className="text-white font-semibold text-lg">Departments</h2>
          <span className="text-slate-500 text-sm">({departments.length})</span>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          <Plus size={15} /> Add Department
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{Array(4).fill(0).map((_, i) => <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />)}</div>
      ) : departments.length === 0 ? (
        <div className="text-center py-12 text-slate-500">No departments yet. Add one to get started.</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 bg-white/5">
              <tr>{['Code', 'Name', 'HOD', 'Description', ''].map(h => (
                <th key={h} className="text-left text-slate-400 text-xs font-semibold px-4 py-3">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {departments.map((d) => (
                <tr key={d.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-4 py-3 font-mono text-blue-400 text-xs font-bold">{d.code}</td>
                  <td className="px-4 py-3 text-white font-medium">{d.name}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {d.profiles ? `${d.profiles.first_name} ${d.profiles.last_name}` : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-400 max-w-xs truncate">{d.description ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(d)} className="text-slate-400 hover:text-white transition p-1"><Pencil size={14} /></button>
                      <button onClick={() => remove(d.id, d.name)} className="text-slate-400 hover:text-rose-400 transition p-1"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modal.open} onClose={() => setModal({ open: false, editing: null })} title={modal.editing ? 'Edit Department' : 'Add Department'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Department Name *</label>
              <input className="input" placeholder="Computer Science" value={form.name} onChange={f('name')} />
            </div>
            <div>
              <label className="label">Short Code *</label>
              <input className="input uppercase" placeholder="CS" value={form.code} onChange={f('code')} />
            </div>
          </div>
          <div>
            <label className="label">Head of Department</label>
            <select className="input" value={form.head_id} onChange={f('head_id')}>
              <option value="">— Select Faculty —</option>
              {faculty.map(f => <option key={f.id} value={f.id}>{f.first_name} {f.last_name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} placeholder="Brief description..." value={form.description} onChange={f('description')} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal({ open: false, editing: null })} className="flex-1 btn-secondary">Cancel</button>
            <button onClick={save} disabled={saving} className="flex-1 btn-primary">{saving ? 'Saving…' : modal.editing ? 'Update' : 'Add'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
