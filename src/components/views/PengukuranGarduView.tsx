import React, { useState } from 'react';
import {
  Activity,
  Building2,
  Plus,
  Search,
  Download,
  FileSpreadsheet,
  Trash2,
  Edit2,
  Zap,
  TrendingUp,
  PieChart,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Gauge,
  Sliders,
  Calendar,
  UserCheck,
  MapPin,
  Layers,
  ArrowUpDown,
  LineChart as LineChartIcon
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { PengukuranGardu, MasterGardu, Penyulang, User } from '../../types';
import { canEditData } from '../../utils/permissions';
import { MasterGarduModal } from '../modals/MasterGarduModal';
import { PengukuranGarduModal } from '../modals/PengukuranGarduModal';

interface PengukuranGarduViewProps {
  currentUser?: User | null;
  pengukuranList: PengukuranGardu[];
  masterGarduList: MasterGardu[];
  penyulangList: Penyulang[];
  onAddPengukuran: (pkg: PengukuranGardu) => void;
  onDeletePengukuran: (id: string) => void;
  onAddGardu: (g: MasterGardu) => void;
  onDeleteGardu: (id: string) => void;
}

export const PengukuranGarduView: React.FC<PengukuranGarduViewProps> = ({
  currentUser,
  pengukuranList,
  masterGarduList,
  penyulangList,
  onAddPengukuran,
  onDeletePengukuran,
  onAddGardu,
  onDeleteGardu
}) => {
  const [activeTab, setActiveTab] = useState<'pengukuran' | 'monitoring' | 'master_gardu' | 'tren_beban'>('pengukuran');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnit, setFilterUnit] = useState<string>('ALL');
  const [filterPenyulang, setFilterPenyulang] = useState<string>('ALL');
  const [filterStatusBeban, setFilterStatusBeban] = useState<string>('ALL');
  const [filterKeseimbangan, setFilterKeseimbangan] = useState<string>('ALL');

  // Modals state
  const [isPengukuranModalOpen, setIsPengukuranModalOpen] = useState(false);
  const [editingPengukuran, setEditingPengukuran] = useState<PengukuranGardu | null>(null);

  const [isGarduModalOpen, setIsGarduModalOpen] = useState(false);
  const [editingGardu, setEditingGardu] = useState<MasterGardu | null>(null);

  // Chart state
  const [selectedGarduChart, setSelectedGarduChart] = useState<string>('ALL');

  const canEdit = currentUser ? canEditData(currentUser) : true;

  // Helper calculations for a single Pengukuran record
  const calculateMetrics = (p: PengukuranGardu) => {
    const dayaKva = p.dayaKva || 160;
    // In = Daya(kVA) * 1000 / (sqrt(3) * 400)
    const iNominal = (dayaKva * 1000) / (Math.sqrt(3) * 400);
    const iMax = Math.max(p.iRTotal || 0, p.iSTotal || 0, p.iTTotal || 0);
    const iAvg = ((p.iRTotal || 0) + (p.iSTotal || 0) + (p.iTTotal || 0)) / 3;
    const vAvg = ((p.vRN || 220) + (p.vSN || 220) + (p.vTN || 220)) / 3;
    const pfAvg = ((p.tpfR || 0.92) + (p.tpfS || 0.92) + (p.tpfT || 0.92)) / 3;

    // Load Percentage
    const loadingPct = iNominal > 0 ? (iMax / iNominal) * 100 : 0;

    // Apparent & Active Power
    const dayaPakaiKva = (Math.sqrt(3) * vAvg * iAvg) / 1000;
    const dayaPakaiKw = dayaPakaiKva * pfAvg;

    // Status Beban Category
    let statusBebanGroup: 'Under Load' | 'Normal' | 'Overload' | 'Critical' = 'Normal';
    let statusBebanSub = '40%-60%';

    if (loadingPct === 0) {
      statusBebanGroup = 'Under Load';
      statusBebanSub = '0%';
    } else if (loadingPct > 0 && loadingPct <= 20) {
      statusBebanGroup = 'Under Load';
      statusBebanSub = '0%-20%';
    } else if (loadingPct > 20 && loadingPct <= 40) {
      statusBebanGroup = 'Under Load';
      statusBebanSub = '20%-40%';
    } else if (loadingPct > 40 && loadingPct <= 60) {
      statusBebanGroup = 'Normal';
      statusBebanSub = '40%-60%';
    } else if (loadingPct > 60 && loadingPct <= 80) {
      statusBebanGroup = 'Normal';
      statusBebanSub = '60%-80%';
    } else if (loadingPct > 80 && loadingPct <= 100) {
      statusBebanGroup = 'Overload';
      statusBebanSub = '80%-100%';
    } else {
      statusBebanGroup = 'Critical';
      statusBebanSub = '> 100%';
    }

    // Keseimbangan Beban (Unbalance %)
    const devR = Math.abs((p.iRTotal || 0) - iAvg);
    const devS = Math.abs((p.iSTotal || 0) - iAvg);
    const devT = Math.abs((p.iTTotal || 0) - iAvg);
    const maxDev = Math.max(devR, devS, devT);
    const unbalancePct = iAvg > 0 ? (maxDev / iAvg) * 100 : 0;

    const isSeimbang = unbalancePct < 10;

    return {
      iNominal,
      iMax,
      iAvg,
      vAvg,
      pfAvg,
      loadingPct,
      dayaPakaiKva,
      dayaPakaiKw,
      statusBebanGroup,
      statusBebanSub,
      unbalancePct,
      isSeimbang
    };
  };

  // Filter Pengukuran List
  const filteredPengukuran = pengukuranList.filter((p) => {
    const metrics = calculateMetrics(p);
    const matchesSearch =
      (p.noGardu || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.penyulang || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.petugas || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.unit || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.alamat || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesUnit = filterUnit === 'ALL' || (p.unit || 'ULP Baguala') === filterUnit;
    const matchesPenyulang = filterPenyulang === 'ALL' || p.penyulang === filterPenyulang;
    const matchesStatusBeban =
      filterStatusBeban === 'ALL' ||
      metrics.statusBebanGroup === filterStatusBeban ||
      metrics.statusBebanSub === filterStatusBeban;

    const matchesKeseimbangan =
      filterKeseimbangan === 'ALL' ||
      (filterKeseimbangan === 'SEIMBANG' && metrics.isSeimbang) ||
      (filterKeseimbangan === 'TIDAK_SEIMBANG' && !metrics.isSeimbang);

    return matchesSearch && matchesUnit && matchesPenyulang && matchesStatusBeban && matchesKeseimbangan;
  });

  // Filter Master Gardu
  const filteredGardu = masterGarduList.filter((g) => {
    const matchesSearch =
      (g.noGarduBaru || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.noGarduLama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.penyulang || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.unit || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.alamatGardu || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesUnit = filterUnit === 'ALL' || (g.unit || 'ULP Baguala') === filterUnit;
    const matchesPenyulang = filterPenyulang === 'ALL' || g.penyulang === filterPenyulang;

    return matchesSearch && matchesUnit && matchesPenyulang;
  });

  // Summary Counters for Analytics Dashboard
  const totalMeasurements = pengukuranList.length;
  let countUnder0 = 0, countUnder0_20 = 0, countUnder20_40 = 0;
  let countNormal40_60 = 0, countNormal60_80 = 0;
  let countOverload80_100 = 0;
  let countCriticalOver100 = 0;

  let countSeimbangUnder10 = 0;
  let countTidakSeimbangOver10 = 0;

  pengukuranList.forEach((p) => {
    const m = calculateMetrics(p);
    if (m.loadingPct === 0) countUnder0++;
    else if (m.loadingPct <= 20) countUnder0_20++;
    else if (m.loadingPct <= 40) countUnder20_40++;
    else if (m.loadingPct <= 60) countNormal40_60++;
    else if (m.loadingPct <= 80) countNormal60_80++;
    else if (m.loadingPct <= 100) countOverload80_100++;
    else countCriticalOver100++;

    if (m.isSeimbang) countSeimbangUnder10++;
    else countTidakSeimbangOver10++;
  });

  const handleExportPDF = () => {
    const doc = new jsPDF('landscape');
    doc.setFontSize(14);
    doc.text(`Data Gardu (${activeTab}) - PT PLN (Persero)`, 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);

    let headers: string[][] = [];
    let dataRows: any[][] = [];

    if (activeTab === 'pengukuran' || activeTab === 'monitoring') {
      headers = [
        ['No Gardu', 'Penyulang', 'Daya (kVA)', 'Tanggal Ukur', 'Status Beban', 'Loading %', 'Unbalance %', 'Keseimbangan']
      ];
      dataRows = pengukuranList.map((p) => {
        const m = calculateMetrics(p);
        return [
          p.noGardu,
          p.penyulang,
          p.dayaKva,
          p.tanggalUkur,
          `${m.statusBebanGroup} (${m.statusBebanSub})`,
          `${m.loadingPct.toFixed(1)}%`,
          `${m.unbalancePct.toFixed(1)}%`,
          m.isSeimbang ? 'Seimbang <10%' : 'Tidak Seimbang >=10%'
        ];
      });
    } else {
      headers = [
        ['Unit', 'No Gardu Lama', 'No Gardu Baru', 'Penyulang', 'Daya (kVA)', 'Fasa', 'Alamat']
      ];
      dataRows = masterGarduList.map((g) => [
        g.unit,
        g.noGarduLama,
        g.noGarduBaru,
        g.penyulang,
        g.daya,
        g.jumlahFasa,
        g.alamatGardu
      ]);
    }

    autoTable(doc, {
      head: headers,
      body: dataRows,
      startY: 28,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`Data_Gardu_${activeTab}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Export CSV Helper
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (activeTab === 'pengukuran' || activeTab === 'monitoring') {
      csvContent += "No Gardu,Penyulang,Daya (kVA),Tanggal Ukur,Petugas,I R,I S,I T,I N,V RN,V SN,V TN,Status Beban,Loading %,Unbalance %,Keseimbangan\n";
      pengukuranList.forEach((p) => {
        const m = calculateMetrics(p);
        csvContent += `"${p.noGardu}","${p.penyulang}",${p.dayaKva},"${p.tanggalUkur}","${p.petugas}",${p.iRTotal},${p.iSTotal},${p.iTTotal},${p.iNTotal},${p.vRN},${p.vSN},${p.vTN},"${m.statusBebanGroup} (${m.statusBebanSub})",${m.loadingPct.toFixed(1)}%,${m.unbalancePct.toFixed(1)}%,"${m.isSeimbang ? 'Seimbang <10%' : 'Tidak Seimbang >=10%'}"\n`;
      });
    } else {
      csvContent += "Unit,No Gardu Lama,No Gardu Baru,Alamat,Latt,Long,Ssotnumber,Penyulang,Daya (kVA),Jumlah Fasa\n";
      masterGarduList.forEach((g) => {
        csvContent += `"${g.unit}","${g.noGarduLama}","${g.noGarduBaru}","${g.alamatGardu}",${g.latt},${g.long},"${g.ssotNumber}","${g.penyulang}",${g.daya},"${g.jumlahFasa}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Data_Gardu_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // List of unique gardu numbers for the chart dropdown
  const uniqueGarduList = Array.from(new Set(pengukuranList.map(p => p.noGardu))).sort();

  // Selected gardu data for chart
  const chartData = selectedGarduChart !== 'ALL'
    ? pengukuranList
        .filter(p => p.noGardu === selectedGarduChart)
        .sort((a, b) => new Date(a.tanggalUkur).getTime() - new Date(b.tanggalUkur).getTime())
        .map(p => ({
          tanggal: p.tanggalUkur,
          'Arus R (A)': p.iRTotal || 0,
          'Arus S (A)': p.iSTotal || 0,
          'Arus T (A)': p.iTTotal || 0,
          'Arus N (A)': p.iNTotal || 0
        }))
    : [];

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-50 text-slate-900 font-sans min-h-screen">
      
      {/* Top Banner Header */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600/30 rounded-xl text-blue-400 border border-blue-500/30">
            <Gauge className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <span>PENGUKURAN & MONITORING BEBAN GARDU DISTRIBUSI</span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold border border-blue-500/30">
                ULP BAGUALA
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Kelola master data gardu, pengukuran arus/tegangan/THD/PF, serta monitoring status beban (Underload, Normal, Overload, Critical) & Keseimbangan Beban Trafo.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all border border-red-600 flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV / Excel</span>
          </button>

          {activeTab === 'master_gardu' ? (
            <button
              onClick={() => {
                setEditingGardu(null);
                setIsGarduModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Master Gardu</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingPengukuran(null);
                setIsPengukuranModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Input Pengukuran Gardu</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Header Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('pengukuran')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'pengukuran'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Histori Pengukuran Gardu ({pengukuranList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('monitoring')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'monitoring'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Monitoring Beban & Keseimbangan Trafo</span>
          </button>

          <button
            onClick={() => setActiveTab('master_gardu')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'master_gardu'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Master Data Gardu ({masterGarduList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tren_beban')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'tren_beban'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <LineChartIcon className="w-4 h-4" />
            <span>Tren Beban Gardu</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari gardu, penyulang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
          />
        </div>
      </div>

      {/* SUMMARY STATUS METRICS CARDS (Always visible for fast diagnosis) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Underload 0% */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Under 0%</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-black text-slate-700">{countUnder0}</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">Underload</span>
          </div>
        </div>

        {/* Underload 0-20% */}
        <div className="bg-white p-3 rounded-xl border border-sky-200 bg-sky-50/30 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-sky-800 uppercase">0% - 20%</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-black text-sky-700">{countUnder0_20}</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-sky-100 text-sky-800 rounded">Underload</span>
          </div>
        </div>

        {/* Underload 20-40% */}
        <div className="bg-white p-3 rounded-xl border border-cyan-200 bg-cyan-50/30 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-cyan-800 uppercase">20% - 40%</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-black text-cyan-700">{countUnder20_40}</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-cyan-100 text-cyan-800 rounded">Underload</span>
          </div>
        </div>

        {/* Normal 40-60% */}
        <div className="bg-white p-3 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-emerald-800 uppercase">40% - 60%</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-black text-emerald-700">{countNormal40_60}</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">Normal</span>
          </div>
        </div>

        {/* Normal 60-80% */}
        <div className="bg-white p-3 rounded-xl border border-teal-200 bg-teal-50/30 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-teal-800 uppercase">60% - 80%</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-black text-teal-700">{countNormal60_80}</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-teal-100 text-teal-800 rounded">Normal</span>
          </div>
        </div>

        {/* Overload 80-100% */}
        <div className="bg-white p-3 rounded-xl border border-amber-200 bg-amber-50/30 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-amber-800 uppercase">80% - 100%</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-black text-amber-700">{countOverload80_100}</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">Overload</span>
          </div>
        </div>

        {/* Critical >100% */}
        <div className="bg-white p-3 rounded-xl border border-rose-300 bg-rose-50/40 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-rose-800 uppercase">&gt; 100%</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-black text-rose-700">{countCriticalOver100}</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded">Critical</span>
          </div>
        </div>
      </div>

      {/* KESEIMBANGAN SUMMARY BADGES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-900">Beban Seimbang (&lt; 10%)</h4>
              <p className="text-[11px] text-emerald-700">Deviasi antar fasa dalam ambang batas aman standar PLN</p>
            </div>
          </div>
          <span className="text-2xl font-black text-emerald-800">{countSeimbangUnder10} Gardu</span>
        </div>

        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500 text-white rounded-xl shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-900">Tidak Seimbang (&ge; 10%)</h4>
              <p className="text-[11px] text-rose-700">Memerlukan penataan fasa / pemindahan beban antar jurusan</p>
            </div>
          </div>
          <span className="text-2xl font-black text-rose-800">{countTidakSeimbangOver10} Gardu</span>
        </div>
      </div>

      {/* TAB 1: HISTORI PENGUKURAN GARDU TABLE */}
      {activeTab === 'pengukuran' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Daftar Histori Pengukuran Gardu ({filteredPengukuran.length})</span>
            </h3>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={filterUnit}
                onChange={(e) => setFilterUnit(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-800"
              >
                <option value="ALL">Semua Unit PLN</option>
                <option value="ULP Baguala">ULP Baguala</option>
              </select>

              <select
                value={filterPenyulang}
                onChange={(e) => setFilterPenyulang(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-800"
              >
                <option value="ALL">Semua Penyulang</option>
                {penyulangList.map((p) => (
                  <option key={p.id} value={p.namaPenyulang}>{p.namaPenyulang}</option>
                ))}
              </select>

              <select
                value={filterStatusBeban}
                onChange={(e) => setFilterStatusBeban(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
              >
                <option value="ALL">Semua Status Beban</option>
                <option value="Under Load">Under Load (&le; 40%)</option>
                <option value="Normal">Normal (40% - 80%)</option>
                <option value="Overload">Overload (80% - 100%)</option>
                <option value="Critical">Critical (&gt; 100%)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-black tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">No. Gardu</th>
                  <th className="py-3 px-3">Tgl Ukur &amp; Petugas</th>
                  <th className="py-3 px-3">Penyulang &amp; Daya</th>
                  <th className="py-3 px-3 text-center bg-blue-50/50">I (R/S/T/N) Total</th>
                  <th className="py-3 px-3 text-center bg-emerald-50/50">V Phasa (R-N, S-N, T-N)</th>
                  <th className="py-3 px-3 text-center">Status Beban</th>
                  <th className="py-3 px-3 text-center">Keseimbangan</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {filteredPengukuran.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                      Tidak ada data pengukuran gardu ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredPengukuran.map((p) => {
                    const m = calculateMetrics(p);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-bold text-blue-900">
                          {p.noGardu}
                          <div className="text-[10px] font-normal text-slate-500 truncate max-w-[140px]">
                            {p.alamat || '-'}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{p.tanggalUkur}</div>
                          <div className="text-[10px] text-slate-500">{p.petugas}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-800">{p.penyulang}</span>
                          <div className="text-[10px] font-bold text-blue-700">{p.dayaKva} kVA</div>
                        </td>
                        <td className="py-3 px-3 bg-blue-50/30 text-center font-bold">
                          <span className="text-blue-700">{p.iRTotal}</span> / {' '}
                          <span className="text-yellow-700">{p.iSTotal}</span> / {' '}
                          <span className="text-rose-700">{p.iTTotal}</span> | {' '}
                          <span className="text-slate-600">N: {p.iNTotal}A</span>
                        </td>
                        <td className="py-3 px-3 bg-emerald-50/30 text-center font-medium">
                          {p.vRN}V / {p.vSN}V / {p.vTN}V
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              m.statusBebanGroup === 'Under Load'
                                ? 'bg-sky-100 text-sky-800 border border-sky-300'
                                : m.statusBebanGroup === 'Normal'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : m.statusBebanGroup === 'Overload'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}>
                              {m.statusBebanGroup} ({m.statusBebanSub})
                            </span>
                            <span className="text-[10px] font-bold text-slate-600 mt-0.5">
                              {m.loadingPct.toFixed(1)}% Loading
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            m.isSeimbang
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {m.isSeimbang ? 'Seimbang (<10%)' : 'Tidak Seimbang (≥10%)'}
                          </span>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Unbalance: {m.unbalancePct.toFixed(1)}%
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditingPengukuran(p);
                                setIsPengukuranModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus pengukuran gardu ${p.noGardu}?`)) {
                                  onDeletePengukuran(p.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MONITORING BEBAN & KESEIMBANGAN DETAILED DASHBOARD */}
      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-blue-600" />
                <span>Analisis Daya Pakai & Beban per Trafo Gardu</span>
              </h3>
              <p className="text-xs text-slate-500">
                Data terhitung secara real-time berdasarkan daya nominal kVA, pengukuran arus phasa, dan tegangan jaringan.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterKeseimbangan}
                onChange={(e) => setFilterKeseimbangan(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
              >
                <option value="ALL">Semua Keseimbangan</option>
                <option value="SEIMBANG">Seimbang (&lt; 10%)</option>
                <option value="TIDAK_SEIMBANG">Tidak Seimbang (&ge; 10%)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPengukuran.map((p) => {
              const m = calculateMetrics(p);
              return (
                <div
                  key={p.id}
                  className={`bg-white rounded-2xl p-5 border shadow-2xs space-y-4 transition-all ${
                    m.loadingPct > 100
                      ? 'border-rose-400 ring-2 ring-rose-500/20'
                      : m.loadingPct > 80
                      ? 'border-amber-300'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                        {p.penyulang}
                      </span>
                      <h4 className="text-base font-black text-slate-900">{p.noGardu}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{p.alamat || 'Baguala'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-800">{p.dayaKva} kVA</span>
                      <div className="text-[10px] text-slate-400">{p.tanggalUkur}</div>
                    </div>
                  </div>

                  {/* Meter Loading Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600">Persentase Loading Beban</span>
                      <span className={`${
                        m.loadingPct > 100 ? 'text-rose-600 font-black' : m.loadingPct > 80 ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {m.loadingPct.toFixed(1)}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
                      <div
                        className={`h-full rounded-full transition-all ${
                          m.loadingPct > 100
                            ? 'bg-rose-500'
                            : m.loadingPct > 80
                            ? 'bg-amber-500'
                            : m.loadingPct > 40
                            ? 'bg-emerald-500'
                            : 'bg-sky-500'
                        }`}
                        style={{ width: `${Math.min(m.loadingPct, 100)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[9px] text-slate-400 font-medium pt-0.5">
                      <span>0%</span>
                      <span>40% (Normal)</span>
                      <span>80% (Overload)</span>
                      <span>100%+</span>
                    </div>
                  </div>

                  {/* Calculated Power Metrics */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl text-xs">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-500">Daya Semu (kVA)</span>
                      <div className="font-extrabold text-slate-900">{m.dayaPakaiKva.toFixed(1)} kVA</div>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-500">Daya Aktif (kW)</span>
                      <div className="font-extrabold text-blue-700">{m.dayaPakaiKw.toFixed(1)} kW</div>
                    </div>
                  </div>

                  {/* Unbalance & Phase Current Breakdown */}
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">Keseimbangan Beban:</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        m.isSeimbang ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {m.unbalancePct.toFixed(1)}% ({m.isSeimbang ? 'Seimbang <10%' : 'Tidak Seimbang >=10%'})
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-bold">
                      <div className="bg-blue-50 p-1.5 rounded-lg text-blue-900">
                        <span className="block text-[8px] text-blue-600">Phase R</span>
                        {p.iRTotal} A
                      </div>
                      <div className="bg-yellow-50 p-1.5 rounded-lg text-yellow-900">
                        <span className="block text-[8px] text-yellow-600">Phase S</span>
                        {p.iSTotal} A
                      </div>
                      <div className="bg-rose-50 p-1.5 rounded-lg text-rose-900">
                        <span className="block text-[8px] text-rose-600">Phase T</span>
                        {p.iTTotal} A
                      </div>
                      <div className="bg-slate-100 p-1.5 rounded-lg text-slate-800">
                        <span className="block text-[8px] text-slate-500">Netral N</span>
                        {p.iNTotal} A
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: TREN BEBAN CHART */}
      {activeTab === 'tren_beban' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <LineChartIcon className="w-4 h-4 text-blue-600" />
              <span>Visualisasi Tren Beban (Ampere) per Gardu</span>
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Pilih Gardu:</span>
              <select
                value={selectedGarduChart}
                onChange={(e) => setSelectedGarduChart(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">-- Pilih Gardu --</option>
                {uniqueGarduList.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="p-4 md:p-6 bg-white min-h-[400px]">
            {selectedGarduChart === 'ALL' ? (
              <div className="h-[400px] flex items-center justify-center flex-col text-slate-500 gap-3 border-2 border-dashed border-slate-200 rounded-xl">
                <LineChartIcon className="w-12 h-12 text-slate-300" />
                <p className="text-sm font-semibold">Silakan pilih Gardu untuk melihat tren beban</p>
              </div>
            ) : chartData.length > 0 ? (
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="tanggal" 
                      tick={{fontSize: 11, fill: '#64748b'}} 
                      tickMargin={10} 
                      axisLine={{stroke: '#cbd5e1'}}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{fontSize: 11, fill: '#64748b'}} 
                      axisLine={false}
                      tickLine={false}
                      tickMargin={10}
                      label={{ value: 'Ampere (A)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12, fill: '#64748b' } }}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="Arus R (A)" stroke="#ef4444" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                    <Line type="monotone" dataKey="Arus S (A)" stroke="#eab308" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                    <Line type="monotone" dataKey="Arus T (A)" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                    <Line type="monotone" dataKey="Arus N (A)" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={{r: 4, strokeWidth: 2}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center flex-col text-slate-500 gap-3 border-2 border-dashed border-slate-200 rounded-xl">
                <AlertTriangle className="w-12 h-12 text-amber-400" />
                <p className="text-sm font-semibold">Data pengukuran tidak tersedia untuk gardu ini</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MASTER DATA GARDU TABLE */}
      {activeTab === 'master_gardu' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Master Data Gardu Distribusi ({filteredGardu.length})</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-black tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Unit</th>
                  <th className="py-3 px-3">No. Gardu (Lama / Baru)</th>
                  <th className="py-3 px-3">Alamat Gardu</th>
                  <th className="py-3 px-3">Koordinat (LATT, LONG)</th>
                  <th className="py-3 px-3">Ssotnumber</th>
                  <th className="py-3 px-3">Penyulang</th>
                  <th className="py-3 px-3">Daya &amp; Fasa</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {filteredGardu.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                      Tidak ada data master gardu ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredGardu.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-700">{g.unit}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-blue-900">{g.noGarduBaru}</div>
                        <div className="text-[10px] text-slate-400">Lama: {g.noGarduLama}</div>
                      </td>
                      <td className="py-3 px-3 max-w-[200px] truncate">{g.alamatGardu}</td>
                      <td className="py-3 px-3 text-[11px] font-mono text-slate-600">
                        {g.latt}, {g.long}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-700">{g.ssotNumber}</td>
                      <td className="py-3 px-3 font-bold text-slate-800">{g.penyulang}</td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-blue-700">{g.daya} kVA</span>
                        <div className="text-[10px] text-slate-500">{g.jumlahFasa}</div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingGardu(g);
                              setIsGarduModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus master gardu ${g.noGarduBaru}?`)) {
                                onDeleteGardu(g.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      )}

      {/* MODALS */}
      <MasterGarduModal
        isOpen={isGarduModalOpen}
        onClose={() => setIsGarduModalOpen(false)}
        onSave={onAddGardu}
        editingGardu={editingGardu}
        penyulangList={penyulangList}
      />

      <PengukuranGarduModal
        isOpen={isPengukuranModalOpen}
        onClose={() => setIsPengukuranModalOpen(false)}
        onSave={onAddPengukuran}
        editingPengukuran={editingPengukuran}
        masterGarduList={masterGarduList}
      />

    </div>
  );
};
