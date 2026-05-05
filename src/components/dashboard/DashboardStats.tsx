import { Zap, Clock, Leaf, AlertCircle } from 'lucide-react';

interface Props {
  totalGeneration: number;
  totalDowntime: number;
  activePlants: number;
  openTickets: number;
}

export default function DashboardStats({ totalGeneration, totalDowntime, activePlants, openTickets }: Props) {
  const stats = [
    {
      label: 'Today\'s Generation',
      value: `${totalGeneration.toLocaleString()} kWh`,
      icon: Zap,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
    },
    {
      label: 'Downtime',
      value: `${totalDowntime} min`,
      icon: Clock,
      color: 'text-red-600',
      bg: 'bg-red-100',
    },
    {
      label: 'Active Plants',
      value: activePlants,
      icon: Leaf,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      label: 'Open Tickets',
      value: openTickets,
      icon: AlertCircle,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className={`${stat.bg} rounded-lg p-3`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}