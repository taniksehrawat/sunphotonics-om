import { getProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import { Plus, Filter } from 'lucide-react';
import { format } from 'date-fns';

const inputClass = "block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-yellow-500 focus:border-yellow-500";
const selectClass = "block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-yellow-500 focus:border-yellow-500";

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string; plant?: string }>;
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
    .from('tickets')
    .select(`
      *,
      plants(name),
      created_by_user:profiles!tickets_created_by_fkey(full_name),
      assigned_to_user:profiles!tickets_assigned_to_fkey(full_name)
    `)
    .eq('company_id', profile.company_id)
    .order('created_at', { ascending: false });

  if (params.status) query = query.eq('status', params.status);
  if (params.priority) query = query.eq('priority', params.priority);
  if (params.plant) query = query.eq('plant_id', params.plant);

  const { data: tickets } = await query;

  const statusColors: Record<string, string> = {
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  };
  
  const priorityColors: Record<string, string> = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Tickets</h1>
          <p className="text-gray-500 text-sm">Manage maintenance tickets</p>
        </div>
        <Link
          href="/tickets/new"
          className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-5">
        <form className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select 
              name="status" 
              defaultValue={params.status || ''} 
              className={selectClass}
            >
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
            <select 
              name="priority" 
              defaultValue={params.priority || ''} 
              className={selectClass}
            >
              <option value="">All</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Plant</label>
            <select 
              name="plant" 
              defaultValue={params.plant || ''} 
              className={selectClass}
            >
              <option value="">All</option>
              {plants?.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
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

      {/* Tickets List */}
      <div className="grid gap-4">
        {tickets?.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
            <Filter className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg">No tickets found</p>
            <p className="text-sm mt-1">Create a new ticket to get started</p>
          </div>
        )}
        {tickets?.map((ticket: any) => (
          <Link
            key={ticket.id}
            href={`/tickets/${ticket.id}`}
            className="block bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{ticket.title}</h3>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${statusColors[ticket.status]}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${priorityColors[ticket.priority]}`}>
                    {ticket.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{ticket.description || 'No description'}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                  <span>{ticket.plants?.name || 'Unknown Plant'}</span>
                  <span>•</span>
                  <span className="capitalize">{ticket.category || 'Other'}</span>
                  {ticket.assigned_to_user && (
                    <>
                      <span>•</span>
                      <span>Assigned: {ticket.assigned_to_user.full_name}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{format(new Date(ticket.created_at), 'MMM dd, yyyy')}</span>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0 mt-1">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}