import { getProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase-server';
import DashboardStats from '@/components/dashboard/DashboardStats';
import GenerationChart from '@/components/dashboard/GenerationChart';
import RecentAlerts from '@/components/dashboard/RecentAlerts';
import TicketOverview from '@/components/dashboard/TicketOverview';

export default async function DashboardPage() {
  const profile = await getProfile();
  const supabase = await createClient();

  // Fetch KPIs
  const today = new Date().toISOString().split('T')[0];
  
  const { data: todayLogs } = await supabase
    .from('daily_logs')
    .select('generation_kwh, downtime_minutes')
    .eq('company_id', profile.company_id)
    .eq('log_date', today);

  const totalGeneration = todayLogs?.reduce((sum, log) => sum + Number(log.generation_kwh), 0) || 0;
  const totalDowntime = todayLogs?.reduce((sum, log) => sum + log.downtime_minutes, 0) || 0;

  const { data: plantCount } = await supabase
    .from('plants')
    .select('count', { count: 'exact' })
    .eq('company_id', profile.company_id)
    .eq('status', 'active');

  const { data: openTickets } = await supabase
    .from('tickets')
    .select('count', { count: 'exact' })
    .eq('company_id', profile.company_id)
    .in('status', ['open', 'in_progress']);

  // Fetch daily generation for last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: generationData } = await supabase
    .from('daily_logs')
    .select('log_date, generation_kwh, plant_id, plants(name)')
    .eq('company_id', profile.company_id)
    .gte('log_date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('log_date', { ascending: true });

  // Fetch recent alerts
  const { data: recentAlerts } = await supabase
    .from('alerts')
    .select('*')
    .eq('company_id', profile.company_id)
    .eq('is_read', false)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm">Welcome back, {profile.full_name}</p>
      </div>

      <DashboardStats
        totalGeneration={totalGeneration}
        totalDowntime={totalDowntime}
        activePlants={plantCount?.[0]?.count || 0}
        openTickets={openTickets?.[0]?.count || 0}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GenerationChart data={generationData || []} />
        </div>
        <div>
          <RecentAlerts alerts={recentAlerts || []} />
        </div>
      </div>

      <TicketOverview companyId={profile.company_id} />
    </div>
  );
}