-- Seed data for ISCHOOLGO system

-- Insert users with different roles
INSERT OR IGNORE INTO users (id, email, full_name, phone, role, status) VALUES
  ('admin-001', 'admin@ischoolgo.com', 'مدير عام النظام', '+213555000001', 'admin', 'active'),
  ('director-001', 'director@ischoolgo.com', 'المدير التنفيذي', '+213555000002', 'director', 'active'),
  ('marketer-001', 'marketing@ischoolgo.com', 'مسؤول التسويق', '+213555000003', 'marketer', 'active'),
  ('headtrainer-001', 'headtrainer@ischoolgo.com', 'مسؤول التدريب والتعليم', '+213555000004', 'head_trainer', 'active'),
  ('agent-001', 'agent1@ischoolgo.com', 'وكيل خدمة العملاء 1', '+213555000005', 'agent', 'active'),
  ('agent-002', 'agent2@ischoolgo.com', 'وكيل خدمة العملاء 2', '+213555000006', 'agent', 'active'),
  ('teacher-001', 'teacher1@ischoolgo.com', 'أستاذ أحمد محمد', '+213555000007', 'teacher', 'active'),
  ('teacher-002', 'teacher2@ischoolgo.com', 'أستاذة فاطمة علي', '+213555000008', 'teacher', 'active'),
  ('teacher-003', 'teacher3@ischoolgo.com', 'أستاذ خالد سعيد', '+213555000009', 'teacher', 'active');

-- Insert teachers additional info
INSERT OR IGNORE INTO teachers (id, user_id, specialization, qualifications, years_experience, hire_date, salary, contract_type, overall_rating) VALUES
  ('teacher-001', 'teacher-001', 'رياضيات', 'ماجستير في الرياضيات', 5, '2023-01-15', 45000, 'دوام كامل', 4.8),
  ('teacher-002', 'teacher-002', 'لغة عربية', 'ليسانس في الأدب العربي', 8, '2022-09-01', 48000, 'دوام كامل', 4.9),
  ('teacher-003', 'teacher-003', 'لغة إنجليزية', 'ماجستير في اللغة الإنجليزية', 6, '2023-03-10', 46000, 'دوام كامل', 4.7);

-- Insert groups/classes
INSERT OR IGNORE INTO groups (id, name, level, teacher_id, teacher_name, student_count, max_capacity, weekdays, start_time, end_time, class_link, status) VALUES
  ('group-001', 'مجموعة الرياضيات المتقدمة', 'متقدم', 'teacher-001', 'أستاذ أحمد محمد', 8, 15, '["الأحد", "الثلاثاء", "الخميس"]', '14:00', '15:30', 'https://meet.google.com/math-advanced-001', 'active'),
  ('group-002', 'مجموعة اللغة العربية المتوسطة', 'متوسط', 'teacher-002', 'أستاذة فاطمة علي', 12, 20, '["الإثنين", "الأربعاء"]', '16:00', '17:30', 'https://meet.google.com/arabic-intermediate-002', 'active'),
  ('group-003', 'مجموعة الإنجليزية للمبتدئين', 'مبتدئ', 'teacher-003', 'أستاذ خالد سعيد', 6, 15, '["السبت", "الإثنين", "الأربعاء"]', '10:00', '11:30', 'https://meet.google.com/english-beginner-003', 'active'),
  ('group-004', 'مجموعة الرياضيات للمبتدئين', 'مبتدئ', 'teacher-001', 'أستاذ أحمد محمد', 10, 18, '["الأحد", "الثلاثاء"]', '16:00', '17:30', 'https://meet.google.com/math-beginner-004', 'active');

