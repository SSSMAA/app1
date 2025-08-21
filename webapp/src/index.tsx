import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import type { HonoContext, Bindings } from './types'
import { DatabaseService } from './lib/database'
import { marketerDashboard } from './routes/marketer'

const app = new Hono<HonoContext>()

// Enable CORS for frontend-backend communication
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// API Routes

// Dashboard API
app.get('/api/dashboard/stats', async (c) => {
  try {
    const db = new DatabaseService(c.env.DB)
    const stats = await db.getDashboardStats()
    return c.json(stats)
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return c.json({ error: 'Failed to fetch dashboard statistics' }, 500)
  }
})

// Students API
app.get('/api/students', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '50')
    const offset = parseInt(c.req.query('offset') || '0')
    const search = c.req.query('search')
    
    const db = new DatabaseService(c.env.DB)
    let students
    
    if (search) {
      students = await db.searchStudents(search)
    } else {
      students = await db.getStudents(limit, offset)
    }
    
    return c.json({ students })
  } catch (error) {
    console.error('Students API error:', error)
    return c.json({ error: 'Failed to fetch students' }, 500)
  }
})

app.get('/api/students/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const db = new DatabaseService(c.env.DB)
    const student = await db.getStudentById(id)
    
    if (!student) {
      return c.json({ error: 'Student not found' }, 404)
    }
    
    return c.json(student)
  } catch (error) {
    console.error('Student by ID error:', error)
    return c.json({ error: 'Failed to fetch student' }, 500)
  }
})

app.post('/api/students', async (c) => {
  try {
    const data = await c.req.json()
    const db = new DatabaseService(c.env.DB)
    const id = await db.createStudent(data)
    return c.json({ id, message: 'Student created successfully' })
  } catch (error) {
    console.error('Create student error:', error)
    return c.json({ error: 'Failed to create student' }, 500)
  }
})

// Visitors API
app.get('/api/visitors', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '50')
    const offset = parseInt(c.req.query('offset') || '0')
    
    const db = new DatabaseService(c.env.DB)
    const visitors = await db.getVisitors(limit, offset)
    
    return c.json({ visitors })
  } catch (error) {
    console.error('Visitors API error:', error)
    return c.json({ error: 'Failed to fetch visitors' }, 500)
  }
})

app.post('/api/visitors', async (c) => {
  try {
    const data = await c.req.json()
    const db = new DatabaseService(c.env.DB)
    const id = await db.createVisitor(data)
    return c.json({ id, message: 'Visitor created successfully' })
  } catch (error) {
    console.error('Create visitor error:', error)
    return c.json({ error: 'Failed to create visitor' }, 500)
  }
})

// Payments API
app.get('/api/payments', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '50')
    const offset = parseInt(c.req.query('offset') || '0')
    
    const db = new DatabaseService(c.env.DB)
    const payments = await db.getPayments(limit, offset)
    
    return c.json({ payments })
  } catch (error) {
    console.error('Payments API error:', error)
    return c.json({ error: 'Failed to fetch payments' }, 500)
  }
})

app.post('/api/payments', async (c) => {
  try {
    const data = await c.req.json()
    const db = new DatabaseService(c.env.DB)
    const id = await db.createPayment(data)
    return c.json({ id, message: 'Payment recorded successfully' })
  } catch (error) {
    console.error('Create payment error:', error)
    return c.json({ error: 'Failed to record payment' }, 500)
  }
})

// Groups API
app.get('/api/groups', async (c) => {
  try {
    const db = new DatabaseService(c.env.DB)
    const active = c.req.query('active')
    
    let groups
    if (active === 'true') {
      groups = await db.getActiveGroups()
    } else {
      groups = await db.getGroups()
    }
    
    return c.json({ groups })
  } catch (error) {
    console.error('Groups API error:', error)
    return c.json({ error: 'Failed to fetch groups' }, 500)
  }
})

// Users API
app.get('/api/users', async (c) => {
  try {
    const role = c.req.query('role')
    const db = new DatabaseService(c.env.DB)
    
    let users
    if (role) {
      users = await db.getUsersByRole(role)
    } else {
      users = await db.getUsers()
    }
    
    return c.json({ users })
  } catch (error) {
    console.error('Users API error:', error)
    return c.json({ error: 'Failed to fetch users' }, 500)
  }
})

// Leads API
app.get('/api/leads', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '50')
    const offset = parseInt(c.req.query('offset') || '0')
    
    const db = new DatabaseService(c.env.DB)
    const leads = await db.getLeads(limit, offset)
    
    return c.json({ leads })
  } catch (error) {
    console.error('Leads API error:', error)
    return c.json({ error: 'Failed to fetch leads' }, 500)
  }
})

app.post('/api/leads', async (c) => {
  try {
    const data = await c.req.json()
    const db = new DatabaseService(c.env.DB)
    const id = await db.createLead(data)
    return c.json({ id, message: 'Lead created successfully' })
  } catch (error) {
    console.error('Create lead error:', error)
    return c.json({ error: 'Failed to create lead' }, 500)
  }
})

// Campaigns API
app.get('/api/campaigns', async (c) => {
  try {
    const db = new DatabaseService(c.env.DB)
    const campaigns = await db.getCampaigns()
    
    return c.json({ campaigns })
  } catch (error) {
    console.error('Campaigns API error:', error)
    return c.json({ error: 'Failed to fetch campaigns' }, 500)
  }
})

