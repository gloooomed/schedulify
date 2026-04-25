import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getStudentSchedule, getStudentCourses, getStudentAssignments } from '../lib/services/db-service';
import DashboardLayout from '../components/layout/DashboardLayout';
import { BookOpen, Clock, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { TimetableEntry } from '../types';
import { format } from 'date-fns';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<TimetableEntry[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      const [sch, crs] = await Promise.all([getStudentSchedule(user.id), getStudentCourses(user.id)]);
      setSchedule(sch);
      setCourses(crs);
      const courseIds = crs.map((c: any) => c.course_id);
      const asgn = await getStudentAssignments(courseIds);
      setAssignments(asgn);
      setLoading(false);
    };
    load();
  }, [user?.id]);

  const today = new Date().getDay();
  const todaySchedule = schedule.filter((e) => e.day_of_week === today);
  const upcoming = assignments.filter((a) => a.due_date && new Date(a.due_date) >= new Date()).slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Student Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            {user?.first_name} {user?.last_name} · Roll: {user?.roll_number ?? 'N/A'} · Semester {user?.semester}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: BookOpen, label: 'Enrolled Courses', value: courses.length, color: 'bg-blue-500/20 text-blue-400' },
            { icon: Clock, label: "Today's Classes", value: todaySchedule.length, color: 'bg-emerald-500/20 text-emerald-400' },
            { icon: Calendar, label: 'Weekly Classes', value: schedule.length, color: 'bg-violet-500/20 text-violet-400' },
            { icon: FileText, label: 'Due Assignments', value: upcoming.length, color: 'bg-amber-500/20 text-amber-400' },
          ].map(({ icon: Icon, label, value, color }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-slate-400 text-xs leading-tight">{label}</p>
                <p className="text-white text-xl font-bold">{value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-blue-400" />
              <h2 className="text-white font-semibold">Today — {DAYS[today]}</h2>
            </div>
            {loading ? (
              <div className="space-y-2">{Array(3).fill(0).map((_, i) => <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />)}</div>
            ) : todaySchedule.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-slate-500">
                <CheckCircle2 size={36} className="mb-2 text-emerald-500/50" />
                <p>No classes today!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaySchedule.map((e) => (
                  <div key={e.id} className="bg-white/5 rounded-lg p-3 flex items-center gap-4">
                    <div className="text-center min-w-[60px]">
                      <p className="text-blue-400 text-xs font-semibold">{e.start_time}</p>
                      <p className="text-slate-500 text-xs">{e.end_time}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{e.courses?.name}</p>
                      <p className="text-slate-400 text-xs">
                        {e.profiles?.first_name} {e.profiles?.last_name} · {e.classrooms?.name}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500 capitalize border border-white/10 rounded px-2 py-0.5">
                      {e.session_type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={18} className="text-amber-400" />
              <h2 className="text-white font-semibold">Upcoming Deadlines</h2>
            </div>
            {loading ? (
              <div className="space-y-2">{Array(3).fill(0).map((_, i) => <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />)}</div>
            ) : upcoming.length === 0 ? (
              <p className="text-slate-500 text-sm">No upcoming assignments.</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((a) => (
                  <div key={a.id} className="border-b border-white/5 pb-2 last:border-0">
                    <p className="text-white text-sm font-medium">{a.title}</p>
                    <p className="text-slate-400 text-xs">{a.courses?.name}</p>
                    {a.due_date && (
                      <p className="text-amber-400 text-xs mt-0.5">
                        Due: {format(new Date(a.due_date), 'MMM d, h:mm a')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={18} className="text-violet-400" />
            <h2 className="text-white font-semibold">Enrolled Courses</h2>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array(4).fill(0).map((_, i) => <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />)}
            </div>
          ) : courses.length === 0 ? (
            <p className="text-slate-500 text-sm">No courses enrolled yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {courses.map((c) => (
                <div key={c.id} className="bg-white/5 rounded-lg p-3">
                  <p className="text-blue-400 text-xs font-mono">{c.courses?.code}</p>
                  <p className="text-white text-sm font-medium mt-0.5 line-clamp-2">{c.courses?.name}</p>
                  <p className="text-slate-500 text-xs mt-1">{c.courses?.credits} credits</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}