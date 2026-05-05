'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';

interface Props {
  companyId: string;
}

const inputClass = "block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm";

export default function NewPlantForm({ companyId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity_kw: '',
    installed_date: '',
    tariff_per_kwh: '5.00',
    latitude: '',
    longitude: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name || !formData.location || !formData.capacity_kw || !formData.installed_date) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      if (!formData.tariff_per_kwh || parseFloat(formData.tariff_per_kwh) <= 0) {
        toast.error('Please enter a valid tariff rate');
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('plants')
        .insert({
          company_id: companyId,
          name: formData.name,
          location: formData.location,
          capacity_kw: parseFloat(formData.capacity_kw),
          installed_date: formData.installed_date,
          tariff_per_kwh: parseFloat(formData.tariff_per_kwh),
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          status: 'active',
        });

      if (error) throw error;

      toast.success('Plant added successfully!');
      router.push('/plants');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add plant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Plant Name *</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g., Solar Plant Alpha" className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
        <input type="text" name="location" value={formData.location} onChange={handleChange} required placeholder="e.g., 123 Solar Road, Phoenix, AZ" className={inputClass} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Capacity (kW) *</label>
          <input type="number" name="capacity_kw" value={formData.capacity_kw} onChange={handleChange} step="0.01" min="0" required placeholder="500" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Installed Date *</label>
          <input type="date" name="installed_date" value={formData.installed_date} onChange={handleChange} required className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tariff (₹/kWh) *</label>
          <input type="number" name="tariff_per_kwh" value={formData.tariff_per_kwh} onChange={handleChange} step="0.01" min="0.01" required placeholder="5.00" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
          <input type="number" name="latitude" value={formData.latitude} onChange={handleChange} step="any" placeholder="33.4484" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
          <input type="number" name="longitude" value={formData.longitude} onChange={handleChange} step="any" placeholder="-112.0740" className={inputClass} />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button type="button" onClick={() => router.push('/plants')} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={loading} className="px-6 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? 'Adding...' : 'Add Plant'}
        </button>
      </div>
    </form>
  );
}