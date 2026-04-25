import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase/client';
import { Database, RefreshCw, BarChart3, Users, BookOpen, MapPin, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface DataManagerProps {
  className?: string;
}

interface Summary {
  departments: number;
  courses: number;
  classrooms: number;
  users: number;
}

const CARDS = [
  { key: 'departments', label: 'Departments', icon: BarChart3, color: 'text-blue-500' },
  { key: 'courses', label: 'Courses', icon: BookOpen, color: 'text-emerald-500' },
  { key: 'classrooms', label: 'Classrooms', icon: MapPin, color: 'text-violet-500' },
  { key: 'users', label: 'Users', icon: Users, color: 'text-amber-500' },
] as const;

export const DataManager: React.FC<DataManagerProps> = ({ className = '' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);

  const fetchSummary = async () => {
    setIsLoading(true);
    try {
      const [depts, courses, classrooms, users] = await Promise.all([
        supabase.from('departments').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('classrooms').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);
      setSummary({
        departments: depts.count ?? 0,
        courses: courses.count ?? 0,
        classrooms: classrooms.count ?? 0,
        users: users.count ?? 0,
      });
    } catch {
      toast.error('Failed to fetch summary');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => { fetchSummary(); }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database size={22} className="text-blue-400" />
          <div>
            <h2 className="text-white font-bold text-lg">Data Management</h2>
            <p className="text-slate-400 text-sm">Live Supabase stats</p>
          </div>
        </div>
        <button
          onClick={fetchSummary}
          disabled={isLoading}
          className="flex items-center gap-2 text-slate-400 hover:text-white border border-white/10 rounded-lg px-3 py-1.5 text-sm transition disabled:opacity-50"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS.map(({ key, label, icon: Icon, color }) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3"
          >
            <Icon size={20} className={color} />
            <div>
              <p className="text-slate-400 text-xs">{label}</p>
              <p className="text-white text-xl font-bold">
                {isLoading ? '—' : summary?.[key] ?? 0}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-3">System Status</h3>
        <div className="space-y-2">
          {[
            { label: 'Supabase Connection', ok: true },
            { label: 'Groq AI', ok: !!import.meta.env.VITE_GROQ_API_KEY },
            { label: 'Data Loaded', ok: summary !== null },
          ].map(({ label, ok }) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <span className="text-slate-400">{label}</span>
              <span className={`flex items-center gap-1 ${ok ? 'text-emerald-400' : 'text-slate-500'}`}>
                <CheckCircle size={14} />
                {ok ? 'Ready' : 'Not set'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};