// Main Dashboard Route - Role Selection
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ISCHOOLGO - نظام إدارة المدرسة</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
          .role-card:hover { transform: translateY(-5px); transition: transform 0.3s ease; }
          .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        </style>
    </head>
    <body class="bg-gray-50 min-h-screen">
        <div class="gradient-bg text-white py-12">
            <div class="max-w-6xl mx-auto px-4 text-center">
                <h1 class="text-4xl font-bold mb-4">
                    <i class="fas fa-graduation-cap mr-3"></i>
                    ISCHOOLGO
                </h1>
                <p class="text-xl opacity-90">نظام إدارة المدرسة المتكامل</p>
            </div>
        </div>

        <div class="max-w-6xl mx-auto px-4 -mt-8">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Admin -->
                <div class="role-card bg-white rounded-xl shadow-lg p-6 text-center cursor-pointer" onclick="window.location.href='/admin'">
                    <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-crown text-red-600 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">المدير العام</h3>
                    <p class="text-gray-600 mb-4">إدارة النظام المالي والإحصائيات العامة</p>
                    <div class="text-sm text-gray-500">
                        <span class="block">• الرواتب والمصاريف</span>
                        <span class="block">• التقارير المالية</span>
                        <span class="block">• لوحة القيادة الشاملة</span>
                    </div>
                </div>

                <!-- Director -->
                <div class="role-card bg-white rounded-xl shadow-lg p-6 text-center cursor-pointer" onclick="window.location.href='/director'">
                    <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-user-tie text-blue-600 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">المدير التنفيذي</h3>
                    <p class="text-gray-600 mb-4">الإشراف العام وإدارة العمليات</p>
                    <div class="text-sm text-gray-500">
                        <span class="block">• متابعة الزوار</span>
                        <span class="block">• إدارة الأساتذة</span>
                        <span class="block">• التقارير التنفيذية</span>
                    </div>
                </div>

                <!-- Marketer -->
                <div class="role-card bg-white rounded-xl shadow-lg p-6 text-center cursor-pointer" onclick="window.location.href='/marketer'">
                    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-bullhorn text-green-600 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">مسؤول التسويق</h3>
                    <p class="text-gray-600 mb-4">إدارة الحملات الإعلانية والعملاء المحتملين</p>
                    <div class="text-sm text-gray-500">
                        <span class="block">• الحملات الإعلانية</span>
                        <span class="block">• العملاء المحتملين</span>
                        <span class="block">• تحليل الأداء</span>
                    </div>
                </div>

                <!-- Head Trainer -->
                <div class="role-card bg-white rounded-xl shadow-lg p-6 text-center cursor-pointer" onclick="window.location.href='/headtrainer'">
                    <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-chalkboard-teacher text-purple-600 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">مسؤول التدريب</h3>
                    <p class="text-gray-600 mb-4">إدارة الأساتذة والمناهج والمجموعات</p>
                    <div class="text-sm text-gray-500">
                        <span class="block">• إدارة الأساتذة</span>
                        <span class="block">• المجموعات والفصول</span>
                        <span class="block">• المناهج والمحتوى</span>
                    </div>
                </div>

                <!-- Agent -->
                <div class="role-card bg-white rounded-xl shadow-lg p-6 text-center cursor-pointer" onclick="window.location.href='/agent'">
                    <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-headset text-yellow-600 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">وكيل خدمة العملاء</h3>
                    <p class="text-gray-600 mb-4">استقبال العملاء وإدارة الطلاب والمدفوعات</p>
                    <div class="text-sm text-gray-500">
                        <span class="block">• استقبال الزوار</span>
                        <span class="block">• إدارة الطلاب</span>
                        <span class="block">• المدفوعات والمتابعة</span>
                    </div>
                </div>

                <!-- Teacher -->
                <div class="role-card bg-white rounded-xl shadow-lg p-6 text-center cursor-pointer" onclick="window.location.href='/teacher'">
                    <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-book-open text-indigo-600 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">الأساتذة</h3>
                    <p class="text-gray-600 mb-4">إدارة الصفوف والحضور والتقييمات</p>
                    <div class="text-sm text-gray-500">
                        <span class="block">• إدارة المجموعات</span>
                        <span class="block">• تسجيل الحضور</span>
                        <span class="block">• خطط الدروس والتقييمات</span>
                    </div>
                </div>
            </div>

            <div class="text-center mt-12 pb-8">
                <p class="text-gray-600">
                    <i class="fas fa-info-circle mr-2"></i>
                    اختر دورك للوصول إلى الوحة التحكم المخصصة
                </p>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    </body>
    </html>
  `)
})

// Admin Dashboard
app.get('/admin', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ISCHOOLGO - لوحة المدير العام</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        </style>
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                <div class="flex items-center">
                    <a href="/" class="text-gray-600 hover:text-gray-800 ml-4">
                        <i class="fas fa-arrow-right"></i>
                    </a>
                    <h1 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-crown text-red-600 mr-2"></i>
                        لوحة المدير العام
                    </h1>
                </div>
                <div class="text-sm text-gray-600">
                    <span id="currentDate"></span>
                </div>
            </div>
        </header>

        <div class="max-w-7xl mx-auto px-4 py-8">
            <!-- Loading State -->
            <div id="loading" class="text-center py-12">
                <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
                <p class="text-gray-600 mt-4">جاري تحميل البيانات...</p>
            </div>

            <!-- Dashboard Content -->
            <div id="dashboard-content" class="hidden">
                <!-- Stats Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center">
                            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-users text-blue-600"></i>
                            </div>
                            <div class="mr-4">
                                <p class="text-sm text-gray-600">إجمالي الطلاب</p>
                                <p class="text-2xl font-bold text-gray-800" id="totalStudents">0</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center">
                            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-dollar-sign text-green-600"></i>
                            </div>
                            <div class="mr-4">
                                <p class="text-sm text-gray-600">الإيرادات الشهرية</p>
                                <p class="text-2xl font-bold text-gray-800" id="monthlyRevenue">0 دج</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center">
                            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-clock text-yellow-600"></i>
                            </div>
                            <div class="mr-4">
                                <p class="text-sm text-gray-600">مدفوعات معلقة</p>
                                <p class="text-2xl font-bold text-gray-800" id="pendingPayments">0</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center">
                            <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-exclamation-triangle text-red-600"></i>
                            </div>
                            <div class="mr-4">
                                <p class="text-sm text-gray-600">مدفوعات متأخرة</p>
                                <p class="text-2xl font-bold text-gray-800" id="overduePayments">0</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Charts and Tables Section -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <!-- Revenue Chart -->
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">
                            <i class="fas fa-chart-line text-blue-600 mr-2"></i>
                            تطور الإيرادات
                        </h3>
                        <canvas id="revenueChart" width="400" height="200"></canvas>
                    </div>

                    <!-- Students Distribution -->
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">
                            <i class="fas fa-chart-pie text-green-600 mr-2"></i>
                            توزيع الطلاب حسب المستوى
                        </h3>
                        <canvas id="studentsChart" width="400" height="200"></canvas>
                    </div>
                </div>

                <!-- Recent Payments Table -->
                <div class="bg-white rounded-lg shadow">
                    <div class="p-6 border-b border-gray-200">
                        <h3 class="text-lg font-semibold text-gray-800">
                            <i class="fas fa-receipt text-purple-600 mr-2"></i>
                            المدفوعات الأخيرة
                        </h3>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الطالب</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الشهر</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">طريقة الدفع</th>
                                </tr>
                            </thead>
                            <tbody id="paymentsTableBody" class="bg-white divide-y divide-gray-200">
                                <!-- Dynamic content will be inserted here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            // Set current date
            document.getElementById('currentDate').textContent = new Date().toLocaleDateString('ar-EG');

            // Load dashboard data
            async function loadDashboard() {
                try {
                    const [statsResponse, paymentsResponse] = await Promise.all([
                        axios.get('/api/dashboard/stats'),
                        axios.get('/api/payments?limit=10')
                    ]);

                    const stats = statsResponse.data;
                    const payments = paymentsResponse.data.payments;

                    // Update stats cards
                    document.getElementById('totalStudents').textContent = stats.total_students;
                    document.getElementById('monthlyRevenue').textContent = (stats.monthly_revenue || 0).toLocaleString() + ' دج';
                    document.getElementById('pendingPayments').textContent = stats.pending_payments;
                    document.getElementById('overduePayments').textContent = stats.overdue_payments;

                    // Load payments table
                    loadPaymentsTable(payments);

                    // Load charts
                    loadCharts(stats);

                    // Hide loading and show content
                    document.getElementById('loading').classList.add('hidden');
                    document.getElementById('dashboard-content').classList.remove('hidden');

                } catch (error) {
                    console.error('Error loading dashboard:', error);
                    document.getElementById('loading').innerHTML = '<p class="text-red-600">خطأ في تحميل البيانات</p>';
                }
            }

            function loadPaymentsTable(payments) {
                const tbody = document.getElementById('paymentsTableBody');
                tbody.innerHTML = payments.map(payment => \`
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            \${payment.student_name || 'غير محدد'}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            \${payment.amount.toLocaleString()} دج
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            \${payment.month_paid}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            \${new Date(payment.payment_date).toLocaleDateString('ar-EG')}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            \${payment.payment_method || 'غير محدد'}
                        </td>
                    </tr>
                \`).join('');
            }

            function loadCharts(stats) {
                // Revenue Chart
                const revenueCtx = document.getElementById('revenueChart').getContext('2d');
                new Chart(revenueCtx, {
                    type: 'line',
                    data: {
                        labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
                        datasets: [{
                            label: 'الإيرادات الشهرية',
                            data: [85000, 92000, 78000, 95000, stats.monthly_revenue || 0, 88000],
                            borderColor: 'rgb(59, 130, 246)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.1
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                            }
                        }
                    }
                });

                // Students Distribution Chart
                const studentsCtx = document.getElementById('studentsChart').getContext('2d');
                new Chart(studentsCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['مبتدئ', 'متوسط', 'متقدم'],
                        datasets: [{
                            data: [30, 45, 25],
                            backgroundColor: [
                                'rgb(34, 197, 94)',
                                'rgb(59, 130, 246)', 
                                'rgb(168, 85, 247)'
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'bottom',
                            }
                        }
                    }
                });
            }

            // Load dashboard on page load
            loadDashboard();
        </script>
    </body>
    </html>
  `)
})

