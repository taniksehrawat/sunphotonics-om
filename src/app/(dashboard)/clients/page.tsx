import { getProfile, requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import { Plus, Users, Building2 } from 'lucide-react';
import { format } from 'date-fns';

export default async function ClientsPage() {
  const profile = await requireRole(['admin', 'manager']);
  const supabase = await createClient();

  // Fetch all clients with their assigned plants
  const { data: clients } = await supabase
    .from('profiles')
    .select(`
      *,
      client_plants(
        id,
        plant_id,
        plants(name)
      )
    `)
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

      {clients?.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg">No clients yet</p>
          <p className="text-sm mt-1">Add plant owners to give them access to their plants</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {clients?.map((client: any) => (
            <div key={client.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-lg">
                    {client.full_name?.charAt(0)?.toUpperCase() || 'C'}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{client.full_name}</h3>
                    <p className="text-sm text-gray-500">{client.email}</p>
                    {client.phone && <p className="text-sm text-gray-400">{client.phone}</p>}
                    <p className="text-xs text-gray-400 mt-1">
                      Added {format(new Date(client.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">
                    <Building2 className="h-4 w-4 inline mr-1" />
                    {client.client_plants?.length || 0} Plant{(client.client_plants?.length || 0) !== 1 ? 's' : ''}
                  </p>
                  {client.client_plants?.length > 0 && (
                    <div className="text-xs text-gray-400 space-y-0.5">
                      {client.client_plants?.map((cp: any) => (
                        <p key={cp.id}>{cp.plants?.name}</p>
                      ))}
                    </div>
                  )}
                  <Link
                    href={`/clients/${client.id}`}
                    className="inline-block mt-2 text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                  >
                    Manage Plants →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}