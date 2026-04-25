import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import { createClient } from '@supabase/supabase-js';
import { configStore } from '../../lib/config/store';
import Modal from '../ui/Modal';
import { Plus, Pencil, Users, GraduationCap, ToggleLeft, ToggleRight, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Profile } from '../../types';

interface Department { id: string; name: string; }
interface Course { id: string; name: string; code: string; }

interface UserForm {
  first_name: string; last_name: string; email: string; password: string;
  department_id: string; employee_id: string; roll_number: string;
  batch: string; semester: string; phone: string;
}
const EMPTY: UserForm = {
  first_name: '', last_name: '', email: '', password: '',
  department_id: '', employee_id: '', roll_number: '', batch: '', semester: '', phone: '',
};

interface Props { targetRole: 'faculty' | 'student'; }

async function createAuthUser(email: string, password: string) {
  const cfg = configStore.get();
  const url = cfg?.supabaseUrl || import.meta.env.VITE_SUPABASE_URL;
  const key = cfg?.supabaseAnonKey || import.meta.env.VITE_SUPABASE_ANON_KEY;
  const isolated = createClient(url, key, {
    auth: { storageKey: `schedulify-signup-${Date.now()}`, persistSession: false, autoRefreshToken: false },
  });
  return isolated.auth.signUp({ email, password });
}

