import { AlertTriangle, AlertCircle, Clock, TrendingDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  alerts: any[];
}

const alertIcons: Record<string, any> = {
  low_generation: TrendingDown,
  high_downtime: Clock,
  ticket_overdue: AlertCircle,
  performance_drop: AlertTriangle,
};

const alertColors: Record<string, string> = {
  low_generation: 'text-yellow-600 bg-yellow-50',
  high_downtime: 'text-red-600 bg-red-50',
  ticket_overdue: 'text-orange-600 bg-orange-50',
  performance_drop: 'text-purple-600 bg-purple-50',
};

export default function RecentAlerts({ alerts }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
      {alerts.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <AlertCircle className="h-12 w-12 mx-auto mb-2" />
          <p>No active alerts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const Icon = alertIcons[alert.type] || AlertCircle;
            const colorClass = alertColors[alert.type] || 'text-gray-600 bg-gray-50';
            return (
              <div key={alert.id} className={`flex items-start p-3 rounded-lg ${colorClass}`}>
                <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs mt-0.5 opacity-75">
                    {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}