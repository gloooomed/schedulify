import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getFacultySchedule, getFacultyAssignments } from '../lib/services/db-service';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Clock, BookOpen, Users, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import type { TimetableEntry } from '../types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SESSION_COLORS: Record<string, string> = {
  lecture: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  lab: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  tutorial: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
};

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<TimetableEntry[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([getFacultySchedule(user.id), getFacultyAssignments(user.id)])
      .then(([s, a]) => { setSchedule(s); setAssignments(a); })
      .finally(() => setLoading(false));
  }, [user?.id]);

  const today = new Date().getDay();
  const todaySchedule = schedule.filter((e) => e.day_of_week === today);
  const weekByDay = DAYS.map((day, i) => ({
    day,
    entries: schedule.filter((e) => e.day_of_week === i),
  })).filter((d) => d.entries.length > 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Faculty Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            {user?.first_name} {user?.last_name} · {user?.department ?? 'N/A'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: BookOpen, label: 'Total Classes / Week', value: schedule.length, color: 'bg-blue-500/20 text-blue-400' },
            { icon: Clock, label: "Today's Classes", value: todaySchedule.length, color: 'bg-emerald-500/20 text-emerald-400' },
            { icon: Users, label: 'Assignments', value: assignments.length, color: 'bg-violet-500/20 text-violet-400' },
          ].map(({ icon: Icon, label, value, color }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-slate-400 text-xs">{label}</p>
                <p className="text-white text-2xl font-bold">{value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-blue-400" />
              <h2 className="text-white font-semibold">Today — {DAYS[today]}</h2>
            </div>
            {loading ? (
              <div className="space-y-2">{Array(3).fill(0).map((_, i) => <div key={i} className="h-14 bg-white/5 rounded-lg animate-pulse" />)}</div>
            ) : todaySchedule.length === 0 ? (
              <p className="text-slate-500 text-sm">No classes today. 🎉</p>
            ) : (
              <div className="space-y-3">
                {todaySchedule.map((e) => (
                  <div key={e.id} className={`border rounded-lg p-3 ${SESSION_COLORS[e.session_type]}`}>
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{e.courses?.name}</p>
                      <span className="text-xs opacity-70">{e.session_type}</span>
                    </div>
                    <p className="text-xs opacity-70 mt-0.5">
                      {e.start_time} – {e.end_time} · {e.classrooms?.name} · {e.student_group}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={18} className="text-violet-400" />
              <h2 className="text-white font-semibold">Weekly Schedule</h2>
            </div>
            {loading ? (
              <div className="space-y-2">{Array(5).fill(0).map((_, i) => <div key={i} className="h-10 bg-white/5 rounded animate-pulse" />)}</div>
            ) : weekByDay.length === 0 ? (
              <p className="text-slate-500 text-sm">No schedule found.</p>
            ) : (
              <div className="space-y-3">
                {weekByDay.map(({ day, entries }) => (
                  <div key={day}>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">{day}</p>
                    <div className="space-y-1">
                      {entries.map((e) => (
                        <div key={e.id} className="flex items-center gap-2 text-sm">
                          <span className="text-slate-400 w-28 text-xs shrink-0">{e.start_time}–{e.end_time}</span>
                          <span className="text-white truncate">{e.courses?.name}</span>
                          <span className="text-slate-500 text-xs shrink-0">{e.classrooms?.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}