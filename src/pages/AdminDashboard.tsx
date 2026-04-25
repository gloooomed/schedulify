import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import DashboardLayout from '../components/layout/DashboardLayout';
import { DataManager } from '../components/admin/DataManager';
import DepartmentsManager from '../components/admin/DepartmentsManager';
import CoursesManager from '../components/admin/CoursesManager';
import UsersManager from '../components/admin/UsersManager';
import ClassroomsManager from '../components/admin/ClassroomsManager';
import TimetablesManager from '../components/admin/TimetablesManager';
import AdminsManager from '../components/admin/AdminsManager';
import ScheduleUpload from './admin/ScheduleUpload';
import {
  LayoutDashboard, Building2, BookOpen, Users, GraduationCap,
  DoorOpen, Calendar, Upload, ChevronRight, ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Section =
  | 'overview' | 'departments' | 'courses' | 'faculty'
  | 'students' | 'classrooms' | 'timetables' | 'upload' | 'admins';

const BASE_NAV: { id: Section; label: string; icon: any; color: string }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, color: 'text-blue-400' },
  { id: 'departments', label: 'Departments', icon: Building2, color: 'text-blue-400' },
  { id: 'courses', label: 'Courses', icon: BookOpen, color: 'text-emerald-400' },
  { id: 'faculty', label: 'Faculty', icon: Users, color: 'text-sky-400' },
  { id: 'students', label: 'Students', icon: GraduationCap, color: 'text-violet-400' },
  { id: 'classrooms', label: 'Classrooms', icon: DoorOpen, color: 'text-amber-400' },
  { id: 'timetables', label: 'Timetables', icon: Calendar, color: 'text-rose-400' },
  { id: 'upload', label: 'Upload Schedule', icon: Upload, color: 'text-teal-400' },
];

const SUPER_ADMIN_NAV: { id: Section; label: string; icon: any; color: string } = {
  id: 'admins', label: 'Manage Admins', icon: ShieldCheck, color: 'text-rose-400',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const [section, setSection] = useState<Section>('overview');

  const NAV = isSuperAdmin ? [...BASE_NAV, SUPER_ADMIN_NAV] : BASE_NAV;
  const active = NAV.find(n => n.id === section) ?? BASE_NAV[0];

  return (
    <DashboardLayout>
      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-52 shrink-0">
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden sticky top-20">
            <div className="px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                {isSuperAdmin && <ShieldCheck size={13} className="text-rose-400" />}
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {isSuperAdmin ? 'Master Admin' : 'Admin Panel'}
                </p>
              </div>
              <p className="text-white text-sm font-medium mt-0.5">{user?.first_name} {user?.last_name}</p>
            </div>
            <nav className="p-2">
              {NAV.map(({ id, label, icon: Icon, color }) => (
                <button
                  key={id}
                  onClick={() => setSection(id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition mb-0.5 ${
                    section === id ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  } ${id === 'admins' ? 'mt-2 border-t border-white/10 pt-3' : ''}`}
                >
                  <Icon size={15} className={section === id ? color : ''} />
                  <span>{label}</span>
                  {section === id && <ChevronRight size={13} className="ml-auto text-slate-500" />}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
                <active.icon size={20} className={active.color} />
                <h1 className="text-white font-bold text-xl">{active.label}</h1>
              </div>

              {section === 'overview' && <DataManager />}
              {section === 'departments' && <DepartmentsManager />}
              {section === 'courses' && <CoursesManager />}
              {section === 'faculty' && <UsersManager targetRole="faculty" />}
              {section === 'students' && <UsersManager targetRole="student" />}
              {section === 'classrooms' && <ClassroomsManager />}
              {section === 'timetables' && <TimetablesManager />}
              {section === 'upload' && <ScheduleUpload />}
              {section === 'admins' && isSuperAdmin && <AdminsManager />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </DashboardLayout>
  );
}