import { getProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';

const inputClass = "block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-yellow-500 focus:border-yellow-500";
const selectClass = "block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-yellow-500 focus:border-yellow-500";

export default async function ViewLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ plant?: string; date?: string }>;
}) {
  const profile = await getProfile();
  const supabase = await createClient();

  const params = await searchParams;

  // Fetch plants for filter
  const { data: plants } = await supabase
    .from('plants')
    .select('id, name')
    .eq('company_id', profile.company_id);

  // Build query
  let query = supabase
    .from('daily_logs')
    .select(`
      *,
      plants(name, tariff_per_kwh),
      created_by_user:profiles!daily_logs_created_by_fkey(full_name)
    `)
    .eq('company_id', profile.company_id)
    .order('log_date', { ascending: false })
    .limit(50);

  if (params.plant) {
    query = query.eq('plant_id', params.plant);
  }
  if (params.date) {
    query = query.eq('log_date', params.date);
  }

  const { data: logs } = await query;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Daily Logs</h1>
          <p className="text-gray-500 text-sm">View and filter submitted logs with revenue</p>
        </div>
        <Link
          href="/logs/new"
          className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Log
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-5">
        <form className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Plant</label>
            <select
              name="plant"
              defaultValue={params.plant || ''}
              className={selectClass}
            >
              <option value="">All Plants</option>
              {plants?.map((plant) => (
                <option key={plant.id} value={plant.id}>{plant.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
            <input
              type="date"
              name="date"
              defaultValue={params.date || ''}
              className={inputClass}
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plant</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Generation</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Downtime</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weather</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engineer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs?.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    No logs found.{' '}
                    <Link href="/logs/new" className="text-yellow-600 hover:underline">
                      Submit your first log
                    </Link>
                  </td>
                </tr>
              )}
              {logs?.map((log: any) => {
                const tariff = log.plants?.tariff_per_kwh || 5;
                const revenue = Number(log.generation_kwh) * tariff;
                return (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {format(new Date(log.log_date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {log.plants?.name}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right whitespace-nowrap">
                      {Number(log.generation_kwh).toLocaleString()} kWh
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600 text-right whitespace-nowrap">
                      ₹{revenue.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 text-right whitespace-nowrap">
                      {log.downtime_minutes} min
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 capitalize">
                        {log.weather_condition?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {log.created_by_user?.full_name}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}