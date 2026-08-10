import React, { useState } from 'react';
import {
  Plus,
  Search,
  FileSpreadsheet,
  Download,
  Trash2,
  Edit2,
  Zap,
  Calendar,
  AlertCircle,
  X
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { GangguanLog, Penyulang, SectionJaringan, User } from '../../types';
import { HealthIndexBanner } from '../HealthIndexBanner';
import { InputGangguanModal } from '../modals/InputGangguanModal';
import { exportToCSV } from '../../utils/exportCsv';
import { canEditModule } from '../../utils/permissions';

interface GangguanTripViewProps {
  currentUser?: User;
  gangguanList: GangguanLog[];
  penyulangList: Penyulang[];
  sectionList: SectionJaringan[];
  onAddGangguan: (log: GangguanLog) => void;
  onDeleteGangguan: (id: string) => void;
}

export const GangguanTripView: React.FC<GangguanTripViewProps> = ({
  currentUser,
  gangguanList,
  penyulangList,
  sectionList,
  onAddGangguan,
  onDeleteGangguan
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGangguan, setEditingGangguan] = useState<GangguanLog | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeGangguanTab, setActiveGangguanTab] = useState<'semua' | 'trip_pangkal'>('semua');
  const [penyulangChartType, setPenyulangChartType] = useState<'bar' | 'line'>('bar');

  const tripPangkalList = gangguanList.filter((g) => {
    const p = penyulangList.find(
      (item) => item.namaPenyulang.toLowerCase() === (g.namaPenyulang || '').toLowerCase()
    );
    return p?.status === 'Utama' || (g.namaPenyulang || '').toUpperCase().includes('UTAMA');
  });

  const rawActiveList = activeGangguanTab === 'trip_pangkal' ? tripPangkalList : gangguanList;

  const activeList = rawActiveList.filter((g) => {
    const tgl = g.tanggal || '';
    if (startDate && tgl < startDate) return false;
    if (endDate && tgl > endDate) return false;
    if (!startDate && !endDate && selectedYear) {
      return tgl.startsWith(selectedYear);
    }
    return true;
  });

  const totalTrip = activeList.length;

  // Chart 1 Data: Proportion by Code
  const codeCounts: Record<string, number> = {};
  activeList.forEach((g) => {
    const code = (g.kodeGangguan || 'E-5').trim().toUpperCase();
    codeCounts[code] = (codeCounts[code] || 0) + 1;
  });

  const CODE_LABELS: Record<string, string> = {
    'I-1': 'I-1 (Komponen JTM)',
    'I-2': 'I-2 (Peralatan JTM)',
    'I-3': 'I-3 (Trafo/Lainnya)',
    'I-4': 'I-4 (Tiang)',
    'E-1': 'E-1 (Pohon)',
    'E-2': 'E-2 (Bencana Alam)',
    'E-3': 'E-3 (Pihak III/Binatang)',
    'E-4': 'E-4 (Layang-layang/Umbul-umbul)',
    'E-5': 'Tidak Ditemukan'
  };

  const pieData = Object.entries(codeCounts).map(([code, count]) => ({
    name: CODE_LABELS[code] || code,
    value: count
  }));

  const COLORS = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#a855f7', '#8b5cf6', '#ec4899'];

  // Dominant Code calculation
  let dominantCode = '-';
  let maxCodeCount = 0;
  Object.entries(codeCounts).forEach(([code, count]) => {
    if (count > maxCodeCount) {
      maxCodeCount = count;
      dominantCode = CODE_LABELS[code] || code;
    }
  });

  // Penyulang Rawan calculation
  const penyulangCounts: Record<string, number> = {};
  activeList.forEach((g) => {
    const pName = g.namaPenyulang || 'Unknown';
    penyulangCounts[pName] = (penyulangCounts[pName] || 0) + 1;
  });
  let rawanPenyulang = '-';
  let maxPenyulangCount = 0;
  Object.entries(penyulangCounts).forEach(([pName, count]) => {
    if (count > maxPenyulangCount) {
      maxPenyulangCount = count;
      rawanPenyulang = pName;
    }
  });

  // Chart 2 Data: Monthly Trend
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
  const monthlyData = months.map((m, idx) => {
    const count = activeList.filter((g) => {
      const parts = (g.tanggal || '').split('-');
      if (parts.length >= 2) {
        return parseInt(parts[1], 10) - 1 === idx;
      }
      return false;
    }).length;
    return { name: m, gangguan: count };
  });

  // Chart 3 Data: Frequency per Feeder (Penyulang)
  const feederMap: Record<string, number> = {};
  penyulangList.forEach((p) => {
    feederMap[p.namaPenyulang] = 0;
  });
  activeList.forEach((g) => {
    const pName = g.namaPenyulang || 'Lainnya';
    feederMap[pName] = (feederMap[pName] || 0) + 1;
  });

  const penyulangChartData = Object.entries(feederMap)
    .map(([name, count]) => ({
      name,
      gangguan: count
    }))
    .sort((a, b) => b.gangguan - a.gangguan);

  // Matrix calculation per Code & Month
  const DEFAULT_MATRIX_CODES = [
    { code: 'I-1', label: 'KOMPONEN JTM' },
    { code: 'I-2', label: 'PERALATAN JTM' },
    { code: 'I-3', label: 'TRAFO DAN LAINNYA' },
    { code: 'I-4', label: 'TIANG' },
    { code: 'E-1', label: 'POHON / ROW' },
    { code: 'E-2', label: 'BENCANA ALAM' },
    { code: 'E-3', label: 'PEKERJAAN PIHAK III / BINATANG' },
    { code: 'E-4', label: 'LAYANG-LAYANG / UMBUL-UMBUL, DLL' },
    { code: 'E-5', label: 'TIDAK DITEMUKAN' }
  ];

  const matrixRowsData = DEFAULT_MATRIX_CODES.map((rowDef) => {
    const monthlyCounts = Array(12).fill(0);
    activeList.forEach((g) => {
      if ((g.kodeGangguan || '').trim().toUpperCase() === rowDef.code.toUpperCase()) {
        const parts = (g.tanggal || '').split('-');
        if (parts.length >= 2) {
          const mIdx = parseInt(parts[1], 10) - 1;
          if (mIdx >= 0 && mIdx < 12) {
            monthlyCounts[mIdx] += 1;
          }
        }
      }
    });
    const totalRow = monthlyCounts.reduce((a, b) => a + b, 0);
    return { ...rowDef, monthlyCounts, totalRow };
  });

  const monthlyTotalSums = months.map((_, idx) =>
    matrixRowsData.reduce((acc, row) => acc + row.monthlyCounts[idx], 0)
  );
  const overallMatrixTotal = matrixRowsData.reduce((acc, row) => acc + row.totalRow, 0);

  // Filtered Table List for search
  const filteredList = activeList.filter((g) => {
    return (
      (g.namaPenyulang || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.section || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.kodeGangguan || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.penyebab || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleExportPDF = () => {
    const doc = new jsPDF('landscape');
    doc.setFontSize(14);
    doc.text('Data Laporan Gangguan Penyulang / Trip - PT PLN (Persero)', 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);

    const headers = [
      ['Tanggal', 'Penyulang', 'Section', 'Jam Keluar', 'Jam Masuk', 'Durasi', 'Relay', 'Penyebab', 'Detail Lokasi']
    ];

    const dataRows = filteredList.map((g) => [
      g.tanggal,
      g.namaPenyulang,
      g.section,
      g.jamKeluar,
      g.jamMasuk,
      g.durasi || '-',
      g.relayBekerja,
      g.penyebabGangguan,
      g.detailLokasi
    ]);

    autoTable(doc, {
      head: headers,
      body: dataRows,
      startY: 28,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`Gangguan_Penyulang_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Export to CSV/Excel handler
  const handleExportGangguan = () => {
    const headers = [
      'Tanggal',
      'Penyulang',
      'Section',
      'Jam Keluar',
      'Jam Masuk',
      'Durasi',
      'Relay Bekerja',
      'Kode Gangguan',
      'Arus R (A)',
      'Arus S (A)',
      'Arus T (A)',
      'Arus IN (A)',
      'Penyebab',
      'Detail Lokasi'
    ];

    const rows = filteredList.map((g) => [
      g.tanggal,
      g.namaPenyulang,
      g.section,
      g.jamKeluar,
      g.jamMasuk,
      g.durasi,
      g.relayBekerja,
      g.kodeGangguan,
      g.arusR,
      g.arusS,
      g.arusT,
      g.arusIN,
      g.penyebab,
      g.detailLokasi
    ]);

    exportToCSV('Laporan_Gangguan_20kV_ULP_Baguala', headers, rows);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-50 text-slate-900 font-sans min-h-screen">
      
      {/* Top Banner */}
      <HealthIndexBanner
        totalCount={penyulangList.length}
        sempurnaCount={penyulangList.filter((p) => p.healthIndexStatus === 'Sempurna').length}
        sehatCount={penyulangList.filter((p) => p.healthIndexStatus === 'Sehat').length}
        sakitCount={penyulangList.filter((p) => p.healthIndexStatus === 'Sakit').length}
        kronisCount={penyulangList.filter((p) => p.healthIndexStatus === 'Kronis').length}
      />

      {/* Header & Filter Bar */}
      <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              DASHBOARD MATRIKS GANGGUAN PENYULANG
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px] uppercase">
              LIVE SCADA
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis frekuensi, jenis kode gangguan, dan matriks distribusi bulanan
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tab Selector */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveGangguanTab('semua')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeGangguanTab === 'semua'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({gangguanList.length})
            </button>
            <button
              onClick={() => setActiveGangguanTab('trip_pangkal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeGangguanTab === 'trip_pangkal'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Trip Pangkal ({tripPangkalList.length})</span>
            </button>
          </div>

          {/* Date Range Filter */}
          <div className="flex flex-wrap items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-slate-500 font-medium hidden sm:inline">Periode:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer"
              title="Tanggal Mulai"
            />
            <span className="text-slate-400 font-bold">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer"
              title="Tanggal Selesai"
            />
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="p-1 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                title="Reset Filter Tanggal"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Reset</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold">
            <span className="text-slate-500">Tahun:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              disabled={!!(startDate || endDate)}
              className={`bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer ${
                startDate || endDate ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold uppercase text-rose-600 tracking-wider">TOTAL GANGGUAN</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">{totalTrip} <span className="text-xs font-semibold text-rose-600">Kali Trip</span></div>
            <span className="text-[11px] text-slate-400">
              {startDate || endDate
                ? `Rentang: ${startDate || 'Awal'} s/d ${endDate || 'Akhir'}`
                : `Periode Tahun ${selectedYear}`} ({activeGangguanTab === 'trip_pangkal' ? 'Trip Pangkal' : 'Semua'})
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold uppercase text-amber-600 tracking-wider">KODE DOMINAN</span>
            <div className="text-base font-extrabold text-slate-900 mt-1 uppercase">{dominantCode}</div>
            <span className="text-[11px] text-slate-400">Frekuensi: {maxCodeCount} Kejadian</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">PENYULANG RAWAN</span>
            <div className="text-xl font-extrabold text-slate-900 mt-1 uppercase">{rawanPenyulang}</div>
            <span className="text-[11px] text-slate-400">Total Trip: {maxPenyulangCount} Kali</span>
          </div>
        </div>
      </div>

      {/* Analytics Visuals Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart */}
        <div className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900">
              🍩 Proporsi Jenis Kode Gangguan
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              Pie Diagram
            </span>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            {pieData.length === 0 ? (
              <div className="text-xs text-slate-400">Belum ada data gangguan</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bar Chart - Per Bulan */}
        <div className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900">
              📈 Tren Gangguan Per Bulan
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              Bar Chart
            </span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="gangguan" fill="#0284c7" radius={[4, 4, 0, 0]} name="Kejadian" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar/Line Chart - Per Penyulang */}
        <div className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900">
              ⚡ Frekuensi Gangguan Per Penyulang
            </h3>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px]">
              <button
                onClick={() => setPenyulangChartType('bar')}
                className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                  penyulangChartType === 'bar'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bar
              </button>
              <button
                onClick={() => setPenyulangChartType('line')}
                className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                  penyulangChartType === 'line'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Line
              </button>
            </div>
          </div>

          <div className="h-52 w-full">
            {penyulangChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Belum ada data gangguan
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {penyulangChartType === 'bar' ? (
                  <BarChart data={penyulangChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={9} interval={0} angle={-15} textAnchor="end" height={30} />
                    <YAxis stroke="#64748b" fontSize={10} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="gangguan" fill="#e11d48" radius={[4, 4, 0, 0]} name="Kejadian" />
                  </BarChart>
                ) : (
                  <LineChart data={penyulangChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={9} interval={0} angle={-15} textAnchor="end" height={30} />
                    <YAxis stroke="#64748b" fontSize={10} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="gangguan" stroke="#e11d48" strokeWidth={2.5} dot={{ r: 4, fill: '#e11d48' }} activeDot={{ r: 6 }} name="Kejadian" />
                  </LineChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Matriks Distribusi Per Kode & Bulan */}
      <div className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-4 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            📊 MATRIKS DISTRIBUSI GANGGUAN PER KODE & BULAN
          </h3>
          <div className="flex items-center gap-2">
            {(startDate || endDate) && (
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
                PERIODE: {startDate || 'Awal'} s/d {endDate || 'Akhir'}
              </span>
            )}
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-bold">
              TOTAL KESELURUHAN: {overallMatrixTotal} KEJADIAN
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs text-slate-700 border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-bold text-[10px] uppercase border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5 text-left">Kode Gangguan</th>
                <th className="px-3 py-2.5 text-left">Keterangan Jenis</th>
                {months.map((m) => (
                  <th key={m} className="px-2 py-2.5">{m}</th>
                ))}
                <th className="px-3 py-2.5 bg-blue-600 text-white font-bold">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {matrixRowsData.map((row) => (
                <tr key={row.code} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-2.5 text-left font-bold text-rose-600">{row.code === 'E-5' ? '-' : row.code}</td>
                  <td className="px-3 py-2.5 text-left text-slate-700 text-[11px] font-semibold">{row.label}</td>
                  {row.monthlyCounts.map((val, idx) => (
                    <td
                      key={idx}
                      className={`px-2 py-2.5 ${
                        val > 0 ? 'font-bold text-emerald-700 bg-emerald-50' : 'text-slate-400'
                      }`}
                    >
                      {val > 0 ? val : '-'}
                    </td>
                  ))}
                  <td className={`px-3 py-2.5 font-bold text-xs ${row.totalRow > 0 ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-400'}`}>
                    {row.totalRow}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100 font-extrabold text-slate-900 border-t-2 border-slate-300">
              <tr>
                <td colSpan={2} className="px-3 py-2.5 text-left uppercase tracking-wider text-[11px]">
                  JUMLAH TOTAL PER BULAN
                </td>
                {monthlyTotalSums.map((sum, idx) => (
                  <td
                    key={idx}
                    className={`px-2 py-2.5 ${sum > 0 ? 'text-blue-700 bg-blue-100/50' : 'text-slate-400'}`}
                  >
                    {sum > 0 ? sum : '-'}
                  </td>
                ))}
                <td className="px-3 py-2.5 bg-blue-600 text-white font-extrabold text-xs">
                  {overallMatrixTotal}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden space-y-4 p-5">
        
        {/* Table Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari penyulang, section, kode gangguan..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <button className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Import Excel/CSV</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-red-600/20"
              title="Unduh data laporan gangguan ke format PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={handleExportGangguan}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-emerald-700/20"
              title="Unduh data laporan gangguan ke format CSV/Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV/Excel</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>+ Input Gangguan</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Tanggal</th>
                <th className="px-4 py-3.5">Penyulang</th>
                <th className="px-4 py-3.5">Section</th>
                <th className="px-4 py-3.5">Jam Out / In</th>
                <th className="px-4 py-3.5">Durasi</th>
                <th className="px-4 py-3.5">Relay / Kode</th>
                <th className="px-4 py-3.5">Arus (R/S/T/IN)</th>
                <th className="px-4 py-3.5">Penyebab / Lokasi</th>
                <th className="px-4 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                    Tidak ada data log gangguan.
                  </td>
                </tr>
              ) : (
                filteredList.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-slate-500">{g.tanggal}</td>
                    <td className="px-4 py-3.5 font-bold text-blue-600">{g.namaPenyulang}</td>
                    <td className="px-4 py-3.5 text-slate-700 text-[11px]">{g.section}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-500">{g.jamKeluar} - {g.jamMasuk}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono font-bold text-[11px]">
                        {g.durasi}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-slate-700 font-semibold">{g.relayBekerja}</span>
                      <span className="ml-1.5 px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-[10px]">
                        {g.kodeGangguan === 'E-5' ? 'Tidak Ditemukan' : g.kodeGangguan}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[10px] text-slate-500">
                      R:{g.arusR} A | S:{g.arusS} A | T:{g.arusT} A | IN:{g.arusIN} A
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{g.penyebab}</div>
                      <span className="text-[10px] text-slate-400">{g.detailLokasi}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setEditingGangguan(g);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Edit Record Gangguan"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteGangguan(g.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Hapus Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Input Gangguan Modal */}
      <InputGangguanModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGangguan(null);
        }}
        onSave={onAddGangguan}
        penyulangList={penyulangList}
        sectionList={sectionList}
        editItem={editingGangguan}
      />
    </div>
  );
};
