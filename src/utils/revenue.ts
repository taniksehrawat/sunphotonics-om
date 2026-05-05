/**
 * Extract plant tariff from log data
 * Handles both array and object formats from Supabase
 */
function getPlantTariff(plants: any): number {
  if (!plants) return 5.0;
  
  // If plants is an array, get first element
  if (Array.isArray(plants)) {
    return plants[0]?.tariff_per_kwh || 5.0;
  }
  
  // If plants is an object
  return plants.tariff_per_kwh || 5.0;
}

/**
 * Calculate revenue from generation and tariff
 */
export function calculateRevenue(generationKwh: number, tariffPerKwh: number): number {
  return generationKwh * tariffPerKwh;
}

/**
 * Format currency in Indian Rupees
 */
export function formatINR(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  if (amount >= 1000) {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
  return `₹${amount.toFixed(2)}`;
}

/**
 * Calculate total revenue from array of logs with plant tariff
 */
export function calculateTotalRevenue(
  logs: { generation_kwh: any; plants?: any }[]
): number {
  return logs.reduce((total, log) => {
    const tariff = getPlantTariff(log.plants);
    return total + Number(log.generation_kwh || 0) * tariff;
  }, 0);
}

/**
 * Group revenue by date for chart data
 */
export function groupRevenueByDate(
  logs: { log_date: string; generation_kwh: any; plants?: any }[]
): { date: string; revenue: number; generation: number }[] {
  const grouped: Record<string, { revenue: number; generation: number }> = {};

  logs.forEach((log) => {
    const tariff = getPlantTariff(log.plants);
    if (!grouped[log.log_date]) {
      grouped[log.log_date] = { revenue: 0, generation: 0 };
    }
    grouped[log.log_date].revenue += Number(log.generation_kwh || 0) * tariff;
    grouped[log.log_date].generation += Number(log.generation_kwh || 0);
  });

  return Object.entries(grouped).map(([date, data]) => ({
    date,
    ...data,
  }));
}