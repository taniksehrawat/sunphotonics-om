import { getProfile, requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import { Plus, Users } from 'lucide-react';
import { format } from 'date-fns';

export default async function ClientsPage() {
  const profile = await requireRole(['admin', 'manager']);
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from('profiles')
    .select('*, client_plants(count)')
    .eq('company_id', profile.company_id)
    .eq('role_type', 'client')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Clients (Plant Owners)</h1>
          <p className="text-gray-500 text-sm">Manage plant owner accounts and access</p>
        </div>
        <Link
          href="/clients/new"
          className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plants</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Added</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {clients?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No clients yet</p>
                </td>
              </tr>
            )}
            {clients?.map((client: any) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{client.full_name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{client.email}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{client.client_plants?.[0]?.count || 0} plants</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {format(new Date(client.created_at), 'MMM dd, yyyy')}
                </td>
                <td className="px-6 py-4 text-sm">
                  <Link href={`/clients/${client.id}`} className="text-yellow-600 hover:text-yellow-700 font-medium">
                    Manage Plants →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}