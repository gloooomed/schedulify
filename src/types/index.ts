export type Role = 'super_admin' | 'admin' | 'faculty' | 'student';
export type TimetableStatus = 'draft' | 'published' | 'archived';
export type SessionType = 'lecture' | 'lab' | 'tutorial';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type EnrollmentStatus = 'active' | 'dropped' | 'completed';

export interface Profile {
  id: string;
  role: Role;
  first_name: string;
  last_name: string;
  department?: string;
  employee_id?: string;
  roll_number?: string;
  batch?: string;
  semester?: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  head_id?: string;
  description?: string;
  created_at: string;
  profiles?: Pick<Profile, 'id' | 'first_name' | 'last_name'>;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  department_id?: string;
  semester?: string;
  course_type?: string;
  is_elective: boolean;
  description?: string;
  created_at: string;
  departments?: Pick<Department, 'id' | 'name' | 'code'>;
}

export interface Classroom {
  id: string;
  name: string;
  capacity?: number;
  room_type?: string;
  building?: string;
  floor?: number;
  is_available: boolean;
  created_at: string;
}

export interface Timetable {
  id: string;
  name: string;
  department_id?: string;
  academic_year: string;
  semester: string;
  is_active: boolean;
  status: TimetableStatus;
  generated_by?: string;
  created_at: string;
  departments?: Pick<Department, 'name'>;
}

export interface TimetableEntry {
  id: string;
  timetable_id: string;
  course_id?: string;
  faculty_id?: string;
  classroom_id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  session_type: SessionType;
  student_group?: string;
  created_at: string;
  courses?: Pick<Course, 'id' | 'name' | 'code'>;
  profiles?: Pick<Profile, 'id' | 'first_name' | 'last_name'>;
  classrooms?: Pick<Classroom, 'id' | 'name'>;
}

export interface Notification {
  id: string;
  user_id?: string;
  target_role?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'announcement';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

export interface Assignment {
  id: string;
  course_id: string;
  faculty_id: string;
  title: string;
  description?: string;
  assignment_type: 'assignment' | 'quiz' | 'exam' | 'project';
  due_date?: string;
  total_marks?: number;
  is_published: boolean;
  created_at: string;
  courses?: Pick<Course, 'name' | 'code'>;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  timetable_entry_id: string;
  faculty_id: string;
  date: string;
  status: AttendanceStatus;
  remarks?: string;
  marked_at: string;
}

export interface StudentEnrollment {
  id: string;
  student_id: string;
  course_id: string;
  timetable_id?: string;
  academic_year: string;
  semester: string;
  batch?: string;
  status: EnrollmentStatus;
  enrolled_at: string;
  courses?: Course;
  profiles?: Profile;
}