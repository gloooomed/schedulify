-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin','admin','faculty','student')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  department TEXT,
  employee_id TEXT,
  roll_number TEXT,
  batch TEXT,
  semester TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Departments
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  head_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses (fully flexible — no hardcoded limits)
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  credits INTEGER NOT NULL DEFAULT 3,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  semester TEXT,
  course_type TEXT DEFAULT 'theory',
  is_elective BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Faculty-Course assignments (many-to-many)
CREATE TABLE faculty_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,
  UNIQUE(faculty_id, course_id, academic_year)
);

-- Classrooms
CREATE TABLE classrooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  capacity INTEGER,
  room_type TEXT DEFAULT 'lecture',
  building TEXT,
  floor INTEGER,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timetables
CREATE TABLE timetables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  academic_year TEXT NOT NULL,
  semester TEXT NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  generated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timetable entries
CREATE TABLE timetable_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timetable_id UUID REFERENCES timetables(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  faculty_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  classroom_id UUID REFERENCES classrooms(id) ON DELETE SET NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('lecture','lab','tutorial')),
  student_group TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student enrollments (no student count limit)
CREATE TABLE student_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  timetable_id UUID REFERENCES timetables(id) ON DELETE SET NULL,
  academic_year TEXT NOT NULL,
  semester TEXT NOT NULL,
  batch TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','dropped','completed')),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, course_id, academic_year, semester)
);

-- Attendance
CREATE TABLE attendance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  timetable_entry_id UUID NOT NULL REFERENCES timetable_entries(id) ON DELETE CASCADE,
  faculty_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present','absent','late','excused')),
  remarks TEXT,
  marked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, timetable_entry_id, date)
);

-- Assignments
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  faculty_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignment_type TEXT NOT NULL CHECK (assignment_type IN ('assignment','quiz','exam','project')),
  due_date TIMESTAMPTZ,
  total_marks INTEGER,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications (Realtime enabled)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target_role TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info','warning','success','error','announcement')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Auto updated_at for profiles
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============ ROW LEVEL SECURITY ============

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper: is admin (includes super_admin)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper: get role
CREATE OR REPLACE FUNCTION my_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles
CREATE POLICY "select own" ON profiles FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "update own" ON profiles FOR UPDATE USING (auth.uid() = id OR is_admin());
-- Allow self-insert (setup wizard) OR admin inserting for others (add student/faculty)
CREATE POLICY "insert profile" ON profiles FOR INSERT WITH CHECK (id = auth.uid() OR is_admin());
CREATE POLICY "admin delete" ON profiles FOR DELETE USING (is_admin());
CREATE POLICY "faculty sees students" ON profiles FOR SELECT USING (my_role() = 'faculty');

-- Departments, courses, classrooms — all can read; only admin writes
CREATE POLICY "all read departments" ON departments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "admin write departments" ON departments FOR ALL USING (is_admin());

CREATE POLICY "all read courses" ON courses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "admin write courses" ON courses FOR ALL USING (is_admin());

CREATE POLICY "all read faculty_courses" ON faculty_courses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "admin write faculty_courses" ON faculty_courses FOR ALL USING (is_admin());

CREATE POLICY "all read classrooms" ON classrooms FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "admin write classrooms" ON classrooms FOR ALL USING (is_admin());

-- Timetables
CREATE POLICY "all read timetables" ON timetables FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "admin write timetables" ON timetables FOR ALL USING (is_admin());

CREATE POLICY "all read entries" ON timetable_entries FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "admin write entries" ON timetable_entries FOR ALL USING (is_admin());

-- Enrollments
CREATE POLICY "own enrollments" ON student_enrollments FOR SELECT USING (student_id = auth.uid() OR is_admin() OR my_role() = 'faculty');
CREATE POLICY "admin manage enrollments" ON student_enrollments FOR ALL USING (is_admin());

-- Attendance
CREATE POLICY "own or admin attendance" ON attendance_records FOR SELECT USING (student_id = auth.uid() OR is_admin() OR faculty_id = auth.uid());
CREATE POLICY "faculty insert attendance" ON attendance_records FOR INSERT WITH CHECK (faculty_id = auth.uid() OR is_admin());
CREATE POLICY "admin all attendance" ON attendance_records FOR ALL USING (is_admin());

-- Assignments
CREATE POLICY "read published" ON assignments FOR SELECT USING (is_published OR faculty_id = auth.uid() OR is_admin());
CREATE POLICY "faculty manage own" ON assignments FOR ALL USING (faculty_id = auth.uid() OR is_admin());

-- Notifications
CREATE POLICY "own notifs" ON notifications FOR SELECT USING (
  user_id = auth.uid() OR target_role = my_role() OR target_role = 'all'
);
CREATE POLICY "admin faculty send" ON notifications FOR INSERT WITH CHECK (my_role() IN ('admin','faculty'));
CREATE POLICY "mark own read" ON notifications FOR UPDATE USING (user_id = auth.uid() OR is_admin());
