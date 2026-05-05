import { getProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import TicketDetailClient from '@/components/forms/TicketDetailClient';

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getProfile();
  const supabase = await createClient();

  // ✅ FIX: Await params before accessing its properties
  const { id } = await params;

  const { data: ticket } = await supabase
    .from('tickets')
    .select(`
      *,
      plants(name),
      created_by_user:profiles!tickets_created_by_fkey(id, full_name, email),
      assigned_to_user:profiles!tickets_assigned_to_fkey(id, full_name, email)
    `)
    .eq('id', id)
    .eq('company_id', profile.company_id)
    .single();

  if (!ticket) notFound();

  // Fetch engineers for assignment dropdown
  const { data: engineers } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('company_id', profile.company_id)
    .in('role', ['engineer', 'manager', 'admin']);

  // Fetch ticket images
  const { data: images } = await supabase
    .from('ticket_images')
    .select('*')
    .eq('ticket_id', id);

  return (
    <div className="max-w-4xl mx-auto">
      <TicketDetailClient
        ticket={ticket}
        images={images || []}
        engineers={engineers || []}
        currentUser={profile}
      />
    </div>
  );
}