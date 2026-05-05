import { getProfile, requireRole } from '@/lib/auth';
import NewPlantForm from '@/components/forms/NewPlantForm';

export default async function NewPlantPage() {
  const profile = await requireRole(['admin', 'manager']);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Plant</h1>
      <NewPlantForm companyId={profile.company_id} />
    </div>
  );
}