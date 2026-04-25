import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getStudentSchedule, getFacultySchedule } from '../lib/services/db-service';
import type { TimetableEntry } from '../types';

export function useTimetableData() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      try {
        const data = user.role === 'student'
          ? await getStudentSchedule(user.id)
          : await getFacultySchedule(user.id);
        setEntries(data);
      } catch {
        setError('Failed to load timetable');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id, user?.role]);

  const today = new Date().getDay();
  const todayEntries = entries.filter((e) => e.day_of_week === today);

  return { entries, todayEntries, loading, error };
}