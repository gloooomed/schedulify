import { supabase } from '../supabase/client';
import type { TimetableEntry } from '../../types';

// ── Admin ──────────────────────────────────────────────────────────────────
export const getAdminStats = async () => {
  const [students, faculty, courses, departments, classrooms] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'faculty'),
    supabase.from('courses').select('id', { count: 'exact', head: true }),
    supabase.from('departments').select('id', { count: 'exact', head: true }),
    supabase.from('classrooms').select('id', { count: 'exact', head: true }),
  ]);
  return {
    totalStudents: students.count ?? 0,
    totalFaculty: faculty.count ?? 0,
    totalCourses: courses.count ?? 0,
    totalDepartments: departments.count ?? 0,
    totalClassrooms: classrooms.count ?? 0,
  };
};

export const getActiveTimetables = async () => {
  const { data } = await supabase
    .from('timetables')
    .select('id, name, semester, academic_year, departments(name)')
    .eq('is_active', true);
  return data ?? [];
};

export const getTodayEntries = async (): Promise<TimetableEntry[]> => {
  const today = new Date().getDay();
  const { data } = await supabase
    .from('timetable_entries')
    .select('*, courses(name,code), profiles(first_name,last_name), classrooms(name)')
    .eq('day_of_week', today)
    .order('start_time');
  return (data ?? []) as TimetableEntry[];
};

// ── Faculty ────────────────────────────────────────────────────────────────
export const getFacultySchedule = async (facultyId: string) => {
  const { data } = await supabase
    .from('timetable_entries')
    .select('*, courses(name,code), classrooms(name)')
    .eq('faculty_id', facultyId)
    .order('day_of_week')
    .order('start_time');
  return (data ?? []) as TimetableEntry[];
};

export const getFacultyAssignments = async (facultyId: string) => {
  const { data } = await supabase
    .from('assignments')
    .select('*, courses(name,code)')
    .eq('faculty_id', facultyId)
    .order('created_at', { ascending: false });
  return data ?? [];
};

// ── Student ────────────────────────────────────────────────────────────────
export const getStudentSchedule = async (studentId: string) => {
  const { data: enrollments } = await supabase
    .from('student_enrollments')
    .select('course_id')
    .eq('student_id', studentId)
    .eq('status', 'active');

  if (!enrollments?.length) return [];

  const courseIds = enrollments.map((e) => e.course_id);
  const { data } = await supabase
    .from('timetable_entries')
    .select('*, courses(name,code), profiles(first_name,last_name), classrooms(name)')
    .in('course_id', courseIds)
    .order('day_of_week')
    .order('start_time');
  return (data ?? []) as TimetableEntry[];
};

export const getStudentCourses = async (studentId: string) => {
  const { data } = await supabase
    .from('student_enrollments')
    .select('*, courses(name,code,credits,semester)')
    .eq('student_id', studentId)
    .eq('status', 'active');
  return data ?? [];
};

export const getStudentAssignments = async (courseIds: string[]) => {
  if (!courseIds.length) return [];
  const { data } = await supabase
    .from('assignments')
    .select('*, courses(name)')
    .in('course_id', courseIds)
    .eq('is_published', true)
    .order('due_date');
  return data ?? [];
};

// ── Shared ─────────────────────────────────────────────────────────────────
export const getNotifications = async (userId: string, role: string) => {
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .or(`user_id.eq.${userId},target_role.eq.${role},target_role.eq.all`)
    .order('created_at', { ascending: false })
    .limit(20);
  return data ?? [];
};

export const markNotificationRead = async (notificationId: string) => {
  await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
};

export const getDepartments = async () => {
  const { data } = await supabase.from('departments').select('*').order('name');
  return data ?? [];
};

export const getCourses = async (departmentId?: string) => {
  let query = supabase.from('courses').select('*, departments(name)').order('semester').order('name');
  if (departmentId) query = query.eq('department_id', departmentId);
  const { data } = await query;
  return data ?? [];
};

export const getClassrooms = async () => {
  const { data } = await supabase.from('classrooms').select('*').eq('is_available', true).order('name');
  return data ?? [];
};

export const getFacultyList = async () => {
  const { data } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, department, employee_id')
    .eq('role', 'faculty')
    .eq('is_active', true)
    .order('first_name');
  return data ?? [];
};
