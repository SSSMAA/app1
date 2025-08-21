// Database utility functions for ISCHOOLGO
import type { Bindings, DashboardStats, Student, User, Group, Payment, Visitor, Lead, Campaign } from '../types';

export class DatabaseService {
  constructor(private db: D1Database) {}

  // Dashboard Statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [
        totalStudents,
        activeStudents,
        totalRevenue,
        monthlyRevenue,
        pendingPayments,
        overduePayments,
        totalTeachers,
        activeGroups,
        newVisitors,
        trialBookings
      ] = await Promise.all([
        this.db.prepare("SELECT COUNT(*) as count FROM students").first(),
        this.db.prepare("SELECT COUNT(*) as count FROM students WHERE status = 'active'").first(),
        this.db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM payments").first(),
        this.db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE strftime('%Y-%m', payment_date) = strftime('%Y-%m', 'now')").first(),
        this.db.prepare("SELECT COUNT(*) as count FROM students WHERE payment_status = 'pending'").first(),
        this.db.prepare("SELECT COUNT(*) as count FROM students WHERE payment_status = 'overdue'").first(),
        this.db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'teacher' AND status = 'active'").first(),
        this.db.prepare("SELECT COUNT(*) as count FROM groups WHERE status = 'active'").first(),
        this.db.prepare("SELECT COUNT(*) as count FROM visitors WHERE strftime('%Y-%m', contact_date) = strftime('%Y-%m', 'now')").first(),
        this.db.prepare("SELECT COUNT(*) as count FROM visitors WHERE trial_status = 'scheduled'").first()
      ]);

      // Calculate attendance rate
      const attendanceRate = await this.db.prepare(`
        SELECT 
          COALESCE(
            (SELECT COUNT(*) FROM attendance WHERE status = 'present' AND date >= date('now', '-30 days')) * 100.0 / 
            NULLIF((SELECT COUNT(*) FROM attendance WHERE date >= date('now', '-30 days')), 0),
            0
          ) as rate
      `).first();

      // Calculate conversion rate
      const conversionRate = await this.db.prepare(`
        SELECT 
          COALESCE(
            (SELECT COUNT(*) FROM visitors WHERE final_decision = 'enrolled') * 100.0 / 
            NULLIF((SELECT COUNT(*) FROM visitors), 0),
            0
          ) as rate
      `).first();

      return {
        total_students: (totalStudents as any)?.count || 0,
        active_students: (activeStudents as any)?.count || 0,
        total_revenue: (totalRevenue as any)?.total || 0,
        monthly_revenue: (monthlyRevenue as any)?.total || 0,
        pending_payments: (pendingPayments as any)?.count || 0,
        overdue_payments: (overduePayments as any)?.count || 0,
        total_teachers: (totalTeachers as any)?.count || 0,
        active_groups: (activeGroups as any)?.count || 0,
        attendance_rate: (attendanceRate as any)?.rate || 0,
        new_visitors: (newVisitors as any)?.count || 0,
        trial_bookings: (trialBookings as any)?.count || 0,
        conversion_rate: (conversionRate as any)?.rate || 0
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        total_students: 0,
        active_students: 0,
        total_revenue: 0,
        monthly_revenue: 0,
        pending_payments: 0,
        overdue_payments: 0,
        total_teachers: 0,
        active_groups: 0,
        attendance_rate: 0,
        new_visitors: 0,
        trial_bookings: 0,
        conversion_rate: 0
      };
    }
  }

  // Students
  async getStudents(limit = 50, offset = 0): Promise<Student[]> {
    const result = await this.db.prepare(`
      SELECT * FROM students 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all();
    return result.results as Student[];
  }

  async getStudentById(id: string): Promise<Student | null> {
    const result = await this.db.prepare("SELECT * FROM students WHERE id = ?").bind(id).first();
    return result as Student | null;
  }

  async createStudent(student: Omit<Student, 'id' | 'created_at'>): Promise<string> {
    const id = 'student-' + Date.now() + '-' + Math.random().toString(36).substring(7);
    await this.db.prepare(`
      INSERT INTO students (id, student_name, parent_name, phone, email, age, level, group_id, teacher_id, 
                           registration_date, subscription_type, monthly_fee, payment_status, last_payment_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, student.student_name, student.parent_name, student.phone, student.email, student.age,
      student.level, student.group_id, student.teacher_id, student.registration_date,
      student.subscription_type, student.monthly_fee, student.payment_status, 
      student.last_payment_date, student.status
    ).run();
    return id;
  }

  // Users
  async getUsers(): Promise<User[]> {
    const result = await this.db.prepare("SELECT * FROM users ORDER BY created_at DESC").all();
    return result.results as User[];
  }

  async getUsersByRole(role: string): Promise<User[]> {
    const result = await this.db.prepare("SELECT * FROM users WHERE role = ? AND status = 'active'").bind(role).all();
    return result.results as User[];
  }

  // Groups
  async getGroups(): Promise<Group[]> {
    const result = await this.db.prepare("SELECT * FROM groups ORDER BY created_at DESC").all();
    return result.results as Group[];
  }

  async getActiveGroups(): Promise<Group[]> {
    const result = await this.db.prepare("SELECT * FROM groups WHERE status = 'active' ORDER BY name").all();
    return result.results as Group[];
  }

  // Payments
  async getPayments(limit = 50, offset = 0): Promise<Payment[]> {
    const result = await this.db.prepare(`
      SELECT * FROM payments 
      ORDER BY payment_date DESC 
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all();
    return result.results as Payment[];
  }

  async createPayment(payment: Omit<Payment, 'id' | 'created_at'>): Promise<string> {
    const id = 'payment-' + Date.now() + '-' + Math.random().toString(36).substring(7);
    await this.db.prepare(`
      INSERT INTO payments (id, student_id, student_name, payment_date, amount, month_paid, 
                           payment_method, receipt_number, responsible_agent_id, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, payment.student_id, payment.student_name, payment.payment_date, payment.amount,
      payment.month_paid, payment.payment_method, payment.receipt_number,
      payment.responsible_agent_id, payment.notes
    ).run();
    
    // Update student payment status
    await this.db.prepare(`
      UPDATE students 
      SET payment_status = 'paid', last_payment_date = ? 
      WHERE id = ?
    `).bind(payment.payment_date, payment.student_id).run();
    
    return id;
  }

  // Visitors
  async getVisitors(limit = 50, offset = 0): Promise<Visitor[]> {
    const result = await this.db.prepare(`
      SELECT * FROM visitors 
      ORDER BY contact_date DESC 
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all();
    return result.results as Visitor[];
  }

  async createVisitor(visitor: Omit<Visitor, 'id' | 'created_at'>): Promise<string> {
    const id = 'visitor-' + Date.now() + '-' + Math.random().toString(36).substring(7);
    await this.db.prepare(`
      INSERT INTO visitors (id, student_name, parent_name, phone, age, desired_level, source,
                           contact_date, assigned_agent_id, trial_date, trial_time, teacher_id,
                           trial_status, final_decision, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, visitor.student_name, visitor.parent_name, visitor.phone, visitor.age,
      visitor.desired_level, visitor.source, visitor.contact_date, visitor.assigned_agent_id,
      visitor.trial_date, visitor.trial_time, visitor.teacher_id, visitor.trial_status,
      visitor.final_decision, visitor.notes
    ).run();
    return id;
  }

  // Leads
  async getLeads(limit = 50, offset = 0): Promise<Lead[]> {
    const result = await this.db.prepare(`
      SELECT * FROM leads 
      ORDER BY received_date DESC 
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all();
    return result.results as Lead[];
  }

  async createLead(lead: Omit<Lead, 'id' | 'created_at'>): Promise<string> {
    const id = 'lead-' + Date.now() + '-' + Math.random().toString(36).substring(7);
    await this.db.prepare(`
      INSERT INTO leads (id, name, phone, email, source, campaign_id, received_date,
                        status, follow_up_date, assigned_agent_id, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, lead.name, lead.phone, lead.email, lead.source, lead.campaign_id,
      lead.received_date, lead.status, lead.follow_up_date, lead.assigned_agent_id, lead.notes
    ).run();
    return id;
  }

  // Campaigns
  async getCampaigns(): Promise<Campaign[]> {
    const result = await this.db.prepare("SELECT * FROM campaigns ORDER BY start_date DESC").all();
    return result.results as Campaign[];
  }

  // Utility functions
  async searchStudents(query: string): Promise<Student[]> {
    const result = await this.db.prepare(`
      SELECT * FROM students 
      WHERE student_name LIKE ? OR parent_name LIKE ? OR phone LIKE ?
      ORDER BY student_name
      LIMIT 20
    `).bind(`%${query}%`, `%${query}%`, `%${query}%`).all();
    return result.results as Student[];
  }
}