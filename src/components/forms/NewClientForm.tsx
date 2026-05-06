'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';

interface Props {
  companyId: string;
}

const inputClass = "block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm";
const selectClass = "block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm";

export default function NewClientForm({ companyId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [plants, setPlants] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    selectedPlants: [] as string[],
  });

  useEffect(() => {
    const fetchPlants = async () => {
      const { data } = await supabase
        .from('plants')
        .select('id, name, capacity_kw')
        .eq('company_id', companyId)
        .order('name');
      setPlants(data || []);
    };
    fetchPlants();
  }, [companyId, supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlantToggle = (plantId: string) => {
    setFormData((prev) => {
      const selected = prev.selectedPlants.includes(plantId)
        ? prev.selectedPlants.filter((id) => id !== plantId)
        : [...prev.selectedPlants, plantId];
      return { ...prev, selectedPlants: selected };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.full_name || !formData.email || !formData.password) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      if (formData.selectedPlants.length === 0) {
        toast.error('Please assign at least one plant to the client');
        setLoading(false);
        return;
      }

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            role: 'engineer',
            role_type: 'client',
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Update profile
        await supabase
          .from('profiles')
          .update({
            role_type: 'client',
            role: 'engineer',
            phone: formData.phone || null,
          })
          .eq('id', authData.user.id);

        // Assign selected plants
        const plantAssignments = formData.selectedPlants.map((plantId) => ({
          client_id: authData.user!.id,
          plant_id: plantId,
        }));

        await supabase.from('client_plants').insert(plantAssignments);

        // Also update plants table client_id for first plant
        await supabase
          .from('plants')
          .update({ client_id: authData.user.id })
          .in('id', formData.selectedPlants);
      }

      toast.success(`Client "${formData.full_name}" created with ${formData.selectedPlants.length} plant(s)!`);
      router.push('/clients');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
        <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required placeholder="e.g., Rajesh Sharma" className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="rajesh@example.com" className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
        <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Min 6 characters" className={inputClass} />
        <p className="text-xs text-gray-400 mt-1">Share this password with the client. They can change it later.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Phone (Optional)</label>
        <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 9876543210" className={inputClass} />
      </div>

      {/* Plant Assignment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assign Plants * <span className="text-xs text-gray-400">(Select all that apply)</span>
        </label>
        {plants.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-400">
            No plants available. Add plants first from the Plants page.
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
            {plants.map((plant) => (
              <label
                key={plant.id}
                className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
                  formData.selectedPlants.includes(plant.id)
                    ? 'bg-yellow-50 border border-yellow-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.selectedPlants.includes(plant.id)}
                  onChange={() => handlePlantToggle(plant.id)}
                  className="h-4 w-4 text-yellow-600 rounded border-gray-300 focus:ring-yellow-500"
                />
                <span className="ml-3 text-sm text-gray-900">{plant.name}</span>
                <span className="ml-auto text-xs text-gray-400">{plant.capacity_kw} kW</span>
              </label>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400 mt-1">
          Selected: {formData.selectedPlants.length} plant(s)
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button type="button" onClick={() => router.push('/clients')} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="px-6 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? 'Creating...' : 'Create Client'}
        </button>
      </div>
    </form>
  );
}