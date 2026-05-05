import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import { Ticket, ArrowRight } from 'lucide-react';

interface Props {
  companyId: string;
}

export default async function TicketOverview({ companyId }: Props) {
  const supabase = await createClient();

  const { data: tickets } = await supabase
    .from('tickets')
    .select(`
      *,
      plants(name),
      assigned_to_user:profiles!tickets_assigned_to_fkey(full_name)
    `)
    .eq('company_id', companyId)
    .in('status', ['open', 'in_progress'])
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(5);

  const priorityColors: Record<string, string> = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Open Tickets</h3>
        <Link
          href="/tickets"
          className="text-sm text-yellow-600 hover:text-yellow-700 flex items-center"
        >
          View all <ArrowRight className="h-4 w-4 ml-1" />
        </Link>
      </div>

      {!tickets || tickets.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <Ticket className="h-12 w-12 mx-auto mb-2" />
          <p>No open tickets</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Title</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Plant</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Priority</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.map((ticket: any) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="py-3">
                    <Link href={`/tickets/${ticket.id}`} className="text-sm font-medium text-gray-900 hover:text-yellow-600">
                      {ticket.title}
                    </Link>
                  </td>
                  <td className="py-3 text-sm text-gray-500">{ticket.plants?.name}</td>
                  <td className="py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${priorityColors[ticket.priority]}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-gray-500 capitalize">{ticket.status.replace('_', ' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}