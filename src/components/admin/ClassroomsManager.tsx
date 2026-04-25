import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import Modal from '../ui/Modal';
import { Plus, Pencil, Trash2, DoorOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Classroom } from '../../types';

interface RoomForm { name: string; capacity: string; room_type: string; building: string; floor: string; }
const EMPTY: RoomForm = { name: '', capacity: '', room_type: 'lecture', building: '', floor: '' };

const TYPE_BADGE: Record<string, string> = {
  lecture: 'bg-blue-500/20 text-blue-400', lab: 'bg-emerald-500/20 text-emerald-400',
  seminar: 'bg-violet-500/20 text-violet-400', auditorium: 'bg-amber-500/20 text-amber-400',
};

export default function ClassroomsManager() {
  const [rooms, setRooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Classroom | null }>({ open: false, editing: null });
  const [form, setForm] = useState<RoomForm>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('classrooms').select('*').order('name');
    setRooms((data ?? []) as Classroom[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openEdit = (r: Classroom) => {
    setForm({ name: r.name, capacity: r.capacity ? String(r.capacity) : '', room_type: r.room_type ?? 'lecture', building: r.building ?? '', floor: r.floor ? String(r.floor) : '' });
    setModal({ open: true, editing: r });
  };

  const save = async () => {
    if (!form.name.trim()) return toast.error('Room name is required');
    setSaving(true);
    const payload = { name: form.name.trim(), capacity: form.capacity ? parseInt(form.capacity) : null,
      room_type: form.room_type, building: form.building || null, floor: form.floor ? parseInt(form.floor) : null };
    const { error } = modal.editing
      ? await supabase.from('classrooms').update(payload).eq('id', modal.editing.id)
      : await supabase.from('classrooms').insert(payload);
    if (error) toast.error(error.message);
    else { toast.success(modal.editing ? 'Updated' : 'Added'); setModal({ open: false, editing: null }); load(); }
    setSaving(false);
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    const { error } = await supabase.from('classrooms').delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Deleted'); load(); }
  };

  const toggleAvailable = async (r: Classroom) => {
    await supabase.from('classrooms').update({ is_available: !r.is_available }).eq('id', r.id);
    load();
  };

  const f = (k: keyof RoomForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DoorOpen size={20} className="text-amber-400" />
          <h2 className="text-white font-semibold text-lg">Classrooms <span className="text-slate-500 text-sm font-normal">({rooms.length})</span></h2>
        </div>
        <button onClick={() => { setForm(EMPTY); setModal({ open: true, editing: null }); }} className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          <Plus size={15} /> Add Room
        </button>
      </div>

      {loading ? <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{Array(6).fill(0).map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />)}</div>
        : rooms.length === 0 ? <div className="text-center py-12 text-slate-500">No classrooms added yet.</div>
        : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {rooms.map(r => (
              <div key={r.id} className={`bg-white/5 border rounded-xl p-4 transition ${r.is_available ? 'border-white/10' : 'border-rose-500/20 opacity-60'}`}>
                <div className="flex items-start justify-between mb-2">
                  <p className="text-white font-semibold text-sm">{r.name}</p>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(r)} className="text-slate-400 hover:text-white transition p-1"><Pencil size={13} /></button>
                    <button onClick={() => remove(r.id, r.name)} className="text-slate-400 hover:text-rose-400 transition p-1"><Trash2 size={13} /></button>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${TYPE_BADGE[r.room_type ?? 'lecture'] ?? 'bg-white/10 text-slate-400'}`}>{r.room_type ?? 'lecture'}</span>
                <p className="text-slate-400 text-xs mt-2">{r.building ? `${r.building}${r.floor ? `, Floor ${r.floor}` : ''}` : '—'}</p>
                {r.capacity && <p className="text-slate-500 text-xs">Capacity: {r.capacity}</p>}
                <button onClick={() => toggleAvailable(r)} className={`mt-2 text-xs px-2 py-0.5 rounded-full border transition ${r.is_available ? 'border-emerald-500/40 text-emerald-400 hover:border-rose-500/40 hover:text-rose-400' : 'border-rose-500/40 text-rose-400 hover:border-emerald-500/40 hover:text-emerald-400'}`}>
                  {r.is_available ? 'Available' : 'Unavailable'}
                </button>
              </div>
            ))}
          </div>
        )}

      <Modal open={modal.open} onClose={() => setModal({ open: false, editing: null })} title={modal.editing ? 'Edit Room' : 'Add Classroom'}>
        <div className="space-y-4">
          <div><label className="label">Room / Hall Name *</label><input className="input" placeholder="Room A101" value={form.name} onChange={f('name')} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Type</label>
              <select className="input" value={form.room_type} onChange={f('room_type')}>
                <option value="lecture">Lecture Hall</option><option value="lab">Lab</option>
                <option value="seminar">Seminar Room</option><option value="auditorium">Auditorium</option>
                <option value="computer_lab">Computer Lab</option>
              </select>
            </div>
            <div><label className="label">Capacity (optional)</label><input className="input" type="number" placeholder="No limit" value={form.capacity} onChange={f('capacity')} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Building</label><input className="input" placeholder="Main Block" value={form.building} onChange={f('building')} /></div>
            <div><label className="label">Floor</label><input className="input" type="number" placeholder="1" value={form.floor} onChange={f('floor')} /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal({ open: false, editing: null })} className="flex-1 btn-secondary">Cancel</button>
            <button onClick={save} disabled={saving} className="flex-1 btn-primary">{saving ? 'Saving…' : modal.editing ? 'Update' : 'Add Room'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
