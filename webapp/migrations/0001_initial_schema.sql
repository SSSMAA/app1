-- ISCHOOLGO System Database Schema
-- Based on the analyzed Google Sheets structure

-- Users table (unified for all roles)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'director', 'marketer', 'head_trainer', 'agent', 'teacher')),
  password_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive'))
);

-- Visitors table (potential students)
CREATE TABLE IF NOT EXISTS visitors (
  id TEXT PRIMARY KEY,
  student_name TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  age INTEGER,
  desired_level TEXT,
  source TEXT,
  contact_date DATE NOT NULL,
  assigned_agent_id TEXT,
  trial_date DATE,
  trial_time TIME,
  teacher_id TEXT,
  trial_status TEXT DEFAULT 'scheduled' CHECK (trial_status IN ('scheduled', 'completed', 'missed', 'cancelled')),
  final_decision TEXT CHECK (final_decision IN ('enrolled', 'declined', 'pending')),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_agent_id) REFERENCES users(id),
  FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  student_name TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  age INTEGER,
  level TEXT NOT NULL,
  group_id TEXT,
  teacher_id TEXT,
  registration_date DATE NOT NULL,
  subscription_type TEXT NOT NULL,
  monthly_fee REAL NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending', 'overdue')),
  last_payment_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES groups(id),
  FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- Teachers table (additional info for teachers)
CREATE TABLE IF NOT EXISTS teachers (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  specialization TEXT,
  qualifications TEXT,
  years_experience INTEGER,
  hire_date DATE,
  salary REAL,
  contract_type TEXT,
  overall_rating REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Groups/Classes table
CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  level TEXT NOT NULL,
  teacher_id TEXT NOT NULL,
  teacher_name TEXT,
  student_count INTEGER DEFAULT 0,
  max_capacity INTEGER NOT NULL,
  weekdays TEXT, -- JSON array of weekdays
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  class_link TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  student_id TEXT NOT NULL,
  student_name TEXT,
  group_id TEXT NOT NULL,
  class_time TIME,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  absence_reason TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (group_id) REFERENCES groups(id)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  student_name TEXT,
  payment_date DATE NOT NULL,
  amount REAL NOT NULL,
  month_paid TEXT NOT NULL,
  payment_method TEXT,
  receipt_number TEXT,
  responsible_agent_id TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (responsible_agent_id) REFERENCES users(id)
);

-- Marketing Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  budget REAL,
  spent_amount REAL DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr REAL DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  cost_per_lead REAL DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  source TEXT,
  campaign_id TEXT,
  received_date DATE NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  follow_up_date DATE,
  assigned_agent_id TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
  FOREIGN KEY (assigned_agent_id) REFERENCES users(id)
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  amount REAL NOT NULL,
  category TEXT,
  invoice_number TEXT,
  vendor TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending')),
  attachments TEXT, -- JSON array of file paths
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Salaries table
CREATE TABLE IF NOT EXISTS salaries (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT,
  position TEXT,
  base_salary REAL NOT NULL,
  allowances REAL DEFAULT 0,
  deductions REAL DEFAULT 0,
  total_salary REAL NOT NULL,
  payment_date DATE,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending')),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES users(id)
);

-- Lesson Plans table
CREATE TABLE IF NOT EXISTS lesson_plans (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  group_id TEXT NOT NULL,
  teacher_id TEXT NOT NULL,
  title TEXT NOT NULL,
  objectives TEXT,
  content TEXT,
  activities TEXT,
  homework TEXT,
  assessment TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES groups(id),
  FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- Assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  student_id TEXT NOT NULL,
  student_name TEXT,
  teacher_id TEXT NOT NULL,
  assessment_type TEXT NOT NULL,
  score REAL NOT NULL,
  total_score REAL NOT NULL,
  percentage REAL NOT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  report_date DATE NOT NULL,
  report_type TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  follow_up_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_teacher_id ON students(teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_group_id ON students(group_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_campaign_id ON leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_visitors_agent_id ON visitors(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_groups_teacher_id ON groups(teacher_id);