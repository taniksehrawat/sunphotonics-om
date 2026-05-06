'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';

interface Props {
  companyId: string;
}

const inputClass = "block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm";

export default function NewClientForm({ companyId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        // Update profile to set role_type as client
        await supabase
          .from('profiles')
          .update({
            role_type: 'client',
            role: 'engineer',
            phone: formData.phone || null,
          })
          .eq('id', authData.user.id);
      }

      toast.success(`Client "${formData.full_name}" created successfully!`);
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
        <input
          type="text"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          required
          placeholder="e.g., Rajesh Sharma"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="rajesh@example.com"
          className={inputClass}
        />
        <p className="text-xs text-gray-400 mt-1">Client will use this email to login</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          placeholder="Min 6 characters"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Phone (Optional)</label>
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+91 9876543210"
          className={inputClass}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-medium mb-1">What the client can do:</p>
        <ul className="list-disc list-inside space-y-1 text-blue-700">
          <li>View their assigned plants</li>
          <li>See generation and revenue data</li>
          <li>Download reports</li>
        </ul>
        <p className="mt-2 font-medium">What they cannot do:</p>
        <ul className="list-disc list-inside space-y-1 text-blue-700">
          <li>Submit logs or create tickets</li>
          <li>See other clients' data</li>
          <li>See financials of other plants</li>
        </ul>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.push('/clients')}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Client'}
        </button>
      </div>
    </form>
  );
}