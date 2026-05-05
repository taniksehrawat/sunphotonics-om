import { getProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase-server';
import DashboardStats from '@/components/dashboard/DashboardStats';
import GenerationChart from '@/components/dashboard/GenerationChart';
import RecentAlerts from '@/components/dashboard/RecentAlerts';
import TicketOverview from '@/components/dashboard/TicketOverview';
import RevenueStats from '@/components/dashboard/RevenueStats';
import RevenueChart from '@/components/dashboard/RevenueChart';
import PlantRevenueTable from '@/components/dashboard/PlantRevenueTable';
import { calculateTotalRevenue, groupRevenueByDate } from '@/utils/revenue';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function DashboardPage() {
  const profile = await getProfile();
  const supabase = await createClient();

  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);

  const firstOfYear = new Date();
  firstOfYear.setMonth(0);
  firstOfYear.setDate(1);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const lastMonthStart = new Date();
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
  lastMonthStart.setDate(1);
  const lastMonthEnd = new Date();
  lastMonthEnd.setDate(0);

  // Fetch all dashboard data in parallel
  const [
    todayLogsRes,
    plantCountRes,
    openTicketsRes,
    generationDataRes,
    recentAlertsRes,
    revenueLogsRes,
  ] = await Promise.all([
    supabase
      .from('daily_logs')
      .select('generation_kwh, downtime_minutes')
      .eq('company_id', profile.company_id)
      .eq('log_date', today),
    supabase
      .from('plants')
      .select('count', { count: 'exact' })
      .eq('company_id', profile.company_id)
      .eq('status', 'active'),
    supabase
      .from('tickets')
      .select('count', { count: 'exact' })
      .eq('company_id', profile.company_id)
      .in('status', ['open', 'in_progress']),
    supabase
      .from('daily_logs')
      .select('log_date, generation_kwh, plant_id, plants(name)')
      .eq('company_id', profile.company_id)
      .gte('log_date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('log_date', { ascending: true }),
    supabase
      .from('alerts')
      .select('*')
      .eq('company_id', profile.company_id)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('daily_logs')
      .select('log_date, generation_kwh, plants!inner(name, tariff_per_kwh, capacity_kw)')
      .eq('company_id', profile.company_id)
      .gte('log_date', firstOfYear.toISOString().split('T')[0])
      .order('log_date', { ascending: true }),
  ]);

  const todayLogs = todayLogsRes.data;
  const totalGeneration = todayLogs?.reduce((sum, log) => sum + Number(log.generation_kwh), 0) || 0;
  const totalDowntime = todayLogs?.reduce((sum, log) => sum + log.downtime_minutes, 0) || 0;
  const plantCount = plantCountRes.data;
  const openTickets = openTicketsRes.data;
  const generationData = generationDataRes.data;
  const recentAlerts = recentAlertsRes.data;
  const allLogs = revenueLogsRes.data || [];

  // Revenue calculations
  const todayRevenue = calculateTotalRevenue(
    allLogs.filter((l) => l.log_date === today)
  );

  const monthRevenue = calculateTotalRevenue(
    allLogs.filter((l) => l.log_date >= firstOfMonth.toISOString().split('T')[0])
  );

  const yearRevenue = calculateTotalRevenue(allLogs);

  const yesterdayRevenue = calculateTotalRevenue(
    allLogs.filter((l) => l.log_date === yesterdayStr)
  );

  const lastMonthRevenue = calculateTotalRevenue(
    allLogs.filter(
      (l) =>
        l.log_date >= lastMonthStart.toISOString().split('T')[0] &&
        l.log_date <= lastMonthEnd.toISOString().split('T')[0]
    )
  );

  // Revenue chart data
  const revenueChartData = groupRevenueByDate(allLogs);

  // Plant-wise revenue breakdown
  const plantRevenueMap = new Map<string, any>();
  allLogs.forEach((log: any) => {
    const plantName = log.plants?.name || 'Unknown';
    if (!plantRevenueMap.has(plantName)) {
      plantRevenueMap.set(plantName, {
        plant_name: plantName,
        capacity_kw: log.plants?.capacity_kw || 0,
        tariff_per_kwh: log.plants?.tariff_per_kwh || 5.0,
        today_generation: 0,
        today_revenue: 0,
        month_generation: 0,
        month_revenue: 0,
      });
    }
    const plant = plantRevenueMap.get(plantName);
    const tariff = log.plants?.tariff_per_kwh || 5.0;
    const revenue = Number(log.generation_kwh) * tariff;

    if (log.log_date === today) {
      plant.today_generation += Number(log.generation_kwh);
      plant.today_revenue += revenue;
    }
    if (log.log_date >= firstOfMonth.toISOString().split('T')[0]) {
      plant.month_generation += Number(log.generation_kwh);
      plant.month_revenue += revenue;
    }
  });

  const plantRevenueData = Array.from(plantRevenueMap.values());

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm">Welcome back, {profile.full_name}</p>
      </div>

      {/* Revenue Stats */}
      <RevenueStats
        todayRevenue={todayRevenue}
        monthRevenue={monthRevenue}
        yearRevenue={yearRevenue}
        yesterdayRevenue={yesterdayRevenue}
        lastMonthRevenue={lastMonthRevenue}
      />

      {/* Generation Stats */}
      <DashboardStats
        totalGeneration={totalGeneration}
        totalDowntime={totalDowntime}
        activePlants={plantCount?.[0]?.count || 0}
        openTickets={openTickets?.[0]?.count || 0}
      />

      {/* Revenue Chart */}
      <RevenueChart data={revenueChartData} />

      {/* Generation Chart + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GenerationChart data={generationData || []} />
        </div>
        <div>
          <RecentAlerts alerts={recentAlerts || []} />
        </div>
      </div>

      {/* Plant Revenue Table */}
      <PlantRevenueTable data={plantRevenueData} />

      {/* Ticket Overview */}
      <TicketOverview companyId={profile.company_id} />
    </div>
  );
}