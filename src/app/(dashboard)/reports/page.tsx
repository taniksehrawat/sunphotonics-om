'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { Download, FileText, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { format } from 'date-fns';

const inputClass = "block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-yellow-500 focus:border-yellow-500";
const selectClass = "block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-yellow-500 focus:border-yellow-500";

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [plantId, setPlantId] = useState('');
  const [plants, setPlants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchPlants = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profile) {
        const { data } = await supabase
          .from('plants')
          .select('id, name')
          .eq('company_id', profile.company_id);
        setPlants(data || []);
      }
    };
    fetchPlants();
  }, [supabase]);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    let query = supabase
      .from('daily_logs')
      .select(`
        *,
        plants(name, capacity_kw)
      `)
      .eq('company_id', profile?.company_id)
      .gte('log_date', dateRange.start)
      .lte('log_date', dateRange.end)
      .order('log_date', { ascending: true });

    if (plantId) {
      query = query.eq('plant_id', plantId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  };

  const generatePDF = async () => {
    setLoading(true);
    try {
      const data = await fetchData();
      if (!data || data.length === 0) {
        toast.error('No data found for selected period');
        setLoading(false);
        return;
      }

      const doc = new jsPDF();

      // Title
      doc.setFontSize(16);
      doc.text('Sunphotonics O&M - Generation Report', 14, 20);

      // Period info
      doc.setFontSize(10);
      doc.text(`Period: ${format(new Date(dateRange.start), 'MMM dd, yyyy')} - ${format(new Date(dateRange.end), 'MMM dd, yyyy')}`, 14, 30);
      doc.text(`Generated: ${format(new Date(), 'PPpp')}`, 14, 38);

      // Table data
      const tableData = data.map((log: any) => [
        format(new Date(log.log_date), 'MM/dd/yyyy'),
        log.plants?.name || '-',
        `${Number(log.generation_kwh).toLocaleString()} kWh`,
        `${log.downtime_minutes} min`,
        log.weather_condition || '-',
        log.notes || '-',
      ]);

      // Generate table
      autoTable(doc, {
        startY: 44,
        head: [['Date', 'Plant', 'Generation', 'Downtime', 'Weather', 'Notes']],
        body: tableData,
        headStyles: { fillColor: [234, 179, 8] },
        styles: { fontSize: 8 },
        margin: { left: 14, right: 14 },
      });

      // Summary
      const totalGen = data.reduce((sum: number, log: any) => sum + Number(log.generation_kwh), 0);
      const totalDowntime = data.reduce((sum: number, log: any) => sum + log.downtime_minutes, 0);

      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(11);
      doc.text(`Total Generation: ${totalGen.toLocaleString()} kWh`, 14, finalY);
      doc.text(`Total Downtime: ${totalDowntime} minutes`, 14, finalY + 8);
      doc.text(`Number of Entries: ${data.length}`, 14, finalY + 16);

      doc.save(`generation-report-${dateRange.start}-to-${dateRange.end}.pdf`);
      toast.success('PDF report generated');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateExcel = async () => {
    setLoading(true);
    try {
      const data = await fetchData();
      if (!data || data.length === 0) {
        toast.error('No data found for selected period');
        setLoading(false);
        return;
      }

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Sunphotonics O&M';
      const worksheet = workbook.addWorksheet('Generation Report');

      worksheet.columns = [
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Plant', key: 'plant', width: 25 },
        { header: 'Generation (kWh)', key: 'generation', width: 18 },
        { header: 'Peak Power (kW)', key: 'peak', width: 18 },
        { header: 'Downtime (min)', key: 'downtime', width: 15 },
        { header: 'Weather', key: 'weather', width: 15 },
        { header: 'Temperature (°C)', key: 'temp', width: 18 },
        { header: 'Notes', key: 'notes', width: 40 },
      ];

      data.forEach((log: any) => {
        worksheet.addRow({
          date: log.log_date,
          plant: log.plants?.name,
          generation: Number(log.generation_kwh),
          peak: Number(log.peak_power_kw || 0),
          downtime: log.downtime_minutes,
          weather: log.weather_condition,
          temp: log.temperature_celsius,
          notes: log.notes,
        });
      });

      // Style header
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEAB308' },
      };

      // Summary
      const totalGen = data.reduce((sum: number, log: any) => sum + Number(log.generation_kwh), 0);
      worksheet.addRow({});
      worksheet.addRow({ date: 'TOTAL', generation: totalGen });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generation-report-${dateRange.start}-to-${dateRange.end}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Excel report generated');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Generate Reports</h1>
        <p className="text-gray-500 text-sm">Download generation reports in PDF or Excel format</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Plant</label>
            <select
              value={plantId}
              onChange={(e) => setPlantId(e.target.value)}
              className={selectClass}
            >
              <option value="">All Plants</option>
              {plants.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
          <button
            onClick={generatePDF}
            disabled={loading}
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <FileText className="h-5 w-5 mr-2" />}
            Download PDF
          </button>
          <button
            onClick={generateExcel}
            disabled={loading}
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Download className="h-5 w-5 mr-2" />}
            Download Excel
          </button>
        </div>
      </div>
    </div>
  );
}