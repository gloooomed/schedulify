import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import Modal from '../ui/Modal';
import { Plus, Pencil, Trash2, Calendar, Globe, Archive } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Timetable, Department } from '../../types';

interface TTForm { name: string; department_id: string; academic_year: string; semester: string; }
const EMPTY: TTForm = { name: '', department_id: '', academic_year: '', semester: '' };

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-slate-500/20 text-slate-400',
  published: 'bg-emerald-500/20 text-emerald-400',
  archived: 'bg-rose-500/20 text-rose-400',
};

export default function TimetablesManager() {
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Timetable | null }>({ open: false, editing: null });
  const [form, setForm] = useState<TTForm>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [{ data: tt }, { data: d }] = await Promise.all([
      supabase.from('timetables').select('*, departments(name)').order('created_at', { ascending: false }),
      supabase.from('departments').select('id,name').order('name'),
    ]);
    setTimetables((tt ?? []) as Timetable[]);
    setDepartments((d ?? []) as Department[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openEdit = (t: Timetable) => {
    setForm({ name: t.name, department_id: t.department_id ?? '', academic_year: t.academic_year, semester: t.semester });
    setModal({ open: true, editing: t });
  };

  const save = async () => {
    if (!form.name.trim() || !form.academic_year.trim() || !form.semester.trim()) return toast.error('Name, year and semester are required');
    setSaving(true);
    const payload = { name: form.name.trim(), department_id: form.department_id || null, academic_year: form.academic_year, semester: form.semester };
    const { error } = modal.editing
      ? await supabase.from('timetables').update(payload).eq('id', modal.editing.id)
      : await supabase.from('timetables').insert(payload);
    if (error) toast.error(error.message);
    else { toast.success(modal.editing ? 'Updated' : 'Created'); setModal({ open: false, editing: null }); load(); }
    setSaving(false);
  };

  const setStatus = async (id: string, status: 'draft' | 'published' | 'archived') => {
    const { error } = await supabase.from('timetables').update({ status, is_active: status === 'published' }).eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success(status === 'published' ? 'Published — students can now see this' : `Marked as ${status}`); load(); }
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete timetable "${name}"? All entries will be lost.`)) return;
    const { error } = await supabase.from('timetables').delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Deleted'); load(); }
  };

  const f = (k: keyof TTForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-sky-400" />
          <h2 className="text-white font-semibold text-lg">Timetables <span className="text-slate-500 text-sm font-normal">({timetables.length})</span></h2>
        </div>
        <button onClick={() => { setForm(EMPTY); setModal({ open: true, editing: null }); }} className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          <Plus size={15} /> New Timetable
        </button>
      </div>

      {loading ? <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />)}</div>
        : timetables.length === 0 ? <div className="text-center py-12 text-slate-500">No timetables yet.</div>
        : (
          <div className="space-y-3">
            {timetables.map(t => (
              <div key={t.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-semibold">{t.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[t.status]}`}>{t.status}</span>
                    {t.is_active && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">● Live</span>}
                  </div>
                  <p className="text-slate-400 text-sm">{t.departments?.name ?? 'All Departments'} · {t.semester} · {t.academic_year}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {t.status === 'draft' && (
                    <button onClick={() => setStatus(t.id, 'published')} className="flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition">
                      <Globe size={13} /> Publish
                    </button>
                  )}
                  {t.status === 'published' && (
                    <button onClick={() => setStatus(t.id, 'archived')} className="flex items-center gap-1 text-xs bg-slate-600 hover:bg-slate-500 text-white px-3 py-1.5 rounded-lg transition">
                      <Archive size={13} /> Archive
                    </button>
                  )}
                  {t.status === 'archived' && (
                    <button onClick={() => setStatus(t.id, 'draft')} className="flex items-center gap-1 text-xs border border-white/20 text-slate-400 hover:text-white px-3 py-1.5 rounded-lg transition">
                      Restore
                    </button>
                  )}
                  <button onClick={() => openEdit(t)} className="text-slate-400 hover:text-white transition p-1.5"><Pencil size={14} /></button>
                  <button onClick={() => remove(t.id, t.name)} className="text-slate-400 hover:text-rose-400 transition p-1.5"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

      <Modal open={modal.open} onClose={() => setModal({ open: false, editing: null })} title={modal.editing ? 'Edit Timetable' : 'New Timetable'}>
        <div className="space-y-4">
          <div><label className="label">Timetable Name *</label><input className="input" placeholder="CS Dept — Odd Sem 2024-25" value={form.name} onChange={f('name')} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Academic Year *</label><input className="input" placeholder="2024-25" value={form.academic_year} onChange={f('academic_year')} /></div>
            <div><label className="label">Semester / Term *</label><input className="input" placeholder="Odd Sem / Jan-May" value={form.semester} onChange={f('semester')} /></div>
          </div>
          <div><label className="label">Department (optional)</label>
            <select className="input" value={form.department_id} onChange={f('department_id')}>
              <option value="">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal({ open: false, editing: null })} className="flex-1 btn-secondary">Cancel</button>
            <button onClick={save} disabled={saving} className="flex-1 btn-primary">{saving ? 'Saving…' : modal.editing ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