-- Insert sample students
INSERT OR IGNORE INTO students (id, student_name, parent_name, phone, email, age, level, group_id, teacher_id, registration_date, subscription_type, monthly_fee, payment_status, last_payment_date, status) VALUES
  ('student-001', 'علي محمد أحمد', 'محمد أحمد', '+213661234567', 'parent1@example.com', 16, 'متقدم', 'group-001', 'teacher-001', '2024-01-15', 'شهري منتظم', 8000, 'paid', '2024-01-15', 'active'),
  ('student-002', 'فاطمة سعيد علي', 'سعيد علي', '+213661234568', 'parent2@example.com', 14, 'متوسط', 'group-002', 'teacher-002', '2024-01-20', 'شهري منتظم', 7500, 'paid', '2024-01-20', 'active'),
  ('student-003', 'خالد عبد الرحمن', 'عبد الرحمن محمد', '+213661234569', 'parent3@example.com', 12, 'مبتدئ', 'group-003', 'teacher-003', '2024-02-01', 'شهري منتظم', 7000, 'overdue', '2023-12-01', 'active'),
  ('student-004', 'أمينة حسن', 'حسن عبد الله', '+213661234570', 'parent4@example.com', 15, 'متقدم', 'group-001', 'teacher-001', '2024-01-10', 'شهري منتظم', 8000, 'paid', '2024-01-10', 'active'),
  ('student-005', 'يوسف إبراهيم', 'إبراهيم أحمد', '+213661234571', 'parent5@example.com', 13, 'مبتدئ', 'group-004', 'teacher-001', '2024-02-05', 'شهري منتظم', 7000, 'pending', NULL, 'active');

-- Insert sample visitors (potential students)
INSERT OR IGNORE INTO visitors (id, student_name, parent_name, phone, age, desired_level, source, contact_date, assigned_agent_id, trial_date, trial_time, teacher_id, trial_status, final_decision, notes) VALUES
  ('visitor-001', 'سارة محمد', 'محمد عبد الله', '+213661234572', 14, 'متوسط', 'Facebook Ads', '2024-01-25', 'agent-001', '2024-01-28', '15:00', 'teacher-002', 'scheduled', 'pending', 'مرشحة ممتازة للمجموعة المتوسطة'),
  ('visitor-002', 'عمر خالد', 'خالد سليم', '+213661234573', 16, 'متقدم', 'إحالة من صديق', '2024-01-26', 'agent-002', '2024-01-30', '14:00', 'teacher-001', 'completed', 'enrolled', 'انضم للمجموعة المتقدمة'),
  ('visitor-003', 'نور الدين علي', 'علي حسن', '+213661234574', 11, 'مبتدئ', 'Google Ads', '2024-01-27', 'agent-001', '2024-02-01', '10:30', 'teacher-003', 'scheduled', 'pending', 'يحتاج لتعزيز في الأساسيات');

-- Insert sample campaigns
INSERT OR IGNORE INTO campaigns (id, name, platform, start_date, end_date, budget, spent_amount, impressions, clicks, ctr, leads_generated, cost_per_lead, status) VALUES
  ('campaign-001', 'حملة التسجيل الشتوي 2024', 'Facebook', '2024-01-01', '2024-02-28', 15000, 12500, 125000, 3500, 2.8, 45, 277.78, 'active'),
  ('campaign-002', 'حملة Google للطلاب الجدد', 'Google Ads', '2024-01-15', '2024-03-15', 20000, 8000, 80000, 2400, 3.0, 32, 250.0, 'active'),
  ('campaign-003', 'حملة Instagram التفاعلية', 'Instagram', '2024-02-01', '2024-02-29', 8000, 6500, 65000, 1950, 3.0, 28, 232.14, 'completed');

-- Insert sample leads
INSERT OR IGNORE INTO leads (id, name, phone, email, source, campaign_id, received_date, status, follow_up_date, assigned_agent_id, notes) VALUES
  ('lead-001', 'أحمد محمد سعيد', '+213661234575', 'lead1@example.com', 'Facebook Ads', 'campaign-001', '2024-01-20', 'contacted', '2024-01-25', 'agent-001', 'مهتم بدروس الرياضيات'),
  ('lead-002', 'مريم عبد الله', '+213661234576', 'lead2@example.com', 'Google Ads', 'campaign-002', '2024-01-22', 'qualified', '2024-01-28', 'agent-002', 'تبحث عن دروس اللغة العربية'),
  ('lead-003', 'عبد الرحمن خالد', '+213661234577', 'lead3@example.com', 'Instagram', 'campaign-003', '2024-01-24', 'new', '2024-01-30', 'agent-001', 'عميل محتمل جديد');