// Marketer Dashboard Route
app.get('/marketer', (c) => {
  return c.html(marketerDashboard)
})

// Director Dashboard Route  
app.get('/director', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ISCHOOLGO - لوحة المدير التنفيذي</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    </head>
    <body class="bg-gray-50">
        <header class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                <div class="flex items-center">
                    <a href="/" class="text-gray-600 hover:text-gray-800 ml-4">
                        <i class="fas fa-arrow-right"></i>
                    </a>
                    <h1 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-user-tie text-blue-600 mr-2"></i>
                        لوحة المدير التنفيذي
                    </h1>
                </div>
            </div>
        </header>

        <div class="max-w-7xl mx-auto px-4 py-8">
            <!-- KPI Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-user-plus text-blue-600"></i>
                        </div>
                        <div class="mr-4">
                            <p class="text-sm text-gray-600">زوار جدد هذا الشهر</p>
                            <p class="text-2xl font-bold text-gray-800" id="newVisitors">0</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-calendar-check text-green-600"></i>
                        </div>
                        <div class="mr-4">
                            <p class="text-sm text-gray-600">حصص تجريبية مجدولة</p>
                            <p class="text-2xl font-bold text-gray-800" id="trialBookings">0</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-percentage text-purple-600"></i>
                        </div>
                        <div class="mr-4">
                            <p class="text-sm text-gray-600">معدل التحويل</p>
                            <p class="text-2xl font-bold text-gray-800" id="conversionRate">0%</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-chalkboard-teacher text-yellow-600"></i>
                        </div>
                        <div class="mr-4">
                            <p class="text-sm text-gray-600">الأساتذة النشطون</p>
                            <p class="text-2xl font-bold text-gray-800" id="activeTeachers">0</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content Tabs -->
            <div class="bg-white rounded-lg shadow mb-6">
                <div class="border-b border-gray-200">
                    <nav class="-mb-px flex space-x-8 px-6">
                        <button onclick="showTab('overview')" class="tab-btn py-4 px-1 border-b-2 font-medium text-sm active" data-tab="overview">
                            <i class="fas fa-chart-pie mr-2"></i>نظرة عامة
                        </button>
                        <button onclick="showTab('visitors')" class="tab-btn py-4 px-1 border-b-2 font-medium text-sm" data-tab="visitors">
                            <i class="fas fa-users mr-2"></i>متابعة الزوار
                        </button>
                        <button onclick="showTab('performance')" class="tab-btn py-4 px-1 border-b-2 font-medium text-sm" data-tab="performance">
                            <i class="fas fa-star mr-2"></i>أداء الأساتذة
                        </button>
                        <button onclick="showTab('reports')" class="tab-btn py-4 px-1 border-b-2 font-medium text-sm" data-tab="reports">
                            <i class="fas fa-file-alt mr-2"></i>التقارير
                        </button>
                    </nav>
                </div>
            </div>

            <!-- Overview Tab -->
            <div id="overview-tab" class="tab-content">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">
                            <i class="fas fa-chart-line text-blue-600 mr-2"></i>
                            تطور الزوار والتحويلات
                        </h3>
                        <canvas id="visitorsChart" width="400" height="200"></canvas>
                    </div>

                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">
                            <i class="fas fa-users-cog text-green-600 mr-2"></i>
                            توزيع أداء الأساتذة
                        </h3>
                        <canvas id="teachersChart" width="400" height="200"></canvas>
                    </div>
                </div>
            </div>

            <!-- Other tabs content will be loaded dynamically -->
            <div id="visitors-tab" class="tab-content hidden">
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">متابعة الزوار والحصص التجريبية</h3>
                    <div id="visitorsTable">جاري التحميل...</div>
                </div>
            </div>

            <div id="performance-tab" class="tab-content hidden">
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">تقييم أداء الأساتذة</h3>
                    <div id="teachersTable">جاري التحميل...</div>
                </div>
            </div>

            <div id="reports-tab" class="tab-content hidden">
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">التقارير الأسبوعية والشهرية</h3>
                    <div class="text-center py-8 text-gray-500">
                        <i class="fas fa-file-alt text-4xl mb-4"></i>
                        <p>ستتوفر التقارير قريباً</p>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            function showTab(tabName) {
                document.querySelectorAll('.tab-content').forEach(tab => {
                    tab.classList.add('hidden');
                });
                
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.classList.remove('active', 'border-blue-500', 'text-blue-600');
                    btn.classList.add('border-transparent', 'text-gray-500');
                });
                
                document.getElementById(tabName + '-tab').classList.remove('hidden');
                
                const activeBtn = document.querySelector(\`[data-tab="\${tabName}"]\`);
                activeBtn.classList.add('active', 'border-blue-500', 'text-blue-600');
                activeBtn.classList.remove('border-transparent', 'text-gray-500');
                
                if (tabName === 'overview') {
                    loadOverviewCharts();
                }
            }

            async function loadDashboard() {
                try {
                    const statsResponse = await axios.get('/api/dashboard/stats');
                    const stats = statsResponse.data;

                    document.getElementById('newVisitors').textContent = stats.new_visitors;
                    document.getElementById('trialBookings').textContent = stats.trial_bookings;
                    document.getElementById('conversionRate').textContent = stats.conversion_rate.toFixed(1) + '%';
                    document.getElementById('activeTeachers').textContent = stats.total_teachers;

                } catch (error) {
                    console.error('Error loading dashboard:', error);
                }
            }

            function loadOverviewCharts() {
                // Visitors Chart
                const visitorsCtx = document.getElementById('visitorsChart').getContext('2d');
                new Chart(visitorsCtx, {
                    type: 'line',
                    data: {
                        labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
                        datasets: [
                            {
                                label: 'زوار جدد',
                                data: [25, 32, 28, 35, 42, 38],
                                borderColor: 'rgb(59, 130, 246)',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            },
                            {
                                label: 'تحويلات',
                                data: [8, 12, 9, 14, 16, 15],
                                borderColor: 'rgb(34, 197, 94)',
                                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                            }
                        }
                    }
                });

                // Teachers Performance Chart
                const teachersCtx = document.getElementById('teachersChart').getContext('2d');
                new Chart(teachersCtx, {
                    type: 'radar',
                    data: {
                        labels: ['الحضور', 'التفاعل', 'النتائج', 'الرضا', 'الالتزام'],
                        datasets: [{
                            label: 'متوسط أداء الأساتذة',
                            data: [4.5, 4.2, 4.7, 4.3, 4.6],
                            borderColor: 'rgb(168, 85, 247)',
                            backgroundColor: 'rgba(168, 85, 247, 0.2)',
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            r: {
                                beginAtZero: true,
                                max: 5
                            }
                        }
                    }
                });
            }

            // Initialize
            loadDashboard();
            showTab('overview');
        </script>
    </body>
    </html>
  `)
})

