'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { formatINR } from '@/utils/revenue';

interface Props {
  data: { date: string; revenue: number; generation: number }[];
}

export default function RevenueChart({ data }: Props) {
  const chartData = data.slice(-14).map((d) => ({
    ...d,
    formattedDate: format(parseISO(d.date), 'MMM dd'),
  }));

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue & Generation Trend</h3>
        <div className="h-80 min-h-[320px] flex items-center justify-center text-gray-400">
          No revenue data available yet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue & Generation Trend</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="formattedDate" fontSize={12} />
            <YAxis
              yAxisId="left"
              fontSize={12}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              fontSize={12}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip
              formatter={(value: any, _name: any) => {
                const numValue = Number(value);
                if (isNaN(numValue)) return ['-', ''];
                if (_name === 'revenue') return [formatINR(numValue), 'Revenue'];
                return [`${numValue.toLocaleString()} kWh`, 'Generation'];
              }}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="revenue"
              fill="#16a34a"
              name="Revenue"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="generation"
              fill="#eab308"
              name="Generation"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}