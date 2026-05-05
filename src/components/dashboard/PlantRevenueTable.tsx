import { formatINR } from '@/utils/revenue';

interface PlantRevenue {
  plant_name: string;
  capacity_kw: number;
  tariff_per_kwh: number;
  today_generation: number;
  today_revenue: number;
  month_generation: number;
  month_revenue: number;
}

interface Props {
  data: PlantRevenue[];
}

export default function PlantRevenueTable({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Plant Revenue Breakdown</h3>
        <p className="text-gray-400 text-center py-8">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Plant Revenue Breakdown</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plant</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tariff</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Today Gen</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Today Revenue</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Month Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((plant, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {plant.plant_name}
                  <span className="text-xs text-gray-400 ml-1">({plant.capacity_kw} kW)</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 text-right">
                  ₹{plant.tariff_per_kwh?.toFixed(2)}/kWh
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">
                  {plant.today_generation?.toLocaleString()} kWh
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-green-600 text-right">
                  {formatINR(plant.today_revenue || 0)}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-blue-600 text-right">
                  {formatINR(plant.month_revenue || 0)}
                </td>
              </tr>
            ))}
            {/* Total Row */}
            <tr className="bg-yellow-50 font-semibold">
              <td className="px-4 py-3 text-sm text-gray-900">TOTAL</td>
              <td className="px-4 py-3"></td>
              <td className="px-4 py-3 text-sm text-gray-900 text-right">
                {data.reduce((s, p) => s + (p.today_generation || 0), 0).toLocaleString()} kWh
              </td>
              <td className="px-4 py-3 text-sm text-green-700 text-right">
                {formatINR(data.reduce((s, p) => s + (p.today_revenue || 0), 0))}
              </td>
              <td className="px-4 py-3 text-sm text-blue-700 text-right">
                {formatINR(data.reduce((s, p) => s + (p.month_revenue || 0), 0))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}