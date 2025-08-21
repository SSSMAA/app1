// Types pour l'application ISCHOOLGO

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'admin' | 'director' | 'marketer' | 'head_trainer' | 'agent' | 'teacher';
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Student {
  id: string;
  student_name: string;
  parent_name: string;
  phone: string;
  email?: string;
  age?: number;
  level: string;
  group_id?: string;
  teacher_id?: string;
  registration_date: string;
  subscription_type: string;
  monthly_fee: number;
  payment_status: 'paid' | 'pending' | 'overdue';
  last_payment_date?: string;
  status: 'active' | 'inactive' | 'suspended';
}

export interface Teacher {
  id: string;
  user_id: string;
  specialization?: string;
  qualifications?: string;
  years_experience?: number;
  hire_date?: string;
  salary?: number;
  contract_type?: string;
  overall_rating?: number;
}

export interface Group {
  id: string;
  name: string;
  level: string;
  teacher_id: string;
  teacher_name?: string;
  student_count: number;
  max_capacity: number;
  weekdays?: string; // JSON array
  start_time: string;
  end_time: string;
  class_link?: string;
  status: 'active' | 'inactive';
}

export interface Visitor {
  id: string;
  student_name: string;
  parent_name: string;
  phone: string;
  age?: number;
  desired_level?: string;
  source?: string;
  contact_date: string;
  assigned_agent_id?: string;
  trial_date?: string;
  trial_time?: string;
  teacher_id?: string;
  trial_status: 'scheduled' | 'completed' | 'missed' | 'cancelled';
  final_decision?: 'enrolled' | 'declined' | 'pending';
  notes?: string;
}

export interface Payment {
  id: string;
  student_id: string;
  student_name?: string;
  payment_date: string;
  amount: number;
  month_paid: string;
  payment_method?: string;
  receipt_number?: string;
  responsible_agent_id?: string;
  notes?: string;
}

export interface Campaign {
  id: string;
  name: string;
  platform: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  spent_amount: number;
  impressions: number;
  clicks: number;
  ctr: number;
  leads_generated: number;
  cost_per_lead: number;
  status: 'active' | 'paused' | 'completed';
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  source?: string;
  campaign_id?: string;
  received_date: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  follow_up_date?: string;
  assigned_agent_id?: string;
  notes?: string;
}

export interface Attendance {
  id: string;
  date: string;
  student_id: string;
  student_name?: string;
  group_id: string;
  class_time?: string;
  status: 'present' | 'absent' | 'late';
  absence_reason?: string;
  notes?: string;
}

export interface Expense {
  id: string;
  date: string;
  type: string;
  description?: string;
  amount: number;
  category?: string;
  invoice_number?: string;
  vendor?: string;
  payment_status: 'paid' | 'pending';
  attachments?: string; // JSON array
}

export interface Salary {
  id: string;
  employee_id: string;
  employee_name?: string;
  position?: string;
  base_salary: number;
  allowances: number;
  deductions: number;
  total_salary: number;
  payment_date?: string;
  payment_status: 'paid' | 'pending';
  notes?: string;
}

export interface DashboardStats {
  total_students: number;
  active_students: number;
  total_revenue: number;
  monthly_revenue: number;
  pending_payments: number;
  overdue_payments: number;
  total_teachers: number;
  active_groups: number;
  attendance_rate: number;
  new_visitors: number;
  trial_bookings: number;
  conversion_rate: number;
}

// Bindings pour Cloudflare
export interface Bindings {
  DB: D1Database;
}

// Context type pour Hono
export interface HonoContext {
  Bindings: Bindings;
}