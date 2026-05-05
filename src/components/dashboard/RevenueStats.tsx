import { IndianRupee, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { formatINR } from '@/utils/revenue';

interface Props {
  todayRevenue: number;
  monthRevenue: number;
  yearRevenue: number;
  yesterdayRevenue: number;
  lastMonthRevenue: number;
}

export default function RevenueStats({
  todayRevenue,
  monthRevenue,
  yearRevenue,
  yesterdayRevenue,
  lastMonthRevenue,
}: Props) {
  const dayChange = yesterdayRevenue > 0 
    ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 
    : 0;
  const monthChange = lastMonthRevenue > 0 
    ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
    : 0;

  const stats = [
    {
      label: "Today's Revenue",
      value: formatINR(todayRevenue),
      change: dayChange,
      changeLabel: 'vs yesterday',
      icon: IndianRupee,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      label: 'This Month',
      value: formatINR(monthRevenue),
      change: monthChange,
      changeLabel: 'vs last month',
      icon: Calendar,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      label: 'This Year',
      value: formatINR(yearRevenue),
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className={`${stat.bg} rounded-lg p-2.5`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            {stat.change !== undefined && (
              <div className={`flex items-center text-xs font-medium ${
                stat.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-0.5" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-0.5" />
                )}
                {Math.abs(stat.change).toFixed(1)}%
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
          <p className="text-xl font-bold text-gray-900">{stat.value}</p>
          {stat.changeLabel && (
            <p className="text-xs text-gray-400 mt-0.5">{stat.changeLabel}</p>
          )}
        </div>
      ))}
    </div>
  );
}