import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import Modal from '../ui/Modal';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Course, Department } from '../../types';

interface CourseForm {
  name: string; code: string; credits: string; department_id: string;
  semester: string; course_type: string; is_elective: boolean; description: string;
}
const EMPTY: CourseForm = { name: '', code: '', credits: '3', department_id: '', semester: '', course_type: 'theory', is_elective: false, description: '' };

const TYPE_BADGE: Record<string, string> = {
  theory: 'bg-blue-500/20 text-blue-400', lab: 'bg-emerald-500/20 text-emerald-400',
  tutorial: 'bg-violet-500/20 text-violet-400', project: 'bg-amber-500/20 text-amber-400',
};

export default function CoursesManager() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Course | null }>({ open: false, editing: null });
  const [form, setForm] = useState<CourseForm>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [filterDept, setFilterDept] = useState('');

  const load = async () => {
    const [{ data: c }, { data: d }] = await Promise.all([
      supabase.from('courses').select('*, departments(id,name,code)').order('name'),
      supabase.from('departments').select('id,name,code').order('name'),
    ]);
    setCourses((c ?? []) as Course[]);
    setDepartments((d ?? []) as Department[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openEdit = (c: Course) => {
    setForm({ name: c.name, code: c.code, credits: String(c.credits), department_id: c.department_id ?? '',
      semester: c.semester ?? '', course_type: c.course_type ?? 'theory', is_elective: c.is_elective, description: c.description ?? '' });
    setModal({ open: true, editing: c });
  };

  const save = async () => {
    if (!form.name.trim() || !form.code.trim()) return toast.error('Name and code are required');
    setSaving(true);
    const payload = { name: form.name.trim(), code: form.code.trim().toUpperCase(), credits: parseInt(form.credits) || 3,
      department_id: form.department_id || null, semester: form.semester || null,
      course_type: form.course_type, is_elective: form.is_elective, description: form.description || null };
    const { error } = modal.editing
      ? await supabase.from('courses').update(payload).eq('id', modal.editing.id)
      : await supabase.from('courses').insert(payload);
    if (error) toast.error(error.message);
    else { toast.success(modal.editing ? 'Updated' : 'Added'); setModal({ open: false, editing: null }); load(); }
    setSaving(false);
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete course "${name}"?`)) return;
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Deleted'); load(); }
  };

  const f = (k: keyof CourseForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));

  const filtered = filterDept ? courses.filter(c => c.department_id === filterDept) : courses;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-emerald-400" />
          <h2 className="text-white font-semibold text-lg">Courses <span className="text-slate-500 text-sm font-normal">({filtered.length})</span></h2>
        </div>
        <div className="flex items-center gap-3">
          <select className="input py-1.5 text-sm w-44" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <button onClick={() => { setForm(EMPTY); setModal({ open: true, editing: null }); }} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            <Plus size={15} /> Add Course
          </button>
        </div>
      </div>

      {loading ? <div className="space-y-2">{Array(5).fill(0).map((_, i) => <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />)}</div>
        : filtered.length === 0 ? <div className="text-center py-12 text-slate-500">No courses found.</div>
        : (
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 bg-white/5">
                <tr>{['Code', 'Course Name', 'Dept', 'Credits', 'Semester', 'Type', ''].map(h =>
                  <th key={h} className="text-left text-slate-400 text-xs font-semibold px-4 py-3">{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-blue-400">{c.code}</td>
                    <td className="px-4 py-3 text-white font-medium">{c.name}{c.is_elective && <span className="ml-2 text-xs text-amber-400 border border-amber-400/30 rounded px-1">Elective</span>}</td>
                    <td className="px-4 py-3 text-slate-400">{c.departments?.code ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-300 text-center">{c.credits}</td>
                    <td className="px-4 py-3 text-slate-400">{c.semester ?? '—'}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full capitalize ${TYPE_BADGE[c.course_type ?? 'theory'] ?? 'bg-white/10 text-slate-400'}`}>{c.course_type ?? 'theory'}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEdit(c)} className="text-slate-400 hover:text-white transition p-1"><Pencil size={14} /></button>
                        <button onClick={() => remove(c.id, c.name)} className="text-slate-400 hover:text-rose-400 transition p-1"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      <Modal open={modal.open} onClose={() => setModal({ open: false, editing: null })} title={modal.editing ? 'Edit Course' : 'Add Course'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Course Name *</label><input className="input" placeholder="Data Structures" value={form.name} onChange={f('name')} /></div>
            <div><label className="label">Course Code *</label><input className="input" placeholder="CS301" value={form.code} onChange={f('code')} /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="label">Credits</label><input className="input" type="number" min="1" value={form.credits} onChange={f('credits')} /></div>
            <div><label className="label">Department</label>
              <select className="input" value={form.department_id} onChange={f('department_id')}>
                <option value="">— None —</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div><label className="label">Semester / Term</label><input className="input" placeholder="3rd Sem / 2024-25" value={form.semester} onChange={f('semester')} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Course Type</label>
              <select className="input" value={form.course_type} onChange={f('course_type')}>
                <option value="theory">Theory</option><option value="lab">Lab / Practical</option>
                <option value="tutorial">Tutorial</option><option value="project">Project</option><option value="seminar">Seminar</option>
              </select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="elective" checked={form.is_elective} onChange={f('is_elective')} className="w-4 h-4 rounded" />
              <label htmlFor="elective" className="text-slate-300 text-sm cursor-pointer">Mark as Elective</label>
            </div>
          </div>
          <div><label className="label">Description</label>
            <textarea className="input resize-none" rows={3} placeholder="Course overview..." value={form.description} onChange={f('description')} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal({ open: false, editing: null })} className="flex-1 btn-secondary">Cancel</button>
            <button onClick={save} disabled={saving} className="flex-1 btn-primary">{saving ? 'Saving…' : modal.editing ? 'Update' : 'Add Course'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
