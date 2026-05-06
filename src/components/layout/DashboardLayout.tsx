'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import {
  Sun,
  LayoutDashboard,
  ClipboardList,
  Ticket,
  Leaf,
  FileText,
  Users,
  Settings,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Building2,
} from 'lucide-react';

interface Props {
  user: any;
  profile: any;
  children: React.ReactNode;
}

export default function DashboardLayoutClient({ user, profile, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const isTeam = profile.role_type === 'team' || !profile.role_type;
  const isClient = profile.role_type === 'client';
  const isAdminOrManager = profile.role === 'admin' || profile.role === 'manager';

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  ];

  if (isTeam) {
    navigation.push(
      { name: 'Daily Logs', href: '/logs/new', icon: ClipboardList },
      { name: 'View Logs', href: '/logs/view', icon: FileText },
      { name: 'Tickets', href: '/tickets', icon: Ticket },
      { name: 'Plants', href: '/plants', icon: Leaf },
      { name: 'Reports', href: '/reports', icon: FileText }
    );
  }

  if (isClient) {
    navigation.push(
      { name: 'My Plants', href: '/plants', icon: Leaf }
    );
  }

  if (isTeam && isAdminOrManager) {
    navigation.push({ name: 'Users', href: '/users', icon: Users });
    navigation.push({ name: 'Clients', href: '/clients', icon: Building2 });
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 lg:translate-x-0 lg:static lg:z-auto">
          <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Sun className="h-8 w-8 text-yellow-500" />
              <span className="text-lg font-bold text-gray-900">Sunphotonics</span>
            </div>
          </div>
          <nav className="mt-4 px-3 space-y-1">
            {navigation.map((item) => (
              <div
                key={item.name}
                className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700"
              >
                <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                {item.name}
              </div>
            ))}
          </nav>
        </aside>

        <div className="lg:pl-64">
          <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
            <div className="flex items-center justify-between h-14 px-4 sm:px-6">
              <div className="flex-1" />
              <div className="flex items-center space-x-3 px-3 py-2">
                <div className="h-8 w-8 rounded-full bg-yellow-500" />
                <div className="hidden sm:block">
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="h-3 w-16 bg-gray-100 rounded mt-1" />
                </div>
              </div>
            </div>
          </header>
          <main className="px-4 sm:px-6 lg:px-8 pt-0 pb-4">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Sun className="h-8 w-8 text-yellow-500" />
            <span className="text-lg font-bold text-gray-900">Sunphotonics</span>
          </Link>
          <button
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-4 px-3 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${
                  isActive(item.href)
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between h-14 px-4 sm:px-6">
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex-1" />

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <div className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-semibold text-sm">
                  {profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">{profile.full_name}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {isClient ? 'Plant Owner' : profile.role}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{profile.full_name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4 inline mr-2" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 inline mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 pt-0 pb-4">
          {children}
        </main>
      </div>
    </div>
  );
}