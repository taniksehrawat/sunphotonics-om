'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';

interface Props {
  data: any[];
}

export default function GenerationChart({ data }: Props) {
  // Group by date
  const groupedData = data.reduce((acc: any[], log: any) => {
    const date = log.log_date;
    const existing = acc.find((d) => d.date === date);
    if (existing) {
      existing.generation += Number(log.generation_kwh);
    } else {
      acc.push({ date, generation: Number(log.generation_kwh) });
    }
    return acc;
  }, []);

  const chartData = groupedData.slice(-14).map((d: any) => ({
    ...d,
    formattedDate: format(parseISO(d.date), 'MMM dd'),
  }));

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generation Trend</h3>
        <div className="h-80 flex items-center justify-center text-gray-400">
          No generation data available yet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Generation Trend (Last 14 Days)</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="formattedDate" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip
              formatter={(value: any) => value ? `${Number(value).toLocaleString()} kWh` : '0 kWh'}
            />
            <Legend />
            <Bar dataKey="generation" fill="#eab308" name="Generation (kWh)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}