'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { Users, Mail, Key, Phone, Leaf } from 'lucide-react';

interface Props {
  companyId: string;
}

const inputClass = "block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm";

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
        .select('id, name, capacity_kw, location')
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

  const handleSelectAll = () => {
    if (formData.selectedPlants.length === plants.length) {
      setFormData((prev) => ({ ...prev, selectedPlants: [] }));
    } else {
      setFormData((prev) => ({ ...prev, selectedPlants: plants.map((p) => p.id) }));
    }
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

      // Create user in Supabase Auth with role_type in metadata
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

      if (authError) {
        if (authError.message.includes('already registered')) {
          toast.error('A user with this email already exists');
        } else {
          throw authError;
        }
        setLoading(false);
        return;
      }

      if (authData.user) {
        // Force update profile to ensure role_type is 'client'
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            role_type: 'client',
            role: 'engineer',
            full_name: formData.full_name,
            phone: formData.phone || null,
          })
          .eq('id', authData.user.id);

        if (updateError) {
          console.error('Profile update error:', updateError);
        }

        // Small delay to ensure profile update completes
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Assign selected plants
        const plantAssignments = formData.selectedPlants.map((plantId) => ({
          client_id: authData.user!.id,
          plant_id: plantId,
        }));

        const { error: plantError } = await supabase
          .from('client_plants')
          .insert(plantAssignments);

        if (plantError) {
          console.error('Plant assignment error:', plantError);
        }

        // Update plants table with client_id
        const { error: plantsUpdateError } = await supabase
          .from('plants')
          .update({ client_id: authData.user.id })
          .in('id', formData.selectedPlants);

        if (plantsUpdateError) {
          console.error('Plants update error:', plantsUpdateError);
        }
      }

      toast.success(
        `Client "${formData.full_name}" created with ${formData.selectedPlants.length} plant(s)!`
      );
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
      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
            placeholder="e.g., Rajesh Sharma"
            className={`${inputClass} pl-10`}
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="rajesh@example.com"
            className={`${inputClass} pl-10`}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">Client will use this email to login</p>
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
        <div className="relative">
          <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Min 6 characters"
            className={`${inputClass} pl-10`}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">Share this password with the client. They can change it later.</p>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Phone (Optional)</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 9876543210"
            className={`${inputClass} pl-10`}
          />
        </div>
      </div>

      {/* Plant Assignment */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Assign Plants * <span className="text-xs text-gray-400">(Select all that apply)</span>
          </label>
          {plants.length > 0 && (
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs text-yellow-600 hover:text-yellow-700 font-medium"
            >
              {formData.selectedPlants.length === plants.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        {plants.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-400">
            <Leaf className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No plants available</p>
            <p className="text-xs mt-1">Add plants first from the Plants page</p>
          </div>
        ) : (
          <div className="space-y-1 max-h-56 overflow-y-auto border border-gray-200 rounded-lg p-2">
            {plants.map((plant) => (
              <label
                key={plant.id}
                className={`flex items-center p-2.5 rounded-lg cursor-pointer transition-all ${
                  formData.selectedPlants.includes(plant.id)
                    ? 'bg-yellow-50 border border-yellow-200 shadow-sm'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.selectedPlants.includes(plant.id)}
                  onChange={() => handlePlantToggle(plant.id)}
                  className="h-4 w-4 text-yellow-600 rounded border-gray-300 focus:ring-yellow-500"
                />
                <div className="ml-3 flex-1">
                  <span className="text-sm text-gray-900 font-medium">{plant.name}</span>
                  <span className="text-xs text-gray-400 ml-2">{plant.location}</span>
                </div>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {plant.capacity_kw} kW
                </span>
              </label>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400 mt-1">
          {formData.selectedPlants.length === 0
            ? 'No plants selected'
            : `${formData.selectedPlants.length} plant(s) selected`}
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
        <p className="font-medium text-blue-800 mb-2">What the client can do:</p>
        <ul className="list-disc list-inside space-y-1 text-blue-700">
          <li>View their assigned plants dashboard</li>
          <li>See generation and revenue data</li>
          <li>Download reports for their plants</li>
          <li>View tickets related to their plants</li>
        </ul>
        <p className="font-medium text-blue-800 mt-3 mb-1">What they cannot do:</p>
        <ul className="list-disc list-inside space-y-1 text-blue-700">
          <li>Submit daily logs</li>
          <li>Create or manage tickets</li>
          <li>See other clients' data</li>
          <li>Add or modify plants</li>
        </ul>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.push('/clients')}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating...
            </span>
          ) : (
            'Create Client'
          )}
        </button>
      </div>
    </form>
  );
}