// Head Trainer Dashboard Route
app.get('/headtrainer', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ISCHOOLGO - لوحة مسؤول التدريب</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <header class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                <div class="flex items-center">
                    <a href="/" class="text-gray-600 hover:text-gray-800 ml-4">
                        <i class="fas fa-arrow-right"></i>
                    </a>
                    <h1 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-chalkboard-teacher text-purple-600 mr-2"></i>
                        مسؤول التدريب والتعليم
                    </h1>
                </div>
            </div>
        </header>

        <div class="max-w-7xl mx-auto px-4 py-8">
            <!-- Quick Stats -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow p-6 text-center">
                    <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <i class="fas fa-users text-blue-600"></i>
                    </div>
                    <p class="text-sm text-gray-600 mb-1">إجمالي الأساتذة</p>
                    <p class="text-2xl font-bold text-gray-800" id="totalTeachers">0</p>
                </div>
                
                <div class="bg-white rounded-lg shadow p-6 text-center">
                    <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <i class="fas fa-layer-group text-green-600"></i>
                    </div>
                    <p class="text-sm text-gray-600 mb-1">المجموعات النشطة</p>
                    <p class="text-2xl font-bold text-gray-800" id="activeGroups">0</p>
                </div>
                
                <div class="bg-white rounded-lg shadow p-6 text-center">
                    <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <i class="fas fa-graduation-cap text-purple-600"></i>
                    </div>
                    <p class="text-sm text-gray-600 mb-1">إجمالي الطلاب</p>
                    <p class="text-2xl font-bold text-gray-800" id="totalStudentsHT">0</p>
                </div>
                
                <div class="bg-white rounded-lg shadow p-6 text-center">
                    <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <i class="fas fa-star text-yellow-600"></i>
                    </div>
                    <p class="text-sm text-gray-600 mb-1">متوسط التقييم</p>
                    <p class="text-2xl font-bold text-gray-800">4.7</p>
                </div>
            </div>

            <!-- Tabs Navigation -->
            <div class="bg-white rounded-lg shadow mb-6">
                <div class="border-b border-gray-200">
                    <nav class="-mb-px flex space-x-8 px-6">
                        <button onclick="showTab('teachers')" class="tab-btn py-4 px-1 border-b-2 font-medium text-sm active" data-tab="teachers">
                            <i class="fas fa-users mr-2"></i>الأساتذة
                        </button>
                        <button onclick="showTab('groups')" class="tab-btn py-4 px-1 border-b-2 font-medium text-sm" data-tab="groups">
                            <i class="fas fa-layer-group mr-2"></i>المجموعات
                        </button>
                        <button onclick="showTab('curriculum')" class="tab-btn py-4 px-1 border-b-2 font-medium text-sm" data-tab="curriculum">
                            <i class="fas fa-book mr-2"></i>المناهج
                        </button>
                        <button onclick="showTab('training')" class="tab-btn py-4 px-1 border-b-2 font-medium text-sm" data-tab="training">
                            <i class="fas fa-certificate mr-2"></i>التدريب
                        </button>
                    </nav>
                </div>
            </div>

            <!-- Teachers Tab -->
            <div id="teachers-tab" class="tab-content">
                <div class="bg-white rounded-lg shadow">
                    <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 class="text-lg font-semibold text-gray-800">إدارة الأساتذة</h3>
                        <button class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                            <i class="fas fa-plus mr-2"></i>إضافة أستاذ جديد
                        </button>
                    </div>
                    <div class="p-6">
                        <div id="teachersTable">
                            <p class="text-center text-gray-500 py-8">جاري تحميل بيانات الأساتذة...</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Groups Tab -->
            <div id="groups-tab" class="tab-content hidden">
                <div class="bg-white rounded-lg shadow">
                    <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 class="text-lg font-semibold text-gray-800">المجموعات والفصول</h3>
                        <button class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                            <i class="fas fa-plus mr-2"></i>إنشاء مجموعة جديدة
                        </button>
                    </div>
                    <div class="p-6">
                        <div id="groupsTable">
                            <p class="text-center text-gray-500 py-8">جاري تحميل بيانات المجموعات...</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Other tabs placeholders -->
            <div id="curriculum-tab" class="tab-content hidden">
                <div class="bg-white rounded-lg shadow p-6 text-center">
                    <i class="fas fa-book text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-lg font-medium text-gray-600 mb-2">إدارة المناهج والمحتوى</h3>
                    <p class="text-gray-500">سيتم تطوير هذا القسم قريباً</p>
                </div>
            </div>

            <div id="training-tab" class="tab-content hidden">
                <div class="bg-white rounded-lg shadow p-6 text-center">
                    <i class="fas fa-certificate text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-lg font-medium text-gray-600 mb-2">برامج التدريب والتطوير</h3>
                    <p class="text-gray-500">سيتم تطوير هذا القسم قريباً</p>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            function showTab(tabName) {
                document.querySelectorAll('.tab-content').forEach(tab => {
                    tab.classList.add('hidden');
                });
                
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.classList.remove('active', 'border-purple-500', 'text-purple-600');
                    btn.classList.add('border-transparent', 'text-gray-500');
                });
                
                document.getElementById(tabName + '-tab').classList.remove('hidden');
                
                const activeBtn = document.querySelector(\`[data-tab="\${tabName}"]\`);
                activeBtn.classList.add('active', 'border-purple-500', 'text-purple-600');
                activeBtn.classList.remove('border-transparent', 'text-gray-500');
                
                loadTabData(tabName);
            }

            async function loadTabData(tabName) {
                try {
                    switch(tabName) {
                        case 'teachers':
                            const usersResponse = await axios.get('/api/users?role=teacher');
                            loadTeachersTable(usersResponse.data.users);
                            break;
                        case 'groups':
                            const groupsResponse = await axios.get('/api/groups');
                            loadGroupsTable(groupsResponse.data.groups);
                            break;
                    }
                } catch (error) {
                    console.error('Error loading data:', error);
                }
            }

            function loadTeachersTable(teachers) {
                const container = document.getElementById('teachersTable');
                if (teachers.length === 0) {
                    container.innerHTML = '<p class="text-center text-gray-500 py-8">لا توجد أساتذة مسجلين</p>';
                    return;
                }

                container.innerHTML = \`
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم الكامل</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">البريد الإلكتروني</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الهاتف</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ التسجيل</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                \${teachers.map(teacher => \`
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            \${teacher.full_name}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            \${teacher.email}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            \${teacher.phone || 'غير محدد'}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                \${teacher.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                                \${teacher.status === 'active' ? 'نشط' : 'غير نشط'}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            \${new Date(teacher.created_at).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <button class="text-blue-600 hover:text-blue-800 ml-2">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="text-green-600 hover:text-green-800">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        </td>
                                    </tr>
                                \`).join('')}
                            </tbody>
                        </table>
                    </div>
                \`;
            }

            function loadGroupsTable(groups) {
                const container = document.getElementById('groupsTable');
                if (groups.length === 0) {
                    container.innerHTML = '<p class="text-center text-gray-500 py-8">لا توجد مجموعات منشأة</p>';
                    return;
                }

                container.innerHTML = \`
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم المجموعة</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المستوى</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الأستاذ</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عدد الطلاب</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الطاقة القصوى</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التوقيت</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                \${groups.map(group => \`
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            \${group.name}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            \${group.level}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            \${group.teacher_name || 'غير محدد'}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            \${group.student_count} / \${group.max_capacity}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            \${group.max_capacity}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            \${group.start_time} - \${group.end_time}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                \${group.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                                \${group.status === 'active' ? 'نشطة' : 'غير نشطة'}
                                            </span>
                                        </td>
                                    </tr>
                                \`).join('')}
                            </tbody>
                        </table>
                    </div>
                \`;
            }

            async function loadDashboard() {
                try {
                    const [statsResponse, groupsResponse] = await Promise.all([
                        axios.get('/api/dashboard/stats'),
                        axios.get('/api/groups?active=true')
                    ]);

                    const stats = statsResponse.data;
                    const groups = groupsResponse.data.groups;

                    document.getElementById('totalTeachers').textContent = stats.total_teachers;
                    document.getElementById('activeGroups').textContent = stats.active_groups;
                    document.getElementById('totalStudentsHT').textContent = stats.total_students;

                } catch (error) {
                    console.error('Error loading dashboard:', error);
                }
            }

            // Initialize
            loadDashboard();
            showTab('teachers');
        </script>
    </body>
    </html>
  `)
})

