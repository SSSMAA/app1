export const marketerDashboard = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ISCHOOLGO - لوحة مسؤول التسويق</title>
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
                    <i class="fas fa-bullhorn text-green-600 mr-2"></i>
                    لوحة مسؤول التسويق
                </h1>
            </div>
        </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 py-8">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center">
                    <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i class="fas fa-eye text-blue-600"></i>
                    </div>
                    <div class="mr-4">
                        <p class="text-sm text-gray-600">إجمالي المشاهدات</p>
                        <p class="text-2xl font-bold text-gray-800" id="totalImpressions">0</p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center">
                    <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <i class="fas fa-users text-green-600"></i>
                    </div>
                    <div class="mr-4">
                        <p class="text-sm text-gray-600">العملاء المحتملون</p>
                        <p class="text-2xl font-bold text-gray-800" id="totalLeads">0</p>
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
                        <i class="fas fa-dollar-sign text-yellow-600"></i>
                    </div>
                    <div class="mr-4">
                        <p class="text-sm text-gray-600">تكلفة العميل</p>
                        <p class="text-2xl font-bold text-gray-800" id="costPerLead">0 دج</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tabs -->
        <div class="bg-white rounded-lg shadow mb-6">
            <div class="border-b border-gray-200">
                <nav class="-mb-px flex space-x-8 px-6">
                    <button onclick="showTab('campaigns')" class="tab-btn py-4 px-1 border-b-2 font-medium text-sm active" data-tab="campaigns">
                        <i class="fas fa-ad mr-2"></i>الحملات الإعلانية
                    </button>
                    <button onclick="showTab('leads')" class="tab-btn py-4 px-1 border-b-2 font-medium text-sm" data-tab="leads">
                        <i class="fas fa-users mr-2"></i>العملاء المحتملون
                    </button>
                    <button onclick="showTab('analytics')" class="tab-btn py-4 px-1 border-b-2 font-medium text-sm" data-tab="analytics">
                        <i class="fas fa-chart-bar mr-2"></i>تحليل الأداء
                    </button>
                </nav>
            </div>
        </div>

        <!-- Campaigns Tab -->
        <div id="campaigns-tab" class="tab-content">
            <div class="bg-white rounded-lg shadow">
                <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-gray-800">الحملات الإعلانية</h3>
                    <button class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                        <i class="fas fa-plus mr-2"></i>حملة جديدة
                    </button>
                </div>
                <div class="p-6">
                    <div id="campaignsTable">
                        <p class="text-center text-gray-500 py-8">جاري تحميل البيانات...</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Leads Tab -->
        <div id="leads-tab" class="tab-content hidden">
            <div class="bg-white rounded-lg shadow">
                <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-gray-800">العملاء المحتملون</h3>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        <i class="fas fa-plus mr-2"></i>عميل محتمل جديد
                    </button>
                </div>
                <div class="p-6">
                    <div id="leadsTable">
                        <p class="text-center text-gray-500 py-8">جاري تحميل البيانات...</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Analytics Tab -->
        <div id="analytics-tab" class="tab-content hidden">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">
                        <i class="fas fa-chart-line text-blue-600 mr-2"></i>
                        أداء الحملات
                    </h3>
                    <canvas id="campaignPerformanceChart" width="400" height="200"></canvas>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">
                        <i class="fas fa-chart-pie text-green-600 mr-2"></i>
                        توزيع مصادر العملاء
                    </h3>
                    <canvas id="leadSourcesChart" width="400" height="200"></canvas>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script>
        // Tab functionality
        function showTab(tabName) {
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.add('hidden');
            });
            
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active', 'border-green-500', 'text-green-600');
                btn.classList.add('border-transparent', 'text-gray-500');
            });
            
            document.getElementById(tabName + '-tab').classList.remove('hidden');
            
            const activeBtn = document.querySelector(\`[data-tab="\${tabName}"]\`);
            activeBtn.classList.add('active', 'border-green-500', 'text-green-600');
            activeBtn.classList.remove('border-transparent', 'text-gray-500');
            
            loadTabData(tabName);
        }

        async function loadTabData(tabName) {
            try {
                switch(tabName) {
                    case 'campaigns':
                        const campaignsResponse = await axios.get('/api/campaigns');
                        loadCampaignsTable(campaignsResponse.data.campaigns);
                        updateCampaignStats(campaignsResponse.data.campaigns);
                        break;
                    case 'leads':
                        const leadsResponse = await axios.get('/api/leads');
                        loadLeadsTable(leadsResponse.data.leads);
                        break;
                    case 'analytics':
                        loadAnalyticsCharts();
                        break;
                }
            } catch (error) {
                console.error('Error loading data:', error);
            }
        }

        function updateCampaignStats(campaigns) {
            const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
            const totalLeads = campaigns.reduce((sum, c) => sum + c.leads_generated, 0);
            const totalSpent = campaigns.reduce((sum, c) => sum + c.spent_amount, 0);
            const avgCostPerLead = totalLeads > 0 ? totalSpent / totalLeads : 0;
            const avgConversionRate = campaigns.length > 0 ? 
                campaigns.reduce((sum, c) => sum + (c.ctr || 0), 0) / campaigns.length : 0;

            document.getElementById('totalImpressions').textContent = totalImpressions.toLocaleString();
            document.getElementById('totalLeads').textContent = totalLeads;
            document.getElementById('conversionRate').textContent = avgConversionRate.toFixed(1) + '%';
            document.getElementById('costPerLead').textContent = avgCostPerLead.toLocaleString() + ' دج';
        }

        function loadCampaignsTable(campaigns) {
            const container = document.getElementById('campaignsTable');
            if (campaigns.length === 0) {
                container.innerHTML = '<p class="text-center text-gray-500 py-8">لا توجد حملات إعلانية</p>';
                return;
            }

            container.innerHTML = \`
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم الحملة</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المنصة</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الميزانية</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ المنفق</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المشاهدات</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النقرات</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العملاء المحتملون</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            \${campaigns.map(campaign => \`
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        \${campaign.name}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        \${campaign.platform}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        \${(campaign.budget || 0).toLocaleString()} دج
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        \${campaign.spent_amount.toLocaleString()} دج
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        \${campaign.impressions.toLocaleString()}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        \${campaign.clicks}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        \${campaign.leads_generated}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                            \${getCampaignStatusClass(campaign.status)}">
                                            \${getCampaignStatusText(campaign.status)}
                                        </span>
                                    </td>
                                </tr>
                            \`).join('')}
                        </tbody>
                    </table>
                </div>
            \`;
        }

        function loadLeadsTable(leads) {
            const container = document.getElementById('leadsTable');
            if (leads.length === 0) {
                container.innerHTML = '<p class="text-center text-gray-500 py-8">لا توجد عملاء محتملون</p>';
                return;
            }

            container.innerHTML = \`
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الهاتف</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">البريد الإلكتروني</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المصدر</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ الاستلام</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            \${leads.map(lead => \`
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        \${lead.name}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        \${lead.phone}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        \${lead.email || 'غير محدد'}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        \${lead.source || 'غير محدد'}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        \${new Date(lead.received_date).toLocaleDateString('ar-EG')}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                            \${getLeadStatusClass(lead.status)}">
                                            \${getLeadStatusText(lead.status)}
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

        function loadAnalyticsCharts() {
            // Campaign Performance Chart
            const campaignCtx = document.getElementById('campaignPerformanceChart').getContext('2d');
            new Chart(campaignCtx, {
                type: 'bar',
                data: {
                    labels: ['Facebook', 'Google Ads', 'Instagram'],
                    datasets: [{
                        label: 'العملاء المحتملون',
                        data: [45, 32, 28],
                        backgroundColor: 'rgba(34, 197, 94, 0.8)'
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

            // Lead Sources Chart
            const sourcesCtx = document.getElementById('leadSourcesChart').getContext('2d');
            new Chart(sourcesCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Facebook Ads', 'Google Ads', 'Instagram', 'إحالة'],
                    datasets: [{
                        data: [45, 32, 28, 15],
                        backgroundColor: [
                            'rgb(59, 130, 246)',
                            'rgb(34, 197, 94)',
                            'rgb(168, 85, 247)',
                            'rgb(245, 158, 11)'
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

        function getCampaignStatusClass(status) {
            switch(status) {
                case 'active': return 'bg-green-100 text-green-800';
                case 'paused': return 'bg-yellow-100 text-yellow-800';
                case 'completed': return 'bg-gray-100 text-gray-800';
                default: return 'bg-gray-100 text-gray-800';
            }
        }

        function getCampaignStatusText(status) {
            switch(status) {
                case 'active': return 'نشطة';
                case 'paused': return 'معلقة';
                case 'completed': return 'مكتملة';
                default: return status;
            }
        }

        function getLeadStatusClass(status) {
            switch(status) {
                case 'new': return 'bg-blue-100 text-blue-800';
                case 'contacted': return 'bg-yellow-100 text-yellow-800';
                case 'qualified': return 'bg-purple-100 text-purple-800';
                case 'converted': return 'bg-green-100 text-green-800';
                case 'lost': return 'bg-red-100 text-red-800';
                default: return 'bg-gray-100 text-gray-800';
            }
        }

        function getLeadStatusText(status) {
            switch(status) {
                case 'new': return 'جديد';
                case 'contacted': return 'تم التواصل';
                case 'qualified': return 'مؤهل';
                case 'converted': return 'محول';
                case 'lost': return 'مفقود';
                default: return status;
            }
        }

        // Initialize
        showTab('campaigns');
    </script>
</body>
</html>
`;