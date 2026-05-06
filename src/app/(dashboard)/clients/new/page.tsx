import { getProfile, requireRole } from '@/lib/auth';
import NewClientForm from '@/components/forms/NewClientForm';

export default async function NewClientPage() {
  const profile = await requireRole(['admin', 'manager']);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-2">Add New Client</h1>
      <p className="text-gray-500 text-sm mb-5">Create a plant owner account</p>
      <NewClientForm companyId={profile.company_id} />
    </div>
  );
}