-- Insert sample payments
INSERT OR IGNORE INTO payments (id, student_id, student_name, payment_date, amount, month_paid, payment_method, receipt_number, responsible_agent_id, notes) VALUES
  ('payment-001', 'student-001', 'علي محمد أحمد', '2024-01-15', 8000, 'يناير 2024', 'تحويل بنكي', 'REC-001-2024', 'agent-001', 'دفع في الموعد'),
  ('payment-002', 'student-002', 'فاطمة سعيد علي', '2024-01-20', 7500, 'يناير 2024', 'نقدا', 'REC-002-2024', 'agent-002', 'دفع نقدي'),
  ('payment-003', 'student-004', 'أمينة حسن', '2024-01-10', 8000, 'يناير 2024', 'تحويل بنكي', 'REC-003-2024', 'agent-001', 'دفع مبكر'),
  ('payment-004', 'student-001', 'علي محمد أحمد', '2024-02-15', 8000, 'فبراير 2024', 'تحويل بنكي', 'REC-004-2024', 'agent-001', 'دفع شهري منتظم');

-- Insert sample attendance records
INSERT OR IGNORE INTO attendance (id, date, student_id, student_name, group_id, class_time, status, absence_reason, notes) VALUES
  ('att-001', '2024-01-21', 'student-001', 'علي محمد أحمد', 'group-001', '14:00', 'present', NULL, 'مشاركة ممتازة'),
  ('att-002', '2024-01-21', 'student-004', 'أمينة حسن', 'group-001', '14:00', 'present', NULL, 'حضور منتظم'),
  ('att-003', '2024-01-22', 'student-002', 'فاطمة سعيد علي', 'group-002', '16:00', 'present', NULL, 'أداء جيد'),
  ('att-004', '2024-01-24', 'student-003', 'خالد عبد الرحمن', 'group-003', '10:00', 'absent', 'مرض', 'غائب لظروف صحية'),
  ('att-005', '2024-01-21', 'student-005', 'يوسف إبراهيم', 'group-004', '16:00', 'late', NULL, 'تأخير 10 دقائق');

-- Insert sample expenses
INSERT OR IGNORE INTO expenses (id, date, type, description, amount, category, invoice_number, vendor, payment_status) VALUES
  ('exp-001', '2024-01-15', 'إيجار', 'إيجار المبنى الشهري', 25000, 'إيجار', 'INV-2024-001', 'مالك العقار', 'paid'),
  ('exp-002', '2024-01-20', 'كهرباء', 'فاتورة الكهرباء', 3500, 'مرافق', 'INV-2024-002', 'شركة الكهرباء', 'paid'),
  ('exp-003', '2024-01-25', 'إنترنت', 'اشتراك الإنترنت الشهري', 2000, 'تقنية', 'INV-2024-003', 'شركة الاتصالات', 'pending');

-- Insert sample salaries
INSERT OR IGNORE INTO salaries (id, employee_id, employee_name, position, base_salary, allowances, deductions, total_salary, payment_date, payment_status, notes) VALUES
  ('sal-001', 'teacher-001', 'أستاذ أحمد محمد', 'مدرس رياضيات', 45000, 5000, 2000, 48000, '2024-01-31', 'paid', 'راتب يناير 2024'),
  ('sal-002', 'teacher-002', 'أستاذة فاطمة علي', 'مدرسة لغة عربية', 48000, 4000, 2000, 50000, '2024-01-31', 'paid', 'راتب يناير 2024'),
  ('sal-003', 'agent-001', 'وكيل خدمة العملاء 1', 'وكيل خدمة العملاء', 30000, 3000, 1500, 31500, '2024-01-31', 'pending', 'راتب يناير 2024');

-- Update group student counts
UPDATE groups SET student_count = (
  SELECT COUNT(*) FROM students WHERE group_id = groups.id AND status = 'active'
);