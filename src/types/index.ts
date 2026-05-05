// User roles
export type UserRole = 'admin' | 'manager' | 'engineer';

// User profile
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  company_id: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Company
export interface Company {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  is_active: boolean;
  created_at: string;
}

// Solar Plant
export interface Plant {
  id: string;
  company_id: string;
  name: string;
  location: string;
  capacity_kw: number;
  installed_date: string;
  status: 'active' | 'inactive' | 'maintenance';
  latitude?: number;
  longitude?: number;
  tariff_per_kwh: number;
  created_at: string;
  updated_at: string;
}

// Daily Log
export interface DailyLog {
  id: string;
  plant_id: string;
  company_id: string;
  created_by: string;
  log_date: string;
  generation_kwh: number;
  peak_power_kw: number;
  downtime_minutes: number;
  weather_condition: 'sunny' | 'partly_cloudy' | 'cloudy' | 'rainy';
  temperature_celsius?: number;
  notes?: string;
  images?: string[];
  created_at: string;
}

// Maintenance Ticket
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketCategory = 'inverter' | 'panel' | 'wiring' | 'cleaning' | 'monitoring' | 'other';

export interface Ticket {
  id: string;
  plant_id: string;
  company_id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  assigned_to?: string;
  created_by: string;
  resolved_at?: string;
  resolution_notes?: string;
  images?: string[];
  created_at: string;
  updated_at: string;
}

// Performance Metrics
export interface PerformanceMetrics {
  plant_id: string;
  date: string;
  total_generation_kwh: number;
  total_capacity_kw: number;
  performance_ratio: number;
  cuf: number;
  downtime_hours: number;
}

// Alert
export type AlertType = 'low_generation' | 'high_downtime' | 'ticket_overdue' | 'performance_drop';

export interface Alert {
  id: string;
  company_id: string;
  plant_id?: string;
  type: AlertType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// Revenue
export interface PlantRevenue {
  plant_name: string;
  capacity_kw: number;
  tariff_per_kwh: number;
  today_generation: number;
  today_revenue: number;
  month_generation: number;
  month_revenue: number;
}

export interface RevenueChartData {
  date: string;
  revenue: number;
  generation: number;
}