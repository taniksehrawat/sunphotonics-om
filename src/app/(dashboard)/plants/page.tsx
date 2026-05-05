import { getProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import { Plus, MapPin, Zap, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default async function PlantsPage() {
  const profile = await getProfile();
  const supabase = await createClient();

  const { data: plants } = await supabase
    .from('plants')
    .select('*')
    .eq('company_id', profile.company_id)
    .order('name');

  const canCreate = profile.role === 'admin' || profile.role === 'manager';

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Solar Plants</h1>
          <p className="text-gray-500 text-sm">Manage your solar plants</p>
        </div>
        {canCreate && (
          <Link
            href="/plants/new"
            className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Plant
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {plants?.map((plant: any) => (
          <div key={plant.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">{plant.name}</h3>
              <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                plant.status === 'active' ? 'bg-green-100 text-green-800' :
                plant.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {plant.status}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                <span className="truncate">{plant.location}</span>
              </div>
              <div className="flex items-center">
                <Zap className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                {Number(plant.capacity_kw).toLocaleString()} kW
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                Installed: {format(new Date(plant.installed_date), 'MMM dd, yyyy')}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <Link
                href={`/logs/new?plant=${plant.id}`}
                className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
              >
                Submit Daily Log →
              </Link>
            </div>
          </div>
        ))}

        {(!plants || plants.length === 0) && (
          <div className="col-span-full text-center py-12 text-gray-400">
            <Zap className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg">No plants configured yet</p>
            {canCreate && (
              <Link href="/plants/new" className="text-yellow-600 hover:text-yellow-700 font-medium text-sm mt-1 inline-block">
                Add your first plant
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}