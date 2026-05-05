import { getProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase-server';
import NewTicketForm from '@/components/forms/NewTicketForm';

export default async function NewTicketPage() {
  const profile = await getProfile();
  const supabase = await createClient();

  const { data: plants } = await supabase
    .from('plants')
    .select('id, name')
    .eq('company_id', profile.company_id)
    .eq('status', 'active')
    .order('name');

  const { data: engineers } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('company_id', profile.company_id)
    .in('role', ['engineer', 'manager', 'admin']);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Ticket</h1>
      <NewTicketForm 
        plants={plants || []} 
        engineers={engineers || []}
        userId={profile.id}
        companyId={profile.company_id}
      />
    </div>
  );
}