export default function UsersManager({ targetRole }: Props) {
  const [users, setUsers] = useState<Profile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Profile | null }>({ open: false, editing: null });
  const [form, setForm] = useState<UserForm>(EMPTY);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    const [usersRes, depsRes, coursesRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('role', targetRole).order('first_name'),
      supabase.from('departments').select('id, name').order('name'),
      supabase.from('courses').select('id, name, code').order('name'),
    ]);
    setUsers((usersRes.data ?? []) as Profile[]);
    setDepartments(depsRes.data ?? []);
    setCourses(coursesRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [targetRole]);

  const toggleCourse = (id: string) =>
    setSelectedCourses(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);

  const save = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) return toast.error('Name is required');
    if (!modal.editing && (!form.email.trim() || !form.password.trim())) return toast.error('Email and password required');
    if (!modal.editing && form.password.length < 8) return toast.error('Password must be at least 8 characters');
    setSaving(true);

    // Get selected department name for the profile
    const deptName = departments.find(d => d.id === form.department_id)?.name ?? form.department_id;

    try {
      if (!modal.editing) {
        const { data, error } = await createAuthUser(form.email.trim(), form.password);
        if (error || !data.user) throw new Error(error?.message ?? 'Failed to create account');

        const { error: profileErr } = await supabase.from('profiles').insert({
          id: data.user.id,
          role: targetRole,
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          department: deptName || null,
          employee_id: form.employee_id || null,
          roll_number: form.roll_number || null,
          batch: form.batch || null,
          semester: form.semester || null,
          phone: form.phone || null,
        });
        if (profileErr) throw new Error(profileErr.message);

        // Assign courses
        if (selectedCourses.length > 0) {
          const year = new Date().getFullYear().toString();
          if (targetRole === 'faculty') {
            await supabase.from('faculty_courses').insert(
              selectedCourses.map(cid => ({ faculty_id: data.user!.id, course_id: cid, academic_year: year }))
            );
          } else {
            await supabase.from('student_enrollments').insert(
              selectedCourses.map(cid => ({
                student_id: data.user!.id, course_id: cid,
                academic_year: year, semester: form.semester || 'Sem 1', batch: form.batch || '',
              }))
            );
          }
        }

        toast.success(`${targetRole === 'faculty' ? 'Faculty' : 'Student'} added — they can log in now.`);
      } else {
        const { error } = await supabase.from('profiles').update({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          department: deptName || null,
          employee_id: form.employee_id || null,
          roll_number: form.roll_number || null,
          batch: form.batch || null,
          semester: form.semester || null,
          phone: form.phone || null,
        }).eq('id', modal.editing.id);
        if (error) throw new Error(error.message);
        toast.success('Updated');
      }
      setModal({ open: false, editing: null });
      setSelectedCourses([]);
      loadData();
    } catch (e: any) {
      toast.error(e.message);
    }
    setSaving(false);
  };

  const toggleActive = async (u: Profile) => {
    const { error } = await supabase.from('profiles').update({ is_active: !u.is_active }).eq('id', u.id);
    if (error) toast.error(error.message);
    else loadData();
  };

  const openEdit = (u: Profile) => {
    const dep = departments.find(d => d.name === u.department);
    setForm({
      first_name: u.first_name, last_name: u.last_name, email: '', password: '',
      department_id: dep?.id ?? '', employee_id: u.employee_id ?? '',
      roll_number: u.roll_number ?? '', batch: u.batch ?? '',
      semester: u.semester ?? '', phone: u.phone ?? '',
    });
    setSelectedCourses([]);
    setModal({ open: true, editing: u });
  };

  const f = (k: keyof UserForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const isFaculty = targetRole === 'faculty';
  const Icon = isFaculty ? Users : GraduationCap;
  const color = isFaculty ? 'text-sky-400' : 'text-violet-400';
  const btnColor = isFaculty ? 'bg-sky-600 hover:bg-sky-500' : 'bg-violet-600 hover:bg-violet-500';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={20} className={color} />
          <h2 className="text-white font-semibold text-lg">
            {isFaculty ? 'Faculty' : 'Students'}
            <span className="text-slate-500 text-sm font-normal ml-2">({users.length})</span>
          </h2>
        </div>
        <button
          onClick={() => { setForm(EMPTY); setSelectedCourses([]); setModal({ open: true, editing: null }); }}
          className={`flex items-center gap-2 text-white text-sm font-medium px-4 py-2 rounded-lg transition ${btnColor}`}
        >
          <Plus size={15} /> Add {isFaculty ? 'Faculty' : 'Student'}
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{Array(4).fill(0).map((_, i) => <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />)}</div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-slate-500">No {targetRole}s added yet.</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 bg-white/5">
              <tr>
                {['Name', isFaculty ? 'Emp ID' : 'Roll No', 'Department', isFaculty ? '' : 'Batch / Sem', 'Status', ''].map((h, i) => (
                  <th key={i} className="text-left text-slate-400 text-xs font-semibold px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-4 py-3 text-white font-medium">{u.first_name} {u.last_name}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                    {isFaculty ? (u.employee_id ?? '—') : (u.roll_number ?? '—')}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{u.department ?? '—'}</td>
                  {!isFaculty && <td className="px-4 py-3 text-slate-400">{u.batch ?? '—'}{u.semester ? ` · ${u.semester}` : ''}</td>}
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(u)} className="flex items-center gap-1 text-xs transition">
                      {u.is_active
                        ? <><ToggleRight size={18} className="text-emerald-400" /><span className="text-emerald-400">Active</span></>
                        : <><ToggleLeft size={18} className="text-slate-500" /><span className="text-slate-500">Inactive</span></>}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => openEdit(u)} className="text-slate-400 hover:text-white transition p-1">
                      <Pencil size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modal.open}
        onClose={() => { setModal({ open: false, editing: null }); setSelectedCourses([]); }}
        title={modal.editing ? `Edit ${isFaculty ? 'Faculty' : 'Student'}` : `Add ${isFaculty ? 'Faculty' : 'Student'}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">First Name *</label><input className="input" placeholder="Rahul" value={form.first_name} onChange={f('first_name')} /></div>
            <div><label className="label">Last Name *</label><input className="input" placeholder="Sharma" value={form.last_name} onChange={f('last_name')} /></div>
          </div>

          {!modal.editing && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Email *</label><input className="input" type="email" placeholder="user@college.edu" value={form.email} onChange={f('email')} /></div>
                <div><label className="label">Password *</label><input className="input" type="password" placeholder="min 8 chars" value={form.password} onChange={f('password')} /></div>
              </div>
              <p className="text-slate-600 text-xs -mt-2">Share these credentials with the {targetRole}. They log in at your app URL.</p>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Department dropdown */}
            <div>
              <label className="label">Department</label>
              <select className="input" value={form.department_id} onChange={f('department_id')}>
                <option value="">— Select department —</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              {departments.length === 0 && <p className="text-amber-500 text-xs mt-1">No departments yet — add them first.</p>}
            </div>
            <div>
              <label className="label">{isFaculty ? 'Employee ID' : 'Roll Number'}</label>
              <input className="input" placeholder={isFaculty ? 'EMP001' : '2024CS001'} value={isFaculty ? form.employee_id : form.roll_number} onChange={f(isFaculty ? 'employee_id' : 'roll_number')} />
            </div>
          </div>

          {!isFaculty && (
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Batch</label><input className="input" placeholder="2024-28" value={form.batch} onChange={f('batch')} /></div>
              <div><label className="label">Current Semester</label><input className="input" placeholder="3rd Sem" value={form.semester} onChange={f('semester')} /></div>
            </div>
          )}

          <div><label className="label">Phone</label><input className="input" type="tel" placeholder="+91 99999 99999" value={form.phone} onChange={f('phone')} /></div>

          {/* Course assignment */}
          {!modal.editing && courses.length > 0 && (
            <div>
              <label className="label flex items-center gap-1.5">
                <BookOpen size={13} className="text-slate-400" />
                {isFaculty ? 'Assign Courses (they teach)' : 'Enroll in Courses'} <span className="text-slate-600 font-normal">(optional)</span>
              </label>
              <div className="bg-slate-800/60 border border-white/10 rounded-xl p-3 max-h-36 overflow-y-auto space-y-1">
                {courses.map(c => (
                  <label key={c.id} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      className="w-3.5 h-3.5 rounded accent-blue-500"
                      checked={selectedCourses.includes(c.id)}
                      onChange={() => toggleCourse(c.id)}
                    />
                    <span className="text-white">{c.name}</span>
                    <span className="text-slate-500 font-mono text-xs ml-auto">{c.code}</span>
                  </label>
                ))}
              </div>
              {selectedCourses.length > 0 && (
                <p className="text-blue-400 text-xs mt-1">{selectedCourses.length} course{selectedCourses.length > 1 ? 's' : ''} selected</p>
              )}
            </div>
          )}
          {!modal.editing && courses.length === 0 && (
            <p className="text-slate-600 text-xs">No courses added yet — you can assign them later from the Courses section.</p>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={() => { setModal({ open: false, editing: null }); setSelectedCourses([]); }} className="flex-1 btn-secondary">Cancel</button>
            <button onClick={save} disabled={saving} className="flex-1 btn-primary">
              {saving ? 'Saving…' : modal.editing ? 'Update' : `Add ${isFaculty ? 'Faculty' : 'Student'}`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
