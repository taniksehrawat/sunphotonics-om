import { getProfile } from '@/lib/auth';
import Link from 'next/link';
import { User, Shield, Sun } from 'lucide-react';

export default async function SettingsPage() {
  const profile = await getProfile();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-200">
        {/* Profile */}
        <div className="p-6">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-yellow-500 flex items-center justify-center text-white text-2xl font-semibold">
              {profile.full_name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900">{profile.full_name}</h2>
              <p className="text-gray-500">{profile.email}</p>
              <span className="inline-flex px-2 py-0.5 mt-1 text-xs rounded-full bg-yellow-100 text-yellow-800 capitalize">
                {profile.role}
              </span>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="p-6 space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">Account Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">Full Name</label>
              <p className="text-gray-900">{profile.full_name}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Email</label>
              <p className="text-gray-900">{profile.email}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Role</label>
              <p className="text-gray-900 capitalize">{profile.role}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Phone</label>
              <p className="text-gray-900">{profile.phone || 'Not set'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}