// Teacher Dashboard Route
app.get('/teacher', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ISCHOOLGO - لوحة الأساتذة</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <header class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                <div class="flex items-center">
                    <a href="/" class="text-gray-600 hover:text-gray-800 ml-4">
                        <i class="fas fa-arrow-right"></i>
                    </a>
                    <h1 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-book-open text-indigo-600 mr-2"></i>
                        لوحة الأساتذة
                    </h1>
                </div>
            </div>
        </header>

        <div class="max-w-7xl mx-auto px-4 py-8">
            <!-- Welcome Card -->
            <div class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-6 mb-8">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-2xl font-bold mb-2">مرحباً بك أستاذ محمد</h2>
                        <p class="opacity-90">إليك ملخص عن مجموعاتك وطلابك اليوم</p>
                    </div>
                    <div class="hidden md:block">
                        <i class="fas fa-graduation-cap text-6xl opacity-20"></i>
                    </div>
                </div>
            </div>

            <!-- Quick Stats -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow p-6 text-center">
                    <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <i class="fas fa-layer-group text-blue-600"></i>
                    </div>
                    <p class="text-sm text-gray-600 mb-1">مجموعاتي</p>
                    <p class="text-2xl font-bold text-gray-800">4</p>
                </div>
                
                <div class="bg-white rounded-lg shadow p-6 text-center">
                    <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <i class="fas fa-users text-green-600"></i>
                    </div>
                    <p class="text-sm text-gray-600 mb-1">إجمالي الطلاب</p>
                    <p class="text-2xl font-bold text-gray-800">32</p>
                </div>
                
                <div class="bg-white rounded-lg shadow p-6 text-center">
                    <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <i class="fas fa-calendar-check text-yellow-600"></i>
                    </div>
                    <p class="text-sm text-gray-600 mb-1">حصص اليوم</p>
                    <p class="text-2xl font-bold text-gray-800">3</p>
                </div>
                
                <div class="bg-white rounded-lg shadow p-6 text-center">
                    <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <i class="fas fa-percentage text-purple-600"></i>
                    </div>
                    <p class="text-sm text-gray-600 mb-1">معدل الحضور</p>
                    <p class="text-2xl font-bold text-gray-800">87%</p>
                </div>
            </div>

            <!-- Tabs Navigation -->
            <div class="bg-white rounded-lg shadow mb-6">
                <div class="border-b border-gray-200">
                    <nav class="-mb-px flex space-x-8 px-6">
                        <button onclick="showTab('groups')" class="tab-btn py-4 px-1 border-b-2 font-medium text-sm active" data-tab="groups">
                            <i class="fas fa-layer-group mr-2"></i>مجموعاتي
                        </button>
                        <button onclick="showTab('students')" class="tab-btn py-4 px-1 border-b-2 font-medium text-sm" data-tab="students">
                            <i class="fas fa-users mr-2"></i>طلابي
                        </button>
                        <button onclick="showTab('attendance')" class="tab-btn py-4 px-1 border-b-2 font-medium text-sm" data-tab="attendance">
                            <i class="fas fa-clipboard-check mr-2"></i>الحضور
                        </button>
                        <button onclick="showTab('lessons')" class="tab-btn py-4 px-1 border-b-2 font-medium text-sm" data-tab="lessons">
                            <i class="fas fa-chalkboard mr-2"></i>خطط الدروس
                        </button>
                    </nav>
                </div>
            </div>

            <!-- Groups Tab -->
            <div id="groups-tab" class="tab-content">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Group Card Example -->
                    <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                        <div class="p-6">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg font-semibold text-gray-800">مجموعة الرياضيات المتقدمة</h3>
                                <span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">نشطة</span>
                            </div>
                            <div class="space-y-2 text-sm text-gray-600">
                                <div class="flex items-center">
                                    <i class="fas fa-users w-4 mr-2"></i>
                                    <span>8 طلاب من أصل 15</span>
                                </div>
                                <div class="flex items-center">
                                    <i class="fas fa-clock w-4 mr-2"></i>
                                    <span>الأحد، الثلاثاء، الخميس - 14:00</span>
                                </div>
                                <div class="flex items-center">
                                    <i class="fas fa-signal w-4 mr-2"></i>
                                    <span>متقدم</span>
                                </div>
                            </div>
                            <div class="mt-4 pt-4 border-t border-gray-200">
                                <div class="flex justify-between items-center">
                                    <button class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                        <i class="fas fa-eye mr-1"></i>عرض التفاصيل
                                    </button>
                                    <button class="text-green-600 hover:text-green-800 text-sm font-medium">
                                        <i class="fas fa-video mr-1"></i>بدء الحصة
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Additional group cards would be loaded dynamically -->
                </div>
            </div>

            <!-- Students Tab -->
            <div id="students-tab" class="tab-content hidden">
                <div class="bg-white rounded-lg shadow">
                    <div class="p-6 border-b border-gray-200">
                        <div class="flex justify-between items-center">
                            <h3 class="text-lg font-semibold text-gray-800">قائمة طلابي</h3>
                            <div class="flex gap-2">
                                <select class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                    <option value="">كل المجموعات</option>
                                    <option value="group-001">مجموعة الرياضيات المتقدمة</option>
                                    <option value="group-004">مجموعة الرياضيات للمبتدئين</option>
                                </select>
                                <input type="search" placeholder="البحث عن طالب..." 
                                       class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                            </div>
                        </div>
                    </div>
                    <div class="p-6">
                        <div id="teacherStudentsTable">
                            <p class="text-center text-gray-500 py-8">جاري تحميل بيانات الطلاب...</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Other tabs placeholders -->
            <div id="attendance-tab" class="tab-content hidden">
                <div class="bg-white rounded-lg shadow p-6 text-center">
                    <i class="fas fa-clipboard-check text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-lg font-medium text-gray-600 mb-2">تسجيل الحضور</h3>
                    <p class="text-gray-500">سيتم تطوير هذا القسم قريباً</p>
                </div>
            </div>

            <div id="lessons-tab" class="tab-content hidden">
                <div class="bg-white rounded-lg shadow p-6 text-center">
                    <i class="fas fa-chalkboard text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-lg font-medium text-gray-600 mb-2">خطط الدروس والتقييمات</h3>
                    <p class="text-gray-500">سيتم تطوير هذا القسم قريباً</p>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            function showTab(tabName) {
                document.querySelectorAll('.tab-content').forEach(tab => {
                    tab.classList.add('hidden');
                });
                
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.classList.remove('active', 'border-indigo-500', 'text-indigo-600');
                    btn.classList.add('border-transparent', 'text-gray-500');
                });
                
                document.getElementById(tabName + '-tab').classList.remove('hidden');
                
                const activeBtn = document.querySelector(\`[data-tab="\${tabName}"]\`);
                activeBtn.classList.add('active', 'border-indigo-500', 'text-indigo-600');
                activeBtn.classList.remove('border-transparent', 'text-gray-500');
                
                if (tabName === 'students') {
                    loadTeacherStudents();
                }
            }

            async function loadTeacherStudents() {
                try {
                    const response = await axios.get('/api/students');
                    const students = response.data.students;
                    
                    const container = document.getElementById('teacherStudentsTable');
                    if (students.length === 0) {
                        container.innerHTML = '<p class="text-center text-gray-500 py-8">لا توجد طلاب مسجلين</p>';
                        return;
                    }

                    container.innerHTML = \`
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم الطالب</th>
                                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المستوى</th>
                                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المجموعة</th>
                                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">معدل الحضور</th>
                                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">آخر حضور</th>
                                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    \${students.slice(0, 10).map(student => \`
                                        <tr>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                \${student.student_name}
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                \${student.level}
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                \${student.group_id || 'غير محدد'}
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                85%
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                أمس
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                    \${student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                                    \${student.status === 'active' ? 'نشط' : 'غير نشط'}
                                                </span>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <button class="text-blue-600 hover:text-blue-800 ml-2">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                                <button class="text-yellow-600 hover:text-yellow-800 ml-2">
                                                    <i class="fas fa-star"></i>
                                                </button>
                                                <button class="text-green-600 hover:text-green-800">
                                                    <i class="fas fa-comments"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    \`).join('')}
                                </tbody>
                            </table>
                        </div>
                    \`;
                } catch (error) {
                    console.error('Error loading students:', error);
                }
            }

            // Initialize
            showTab('groups');
        </script>
    </body>
    </html>
  `)
})

