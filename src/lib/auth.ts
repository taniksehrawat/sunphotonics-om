import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export async function getSession() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getProfile() {
  const supabase = await createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return profile;
  } catch (error) {
    console.error('getProfile error:', error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // FIX: Also check if profile exists
  const profile = await getProfile();
  if (!profile) {
    redirect('/login');
  }
  
  return user;
}

export async function requireRole(roles: string[]) {
  const profile = await getProfile();
  if (!profile || !roles.includes(profile.role)) {
    redirect('/dashboard');
  }
  return profile;
}