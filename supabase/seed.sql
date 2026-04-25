-- Seed demo data (run AFTER creating auth users in Supabase dashboard)
-- Replace UUIDs below with actual auth.users IDs after creating them

-- Departments
INSERT INTO departments (name, code) VALUES
  ('Computer Science', 'CS'),
  ('Mathematics', 'MATH'),
  ('Physics', 'PHY'),
  ('Electronics', 'ECE')
ON CONFLICT DO NOTHING;

-- Classrooms
INSERT INTO classrooms (name, capacity, type, building, floor) VALUES
  ('Room A101', 60, 'lecture', 'Main Block', 1),
  ('Room A102', 60, 'lecture', 'Main Block', 1),
  ('Lab B201', 30, 'lab', 'Science Block', 2),
  ('Lab B202', 30, 'lab', 'Science Block', 2),
  ('Seminar C301', 40, 'seminar', 'Arts Block', 3)
ON CONFLICT DO NOTHING;

-- Courses (CS Dept)
INSERT INTO courses (name, code, credits, semester, department_id)
SELECT 'Data Structures', 'CS201', 4, 3, id FROM departments WHERE code = 'CS'
ON CONFLICT DO NOTHING;

INSERT INTO courses (name, code, credits, semester, department_id)
SELECT 'Database Systems', 'CS301', 3, 5, id FROM departments WHERE code = 'CS'
ON CONFLICT DO NOTHING;

INSERT INTO courses (name, code, credits, semester, department_id)
SELECT 'Operating Systems', 'CS401', 4, 7, id FROM departments WHERE code = 'CS'
ON CONFLICT DO NOTHING;

INSERT INTO courses (name, code, credits, semester, department_id)
SELECT 'Linear Algebra', 'MATH201', 3, 3, id FROM departments WHERE code = 'MATH'
ON CONFLICT DO NOTHING;
