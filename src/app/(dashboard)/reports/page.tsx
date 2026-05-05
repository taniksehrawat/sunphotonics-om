'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { Download, FileText, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
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
        plants(name, capacity_kw, tariff_per_kwh)
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
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // ============================================
      // HEADER - Company Name & Logo Area
      // ============================================
      doc.setFillColor(234, 179, 8);
      doc.rect(0, 0, pageWidth, 35, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('Sunphotonics O&M', 14, 22);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Solar EPC Operations & Maintenance Report', 14, 30);

      // ============================================
      // REPORT TITLE
      // ============================================
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Generation & Revenue Report', 14, 50);

      // ============================================
      // META INFORMATION BOX
      // ============================================
      doc.setDrawColor(220, 220, 220);
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(14, 58, pageWidth - 28, 22, 3, 3, 'FD');
      
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      const periodText = `Report Period: ${format(new Date(dateRange.start), 'MMMM dd, yyyy')}  -  ${format(new Date(dateRange.end), 'MMMM dd, yyyy')}`;
      const generatedText = `Generated on: ${format(new Date(), 'PPP \'at\' p')}`;
      const plantFilterText = plantId && plants.length > 0 
        ? `Plant: ${plants.find(p => p.id === plantId)?.name || 'All Plants'}`
        : 'Plants: All Plants';
      
      doc.text(periodText, 20, 67);
      doc.text(generatedText, 20, 74);
      doc.text(plantFilterText, pageWidth - 20, 67, { align: 'right' });

      // ============================================
      // SUMMARY CARDS
      // ============================================
      const totalGen = data.reduce((sum: number, log: any) => sum + Number(log.generation_kwh), 0);
      const totalRevenue = data.reduce((sum: number, log: any) => 
        sum + (Number(log.generation_kwh) * (log.plants?.tariff_per_kwh || 5)), 0
      );
      const totalDowntime = data.reduce((sum: number, log: any) => sum + log.downtime_minutes, 0);
      const avgGeneration = data.length > 0 ? totalGen / data.length : 0;
      
      const cardY = 88;
      const cardWidth = (pageWidth - 28) / 4 - 4;
      
      const cards = [
        { label: 'Total Generation', value: `${totalGen.toLocaleString()} kWh`, color: [234, 179, 8] },
        { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: [22, 163, 74] },
        { label: 'Total Downtime', value: `${totalDowntime} minutes`, color: [220, 38, 38] },
        { label: 'Avg Daily Gen', value: `${avgGeneration.toFixed(0)} kWh`, color: [37, 99, 235] },
      ];
      
      cards.forEach((card, index) => {
        const x = 14 + (cardWidth + 4) * index;
        
        doc.setFillColor(card.color[0], card.color[1], card.color[2]);
        doc.roundedRect(x, cardY, cardWidth, 24, 3, 3, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(card.label, x + cardWidth / 2, cardY + 10, { align: 'center' });
        
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text(card.value, x + cardWidth / 2, cardY + 21, { align: 'center' });
      });

      // ============================================
      // DATA TABLE
      // ============================================
      const tableStartY = 120;
      
      // Table headers
      doc.setFillColor(50, 50, 50);
      doc.rect(14, tableStartY, pageWidth - 28, 10, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      
      const headers = ['Date', 'Plant', 'Generation', 'Tariff', 'Revenue', 'Downtime', 'Weather'];
      const colWidths = [25, 40, 25, 20, 25, 20, 25];
      let colX = 16;
      
      headers.forEach((header, i) => {
        doc.text(header, colX + colWidths[i] / 2, tableStartY + 7, { align: 'center' });
        colX += colWidths[i];
      });

      // Table rows
      let rowY = tableStartY + 10;
      doc.setFont('helvetica', 'normal');
      
      data.forEach((log: any, index: number) => {
        // Check if we need a new page
        if (rowY > pageHeight - 40) {
          doc.addPage();
          rowY = 20;
        }
        
        const rowColor = index % 2 === 0 ? [255, 255, 255] : [248, 248, 248];
        doc.setFillColor(rowColor[0], rowColor[1], rowColor[2]);
        doc.rect(14, rowY, pageWidth - 28, 8, 'F');
        
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(7.5);
        
        const tariff = log.plants?.tariff_per_kwh || 5;
        const revenue = Number(log.generation_kwh) * tariff;
        
        const rowData = [
          format(new Date(log.log_date), 'dd/MM/yy'),
          log.plants?.name?.substring(0, 22) || '-',
          `${Number(log.generation_kwh).toLocaleString()} kWh`,
          `₹${tariff.toFixed(2)}`,
          `₹${revenue.toLocaleString('en-IN')}`,
          `${log.downtime_minutes} min`,
          log.weather_condition || '-',
        ];
        
        let dataX = 16;
        rowData.forEach((item, i) => {
          const align = i === 0 || i === 1 || i === 6 ? 'left' : 'right';
          const xPos = align === 'right' ? dataX + colWidths[i] - 2 : dataX + 2;
          doc.text(String(item), xPos, rowY + 6, { align });
          dataX += colWidths[i];
        });
        
        rowY += 8;
      });

      // ============================================
      // TOTALS ROW
      // ============================================
      if (rowY > pageHeight - 30) {
        doc.addPage();
        rowY = 20;
      }
      
      doc.setDrawColor(234, 179, 8);
      doc.setLineWidth(0.5);
      doc.line(14, rowY, pageWidth - 14, rowY);
      rowY += 3;
      
      doc.setFillColor(255, 251, 235);
      doc.roundedRect(14, rowY, pageWidth - 28, 10, 2, 2, 'F');
      
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      
      doc.text('TOTAL', 18, rowY + 7);
      doc.text(`${totalGen.toLocaleString()} kWh`, 14 + 25 + 40 + 25 - 2, rowY + 7, { align: 'right' });
      doc.text(`₹${totalRevenue.toLocaleString('en-IN')}`, 14 + 25 + 40 + 25 + 20 + 25 - 2, rowY + 7, { align: 'right' });
      doc.text(`${totalDowntime} min`, 14 + 25 + 40 + 25 + 20 + 25 + 20 - 2, rowY + 7, { align: 'right' });
      doc.text(`${data.length} entries`, 14 + 25 + 40 + 25 + 20 + 25 + 20 + 25 - 2, rowY + 7, { align: 'right' });

      // ============================================
      // FOOTER
      // ============================================
      const footerY = pageHeight - 15;
      doc.setDrawColor(220, 220, 220);
      doc.line(14, footerY, pageWidth - 14, footerY);
      
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('Sunphotonics O&M - Automated Report', 14, footerY + 5);
      doc.text('www.sunphotonics.com', pageWidth / 2, footerY + 5, { align: 'center' });
      doc.text(`Page 1 of 1`, pageWidth - 14, footerY + 5, { align: 'right' });

      // ============================================
      // SAVE
      // ============================================
      doc.save(`Sunphotonics_Report_${dateRange.start}_to_${dateRange.end}.pdf`);
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
        { header: 'Tariff (₹/kWh)', key: 'tariff', width: 14 },
        { header: 'Revenue (₹)', key: 'revenue', width: 18 },
        { header: 'Peak Power (kW)', key: 'peak', width: 18 },
        { header: 'Downtime (min)', key: 'downtime', width: 15 },
        { header: 'Weather', key: 'weather', width: 15 },
        { header: 'Temperature (°C)', key: 'temp', width: 18 },
        { header: 'Notes', key: 'notes', width: 40 },
      ];

      data.forEach((log: any) => {
        const tariff = log.plants?.tariff_per_kwh || 5;
        const generation = Number(log.generation_kwh);
        worksheet.addRow({
          date: log.log_date,
          plant: log.plants?.name,
          generation: generation,
          tariff: tariff,
          revenue: generation * tariff,
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

      // Revenue column formatting
      worksheet.getColumn('revenue').numFmt = '₹#,##0.00';
      worksheet.getColumn('tariff').numFmt = '₹#,##0.00';

      // Summary
      const totalGen = data.reduce((sum: number, log: any) => sum + Number(log.generation_kwh), 0);
      const totalRevenue = data.reduce((sum: number, log: any) => 
        sum + (Number(log.generation_kwh) * (log.plants?.tariff_per_kwh || 5)), 0
      );

      worksheet.addRow({});
      const summaryRow = worksheet.addRow({
        date: 'TOTAL',
        generation: totalGen,
        revenue: totalRevenue,
      });
      summaryRow.font = { bold: true };
      summaryRow.getCell('revenue').numFmt = '₹#,##0.00';

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Sunphotonics_Report_${dateRange.start}_to_${dateRange.end}.xlsx`;
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
        <p className="text-gray-500 text-sm">Download generation & revenue reports in PDF or Excel format</p>
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