// Agent Dashboard Route
app.get('/agent', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ISCHOOLGO - وكيل خدمة العملاء</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                <div class="flex items-center">
                    <a href="/" class="text-gray-600 hover:text-gray-800 ml-4">
                        <i class="fas fa-arrow-right"></i>
                    </a>
                    <h1 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-headset text-yellow-600 mr-2"></i>
                        وكيل خدمة العملاء
                    </h1>
                </div>
            </div>
        </header>

        <div class="max-w-7xl mx-auto px-4 py-8">
            <!-- Tabs Navigation -->
            <div class="bg-white rounded-lg shadow mb-6">
                <div class="border-b border-gray-200">
                    <nav class="-mb-px flex space-x-8 px-6">
                        <button onclick="showTab('visitors')" class="tab-btn py-4 px-1 border-b-2 font-medium text-sm active" data-tab="visitors">
                            <i class="fas fa-user-plus mr-2"></i>الزوار الجدد
                        </button>
                        <button onclick="showTab('students')" class="tab-btn py-4 px-1 border-b-2 font-medium text-sm" data-tab="students">
                            <i class="fas fa-users mr-2"></i>الطلاب
                        </button>
                        <button onclick="showTab('payments')" class="tab-btn py-4 px-1 border-b-2 font-medium text-sm" data-tab="payments">
                            <i class="fas fa-credit-card mr-2"></i>المدفوعات
                        </button>
                    </nav>
                </div>
            </div>

            <!-- Visitors Tab -->
            <div id="visitors-tab" class="tab-content">
                <div class="bg-white rounded-lg shadow">
                    <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 class="text-lg font-semibold text-gray-800">الزوار والحصص التجريبية</h3>
                        <button onclick="showAddVisitorModal()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                            <i class="fas fa-plus mr-2"></i>إضافة زائر جديد
                        </button>
                    </div>
                    <div class="p-6">
                        <div id="visitorsTable">
                            <p class="text-center text-gray-500 py-8">جاري تحميل البيانات...</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Students Tab -->
            <div id="students-tab" class="tab-content hidden">
                <div class="bg-white rounded-lg shadow">
                    <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 class="text-lg font-semibold text-gray-800">إدارة الطلاب</h3>
                        <div class="flex gap-2">
                            <input type="search" id="studentSearch" placeholder="البحث عن طالب..." 
                                   class="px-4 py-2 border border-gray-300 rounded-lg">
                            <button onclick="showAddStudentModal()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                                <i class="fas fa-plus mr-2"></i>تسجيل طالب جديد
                            </button>
                        </div>
                    </div>
                    <div class="p-6">
                        <div id="studentsTable">
                            <p class="text-center text-gray-500 py-8">جاري تحميل البيانات...</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Payments Tab -->
            <div id="payments-tab" class="tab-content hidden">
                <div class="bg-white rounded-lg shadow">
                    <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 class="text-lg font-semibold text-gray-800">إدارة المدفوعات</h3>
                        <button onclick="showAddPaymentModal()" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                            <i class="fas fa-plus mr-2"></i>تسجيل دفعة جديدة
                        </button>
                    </div>
                    <div class="p-6">
                        <div id="paymentsTable">
                            <p class="text-center text-gray-500 py-8">جاري تحميل البيانات...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Visitor Modal -->
        <div id="addVisitorModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full hidden z-50">
            <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                <div class="mt-3">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-medium text-gray-900">إضافة زائر جديد</h3>
                        <button onclick="hideAddVisitorModal()" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="addVisitorForm" class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">اسم الطالب</label>
                                <input type="text" name="student_name" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">اسم ولي الأمر</label>
                                <input type="text" name="parent_name" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                                <input type="tel" name="phone" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">العمر</label>
                                <input type="number" name="age" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">المصدر</label>
                                <select name="source" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">اختر المصدر</option>
                                    <option value="facebook">Facebook</option>
                                    <option value="instagram">Instagram</option>
                                    <option value="google">Google</option>
                                    <option value="referral">إحالة</option>
                                    <option value="other">أخرى</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">تاريخ الحصة التجريبية</label>
                                <input type="datetime-local" name="trial_date" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                            <textarea name="notes" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                        </div>
                        <div class="flex justify-end space-x-2">
                            <button type="button" onclick="hideAddVisitorModal()" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">إلغاء</button>
                            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">إضافة الزائر</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Add Student Modal -->
        <div id="addStudentModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full hidden z-50">
            <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                <div class="mt-3">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-medium text-gray-900">تسجيل طالب جديد</h3>
                        <button onclick="hideAddStudentModal()" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="addStudentForm" class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">اسم الطالب</label>
                                <input type="text" name="student_name" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">اسم ولي الأمر</label>
                                <input type="text" name="parent_name" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                                <input type="tel" name="phone" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">العمر</label>
                                <input type="number" name="age" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">المستوى</label>
                                <select name="level" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                                    <option value="">اختر المستوى</option>
                                    <option value="مبتدئ">مبتدئ</option>
                                    <option value="متوسط">متوسط</option>
                                    <option value="متقدم">متقدم</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">الرسوم الشهرية</label>
                                <input type="number" name="monthly_fee" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">تاريخ البدء</label>
                                <input type="date" name="start_date" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">المجموعة</label>
                                <select name="group_id" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                                    <option value="">اختر المجموعة</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                            <textarea name="notes" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"></textarea>
                        </div>
                        <div class="flex justify-end space-x-2">
                            <button type="button" onclick="hideAddStudentModal()" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">إلغاء</button>
                            <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">تسجيل الطالب</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Add Payment Modal -->
        <div id="addPaymentModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full hidden z-50">
            <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                <div class="mt-3">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-medium text-gray-900">تسجيل دفعة جديدة</h3>
                        <button onclick="hideAddPaymentModal()" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="addPaymentForm" class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">الطالب</label>
                                <select name="student_id" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    <option value="">اختر الطالب</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">المبلغ</label>
                                <input type="number" name="amount" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">الشهر المدفوع</label>
                                <select name="month_paid" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    <option value="">اختر الشهر</option>
                                    <option value="يناير 2024">يناير 2024</option>
                                    <option value="فبراير 2024">فبراير 2024</option>
                                    <option value="مارس 2024">مارس 2024</option>
                                    <option value="أبريل 2024">أبريل 2024</option>
                                    <option value="مايو 2024">مايو 2024</option>
                                    <option value="يونيو 2024">يونيو 2024</option>
                                    <option value="يوليو 2024">يوليو 2024</option>
                                    <option value="أغسطس 2024">أغسطس 2024</option>
                                    <option value="سبتمبر 2024">سبتمبر 2024</option>
                                    <option value="أكتوبر 2024">أكتوبر 2024</option>
                                    <option value="نوفمبر 2024">نوفمبر 2024</option>
                                    <option value="ديسمبر 2024">ديسمبر 2024</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">طريقة الدفع</label>
                                <select name="payment_method" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    <option value="">اختر طريقة الدفع</option>
                                    <option value="نقد">نقد</option>
                                    <option value="بنك">تحويل بنكي</option>
                                    <option value="شيك">شيك</option>
                                    <option value="أونلاين">دفع إلكتروني</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">تاريخ الدفع</label>
                                <input type="date" name="payment_date" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">رقم الإيصال</label>
                                <input type="text" name="receipt_number" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                            <textarea name="notes" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"></textarea>
                        </div>
                        <div class="flex justify-end space-x-2">
                            <button type="button" onclick="hideAddPaymentModal()" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">إلغاء</button>
                            <button type="submit" class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">تسجيل الدفعة</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            // Tab functionality
            function showTab(tabName) {
                // Hide all tabs
                document.querySelectorAll('.tab-content').forEach(tab => {
                    tab.classList.add('hidden');
                });
                
                // Remove active class from all buttons
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.classList.remove('active', 'border-blue-500', 'text-blue-600');
                    btn.classList.add('border-transparent', 'text-gray-500');
                });
                
                // Show selected tab
                document.getElementById(tabName + '-tab').classList.remove('hidden');
                
                // Add active class to selected button
                const activeBtn = document.querySelector(\`[data-tab="\${tabName}"]\`);
                activeBtn.classList.add('active', 'border-blue-500', 'text-blue-600');
                activeBtn.classList.remove('border-transparent', 'text-gray-500');
                
                // Load data for the selected tab
                loadTabData(tabName);
            }

            async function loadTabData(tabName) {
                try {
                    switch(tabName) {
                        case 'visitors':
                            const visitorsResponse = await axios.get('/api/visitors');
                            loadVisitorsTable(visitorsResponse.data.visitors);
                            break;
                        case 'students':
                            const studentsResponse = await axios.get('/api/students');
                            loadStudentsTable(studentsResponse.data.students);
                            break;
                        case 'payments':
                            const paymentsResponse = await axios.get('/api/payments');
                            loadPaymentsTable(paymentsResponse.data.payments);
                            break;
                    }
                } catch (error) {
                    console.error('Error loading data:', error);
                }
            }

            function loadVisitorsTable(visitors) {
                const container = document.getElementById('visitorsTable');
                if (visitors.length === 0) {
                    container.innerHTML = '<p class="text-center text-gray-500 py-8">لا توجد زوار مسجلين</p>';
                    return;
                }

                container.innerHTML = \`
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم الطالب</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ولي الأمر</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الهاتف</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المصدر</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحصة التجريبية</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                \${visitors.map(visitor => \`
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            \${visitor.student_name}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            \${visitor.parent_name}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            \${visitor.phone}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            \${visitor.source || 'غير محدد'}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            \${visitor.trial_date ? new Date(visitor.trial_date).toLocaleDateString('ar-EG') : 'غير محدد'}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                \${getVisitorStatusClass(visitor.trial_status)}">
                                                \${getVisitorStatusText(visitor.trial_status)}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <button class="text-blue-600 hover:text-blue-800 ml-2">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="text-green-600 hover:text-green-800">
                                                <i class="fas fa-phone"></i>
                                            </button>
                                        </td>
                                    </tr>
                                \`).join('')}
                            </tbody>
                        </table>
                    </div>
                \`;
            }

            function loadStudentsTable(students) {
                const container = document.getElementById('studentsTable');
                if (students.length === 0) {
                    container.innerHTML = '<p class="text-center text-gray-500 py-8">لا توجد طلاب مسجلين</p>';
                    return;
                }

                container.innerHTML = \`
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم الطالب</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ولي الأمر</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المستوى</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الرسوم الشهرية</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">حالة الدفع</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                \${students.map(student => \`
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            \${student.student_name}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            \${student.parent_name}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            \${student.level}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            \${student.monthly_fee.toLocaleString()} دج
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                \${getPaymentStatusClass(student.payment_status)}">
                                                \${getPaymentStatusText(student.payment_status)}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                \${getStudentStatusClass(student.status)}">
                                                \${getStudentStatusText(student.status)}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <button class="text-blue-600 hover:text-blue-800 ml-2">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="text-green-600 hover:text-green-800">
                                                <i class="fas fa-credit-card"></i>
                                            </button>
                                        </td>
                                    </tr>
                                \`).join('')}
                            </tbody>
                        </table>
                    </div>
                \`;
            }

            function loadPaymentsTable(payments) {
                const container = document.getElementById('paymentsTable');
                if (payments.length === 0) {
                    container.innerHTML = '<p class="text-center text-gray-500 py-8">لا توجد مدفوعات مسجلة</p>';
                    return;
                }

                container.innerHTML = \`
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم الطالب</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الشهر المدفوع</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ الدفع</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">طريقة الدفع</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الإيصال</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                \${payments.map(payment => \`
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            \${payment.student_name || 'غير محدد'}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            \${payment.amount.toLocaleString()} دج
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            \${payment.month_paid}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            \${new Date(payment.payment_date).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            \${payment.payment_method || 'غير محدد'}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            \${payment.receipt_number || 'غير محدد'}
                                        </td>
                                    </tr>
                                \`).join('')}
                            </tbody>
                        </table>
                    </div>
                \`;
            }

            // Status helper functions
            function getVisitorStatusClass(status) {
                switch(status) {
                    case 'completed': return 'bg-green-100 text-green-800';
                    case 'scheduled': return 'bg-blue-100 text-blue-800';
                    case 'missed': return 'bg-red-100 text-red-800';
                    case 'cancelled': return 'bg-gray-100 text-gray-800';
                    default: return 'bg-gray-100 text-gray-800';
                }
            }

            function getVisitorStatusText(status) {
                switch(status) {
                    case 'completed': return 'مكتملة';
                    case 'scheduled': return 'مجدولة';
                    case 'missed': return 'فائتة';
                    case 'cancelled': return 'ملغاة';
                    default: return status;
                }
            }

            function getPaymentStatusClass(status) {
                switch(status) {
                    case 'paid': return 'bg-green-100 text-green-800';
                    case 'pending': return 'bg-yellow-100 text-yellow-800';
                    case 'overdue': return 'bg-red-100 text-red-800';
                    default: return 'bg-gray-100 text-gray-800';
                }
            }

            function getPaymentStatusText(status) {
                switch(status) {
                    case 'paid': return 'مدفوع';
                    case 'pending': return 'معلق';
                    case 'overdue': return 'متأخر';
                    default: return status;
                }
            }

            function getStudentStatusClass(status) {
                switch(status) {
                    case 'active': return 'bg-green-100 text-green-800';
                    case 'inactive': return 'bg-gray-100 text-gray-800';
                    case 'suspended': return 'bg-red-100 text-red-800';
                    default: return 'bg-gray-100 text-gray-800';
                }
            }

            function getStudentStatusText(status) {
                switch(status) {
                    case 'active': return 'نشط';
                    case 'inactive': return 'غير نشط';
                    case 'suspended': return 'معلق';
                    default: return status;
                }
            }

            // Modal functions
            function showAddVisitorModal() {
                document.getElementById('addVisitorModal').classList.remove('hidden');
            }

            function hideAddVisitorModal() {
                document.getElementById('addVisitorModal').classList.add('hidden');
                document.getElementById('addVisitorForm').reset();
            }

            function showAddStudentModal() {
                document.getElementById('addStudentModal').classList.remove('hidden');
                loadGroupsForStudent();
            }

            function hideAddStudentModal() {
                document.getElementById('addStudentModal').classList.add('hidden');
                document.getElementById('addStudentForm').reset();
            }

            function showAddPaymentModal() {
                document.getElementById('addPaymentModal').classList.remove('hidden');
                loadStudentsForPayment();
            }

            function hideAddPaymentModal() {
                document.getElementById('addPaymentModal').classList.add('hidden');
                document.getElementById('addPaymentForm').reset();
            }

            // Load data for form dropdowns
            async function loadGroupsForStudent() {
                try {
                    const response = await axios.get('/api/groups?active=true');
                    const select = document.querySelector('#addStudentModal select[name="group_id"]');
                    select.innerHTML = '<option value="">اختر المجموعة</option>';
                    response.data.groups.forEach(group => {
                        select.innerHTML += \`<option value="\${group.id}">\${group.name} - \${group.level}</option>\`;
                    });
                } catch (error) {
                    console.error('Error loading groups:', error);
                }
            }

            async function loadStudentsForPayment() {
                try {
                    const response = await axios.get('/api/students');
                    const select = document.querySelector('#addPaymentModal select[name="student_id"]');
                    select.innerHTML = '<option value="">اختر الطالب</option>';
                    response.data.students.forEach(student => {
                        select.innerHTML += \`<option value="\${student.id}">\${student.student_name} - \${student.parent_name}</option>\`;
                    });
                } catch (error) {
                    console.error('Error loading students:', error);
                }
            }

            // Form submission handlers
            document.getElementById('addVisitorForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());
                
                try {
                    await axios.post('/api/visitors', data);
                    hideAddVisitorModal();
                    showTab('visitors'); // Reload visitors table
                    alert('تم إضافة الزائر بنجاح');
                } catch (error) {
                    console.error('Error adding visitor:', error);
                    alert('حدث خطأ في إضافة الزائر');
                }
            });

            document.getElementById('addStudentForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());
                
                try {
                    await axios.post('/api/students', data);
                    hideAddStudentModal();
                    showTab('students'); // Reload students table
                    alert('تم تسجيل الطالب بنجاح');
                } catch (error) {
                    console.error('Error adding student:', error);
                    alert('حدث خطأ في تسجيل الطالب');
                }
            });

            document.getElementById('addPaymentForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());
                
                try {
                    await axios.post('/api/payments', data);
                    hideAddPaymentModal();
                    showTab('payments'); // Reload payments table
                    alert('تم تسجيل الدفعة بنجاح');
                } catch (error) {
                    console.error('Error adding payment:', error);
                    alert('حدث خطأ في تسجيل الدفعة');
                }
            });

            // Close modals when clicking outside
            window.addEventListener('click', function(e) {
                if (e.target.classList.contains('fixed') && e.target.classList.contains('inset-0')) {
                    if (e.target.id === 'addVisitorModal') hideAddVisitorModal();
                    if (e.target.id === 'addStudentModal') hideAddStudentModal();
                    if (e.target.id === 'addPaymentModal') hideAddPaymentModal();
                }
            });

            // Initialize the page
            showTab('visitors');
        </script>
    </body>
    </html>
  `)
})

export default app