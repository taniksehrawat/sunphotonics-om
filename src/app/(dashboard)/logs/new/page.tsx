import { getProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase-server';
import DailyLogForm from '@/components/forms/DailyLogForm';

export default async function NewLogPage() {
  const profile = await getProfile();
  const supabase = await createClient();

  const { data: plants } = await supabase
    .from('plants')
    .select('id, name')
    .eq('company_id', profile.company_id)
    .eq('status', 'active')
    .order('name');

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Submit Daily Log</h1>
      <DailyLogForm plants={plants || []} userId={profile.id} companyId={profile.company_id} />
    </div>
  );
}