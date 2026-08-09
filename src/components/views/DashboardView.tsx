import React, { useState } from 'react';
import {
  Zap,
  ClipboardList,
  Trees,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Activity,
  MapPin,
  Calendar,
  Layers,
  Wrench,
  ChevronRight,
  TrendingDown,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';
import {
  Penyulang,
  SectionJaringan,
  GangguanLog,
  ROWItem,
  InspeksiItem,
  SaidiSaifiData,
  ActivityLog,
  ViewType
} from '../../types';

interface DashboardViewProps {
  penyulangList: Penyulang[];
  sectionList: SectionJaringan[];
  gangguanList: GangguanLog[];
  rowList: ROWItem[];
  inspeksiList: InspeksiItem[];
  saidiList: SaidiSaifiData[];
  activities: ActivityLog[];
  onSelectView: (view: ViewType) => void;
  onOpenAddGangguan?: () => void;
  onOpenAddSaidi?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  penyulangList,
  sectionList,
  gangguanList,
  rowList,
  inspeksiList,
  saidiList,
  activities,
  onSelectView,
  onOpenAddGangguan,
  onOpenAddSaidi
}) => {
  const [activeTab, setActiveTab] = useState<'health' | 'gangguan' | 'row' | 'inspeksi'>('health');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'2026' | '2025'>('2026');

  // KPI calculations
  const totalPenyulang = penyulangList.length;
  const totalGangguan = gangguanList.length;
  const pendingROW = rowList.filter((r) => r.status === 'Perlu Pangkas');
  const highRiskROW = rowList.filter((r) => r.prioritas === 'Tinggi' || r.status === 'Perlu Pangkas');
  const pendingInspeksi = inspeksiList.filter((i) => i.kondisi === 'Berat' || i.kondisi === 'Sedang' || !i.kondisi);
  const criticalInspeksi = inspeksiList.filter((i) => i.kondisi === 'Berat');

  // Feeder Health Counts
  const sempurnaCount = penyulangList.filter((p) => p.healthIndexStatus === 'Sempurna').length;
  const sehatCount = penyulangList.filter((p) => p.healthIndexStatus === 'Sehat').length;
  const sakitCount = penyulangList.filter((p) => p.healthIndexStatus === 'Sakit').length;
  const kronisCount = penyulangList.filter((p) => p.healthIndexStatus === 'Kronis').length;

  // SAIDI & SAIFI Aggregations
  const totalEnsKwh = saidiList.reduce((acc, curr) => acc + (curr.ensKumulatifKwh || 0), 0);
  const totalRupiahLoss = saidiList.reduce((acc, curr) => acc + (curr.estimasiKerugianRp || 0), 0);
  
  const avgSaidiRealisasi = saidiList.length > 0
    ? (saidiList.reduce((acc, curr) => acc + curr.realisasiSaidi, 0) / saidiList.length).toFixed(3)
    : '0.085';
  const avgSaidiTarget = saidiList.length > 0
    ? (saidiList.reduce((acc, curr) => acc + curr.targetSaidi, 0) / saidiList.length).toFixed(3)
    : '0.200';

  const avgSaifiRealisasi = saidiList.length > 0
    ? (saidiList.reduce((acc, curr) => acc + curr.realisasiSaifi, 0) / saidiList.length).toFixed(3)
    : '0.022';
  const avgSaifiTarget = saidiList.length > 0
    ? (saidiList.reduce((acc, curr) => acc + curr.targetSaifi, 0) / saidiList.length).toFixed(3)
    : '0.050';

  // Monthly SAIDI / SAIFI Chart Data (incorporates real data + historical breakdown)
  const monthlySaidiData = [
    { bulan: 'Jan', targetSaidi: 0.20, realisasiSaidi: 0.085, targetSaifi: 0.05, realisasiSaifi: 0.022, ensKwh: 1240, kerugianRp: 1.79 },
    { bulan: 'Feb', targetSaidi: 0.20, realisasiSaidi: 0.062, targetSaifi: 0.05, realisasiSaifi: 0.018, ensKwh: 980, kerugianRp: 1.41 },
    { bulan: 'Mar', targetSaidi: 0.20, realisasiSaidi: 0.075, targetSaifi: 0.05, realisasiSaifi: 0.021, ensKwh: 1120, kerugianRp: 1.62 },
    { bulan: 'Apr', targetSaidi: 0.20, realisasiSaidi: 0.091, targetSaifi: 0.05, realisasiSaifi: 0.025, ensKwh: 1350, kerugianRp: 1.95 },
    { bulan: 'Mei', targetSaidi: 0.20, realisasiSaidi: 0.054, targetSaifi: 0.05, realisasiSaifi: 0.015, ensKwh: 820, kerugianRp: 1.18 },
    { bulan: 'Jun', targetSaidi: 0.20, realisasiSaidi: 0.048, targetSaifi: 0.05, realisasiSaifi: 0.012, ensKwh: 750, kerugianRp: 1.08 },
    { bulan: 'Jul', targetSaidi: 0.20, realisasiSaidi: Number(avgSaidiRealisasi), targetSaifi: 0.05, realisasiSaifi: Number(avgSaifiRealisasi), ensKwh: totalEnsKwh || 1240, kerugianRp: (totalRupiahLoss / 1000000) || 1.79 }
  ];

  // Dynamic monthly disturbance count calculation
  const monthsAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
  
  const monthlyGangguanData = monthsAbbr.map((month, idx) => {
    // Baseline for selected timeframe
    let baseline = 0;
    if (selectedTimeframe === '2026') {
      const baselines2026 = [2, 1, 3, 1, 2, 2, 1, 0, 0, 0, 0, 0];
      baseline = baselines2026[idx];
    } else {
      const baselines2025 = [4, 3, 5, 2, 4, 3, 5, 2, 3, 4, 2, 3];
      baseline = baselines2025[idx];
    }

    // Count user-added logs for this month and year
    const userAddedCount = gangguanList.filter((g) => {
      if (g.id === 'g1' || g.id === 'g2') return false; // exclude initial mock logs
      if (!g.tanggal) return false;
      const dateParts = g.tanggal.split('-');
      if (dateParts.length < 2) return false;
      const year = dateParts[0];
      const monthNum = parseInt(dateParts[1], 10);
      return year === selectedTimeframe && monthNum === (idx + 1);
    }).length;

    // Handle if g1 or g2 were deleted from the database
    const g1Exists = gangguanList.some(g => g.id === 'g1');
    const g2Exists = gangguanList.some(g => g.id === 'g2');
    let initialAdjustment = 0;
    if (selectedTimeframe === '2026') {
      if (idx === 0) { // Jan
        if (!g1Exists) initialAdjustment--;
        if (!g2Exists) initialAdjustment--;
      }
    }

    return {
      bulan: month,
      'Jumlah Trip': baseline + userAddedCount + initialAdjustment
    };
  });

  // Feeder Outage Contribution Data
  const feederOutagePieData = [
    { name: 'Tulehu', value: 42, color: '#2563eb' },
    { name: 'Lateri 2', value: 28, color: '#0284c7' },
    { name: 'Waiheru 2', value: 18, color: '#0d9488' },
    { name: 'Passo', value: 12, color: '#f59e0b' }
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-50 text-slate-900 font-sans min-h-screen">
      
      {/* Quick Action Bar & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-base font-black text-slate-900 tracking-tight">
            Dashboard Kinerja & Keandalan 20kV
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            PLN ULP Baguala • Sistem Keandalan 98.6%
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onSelectView('peta_penyulang')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Peta GIS Feeder</span>
          </button>

          <button
            onClick={() => {
              if (onOpenAddGangguan) onOpenAddGangguan();
              else onSelectView('matriks_gangguan');
            }}
            className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-rose-500/20 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>+ Input Gangguan</span>
          </button>

          <button
            onClick={() => {
              if (onOpenAddSaidi) onOpenAddSaidi();
              else onSelectView('saidi_saifi');
            }}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>+ Input SAIDI/SAIFI</span>
          </button>
        </div>
      </div>

      {/* 2. Top Executive KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Outages / Gangguan */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                TOTAL TRIP GANGGUAN
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900">{totalGangguan}</span>
                <span className="text-xs font-bold text-slate-500">kejadian (2026)</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600">
              <Zap className="w-5 h-5 fill-rose-600" />
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            <div className="flex justify-between items-center text-slate-600 font-medium">
              <span>Penyulang Terdampak:</span>
              <span className="font-bold text-slate-900">2 Feeder (Lateri 2 & Tulehu)</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 font-medium">
              <span>Relay Dominan:</span>
              <span className="font-bold text-amber-600">GFR / OCR (100%)</span>
            </div>
          </div>

          <button
            onClick={() => onSelectView('matriks_gangguan')}
            className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-blue-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <span>Detail Matriks Gangguan</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Pending Inspections */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                INSPEKSI & TEMUAN LAPANGAN
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900">{inspeksiList.length}</span>
                <span className="text-xs font-bold text-slate-500">lokasi terinspeksi</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            <div className="flex justify-between items-center text-slate-600 font-medium">
              <span>Temuan Kategori Berat:</span>
              <span className="font-bold text-rose-600">{criticalInspeksi.length} Lokasi</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 font-medium">
              <span>Tim Inspeksi Lapangan:</span>
              <span className="font-bold text-slate-900">Tim 1 & Tim 2 Active</span>
            </div>
          </div>

          <button
            onClick={() => onSelectView('inspeksi_tier1')}
            className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-blue-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <span>Lihat Daftar Inspeksi</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: High Risk ROW Areas */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                AREA ROW RAWAN POHON
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900">{highRiskROW.length}</span>
                <span className="text-xs font-bold text-slate-500">titik perlu pangkas</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600">
              <Trees className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            <div className="flex justify-between items-center text-slate-600 font-medium">
              <span>Total Pohon Dekat SUTM:</span>
              <span className="font-bold text-amber-600">{rowList.reduce((acc, r) => acc + r.jumlahPohon, 0)} Pohon</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 font-medium">
              <span>Prioritas Tinggi:</span>
              <span className="font-bold text-rose-600">{rowList.filter(r => r.prioritas === 'Tinggi').length} Titik Kritis</span>
            </div>
          </div>

          <button
            onClick={() => onSelectView('row')}
            className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-blue-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <span>Peta & Pangkas ROW</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 4: Kinerja SAIDI / SAIFI */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                KINERJA SAIDI / SAIFI
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-blue-700">{avgSaidiRealisasi}</span>
                <span className="text-xs font-bold text-slate-500">Jam/Plg</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            <div className="flex justify-between items-center text-slate-600 font-medium">
              <span>Target SAIDI Kumulatif:</span>
              <span className="font-bold text-slate-900">{avgSaidiTarget} Jam/Plg</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 font-medium">
              <span>Estimasi Kerugian ENS:</span>
              <span className="font-bold text-emerald-700">Rp {(totalRupiahLoss || 1792150).toLocaleString('id-ID')}</span>
            </div>
          </div>

          <button
            onClick={() => onSelectView('saidi_saifi')}
            className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-blue-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <span>Analisis SAIDI SAIFI</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Monthly Disturbance Trend Bar Chart Section */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Activity className="w-5 h-5 text-rose-600 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Tren Frekuensi Gangguan Bulanan (Overhead Trip Feeder)
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Monitoring jumlah pemadaman / trip pada jaringan SUTM 20kV PLN ULP Baguala periode tahun {selectedTimeframe}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-center">
            <span>Total Gangguan:</span>
            <span className="text-rose-600 font-extrabold text-sm">
              {monthlyGangguanData.reduce((acc, curr) => acc + curr['Jumlah Trip'], 0)}
            </span>
            <span>Kejadian</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Bar Chart (3 cols) */}
          <div className="lg:col-span-3">
            <div className="h-64 w-full bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyGangguanData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#cbd5e1', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    formatter={(val: any) => [`${val} Kali Trip`, 'Frekuensi Gangguan']}
                  />
                  <Bar dataKey="Jumlah Trip" name="Jumlah Gangguan" fill="#e11d48" radius={[6, 6, 0, 0]}>
                    {monthlyGangguanData.map((entry, index) => {
                      // Highlight months with high outage rates (e.g. >= 3)
                      const isHigh = entry['Jumlah Trip'] >= 3;
                      return <Cell key={`cell-${index}`} fill={isHigh ? '#be123c' : '#f43f5e'} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Insights Sidebar (1 col) */}
          <div className="flex flex-col justify-between p-4 bg-rose-50/40 rounded-2xl border border-rose-100/80 space-y-3">
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold text-rose-800 uppercase tracking-wider block">
                ANALISIS KEANDALAN SUTM
              </span>
              <p className="text-xs text-rose-950/80 leading-relaxed font-medium">
                Suhu udara tinggi dan angin kencang sering meningkatkan potensi gangguan dahan pohon pada penyulang utama **Tulehu** and **Lateri 2**.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-rose-200/50">
              <div className="flex justify-between items-center text-[11px] font-bold text-slate-700">
                <span>Rata-rata Gangguan:</span>
                <span className="text-rose-700 font-extrabold">
                  {(monthlyGangguanData.reduce((acc, curr) => acc + curr['Jumlah Trip'], 0) / 12).toFixed(1)} / Bln
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-bold text-slate-700">
                <span>Bulan Tertinggi (Peak):</span>
                <span className="text-rose-700 font-extrabold">
                  {monthlyGangguanData.reduce((max, curr) => curr['Jumlah Trip'] > max.val ? { name: curr.bulan, val: curr['Jumlah Trip'] } : max, { name: '-', val: -1 }).name}
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-rose-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="text-[10px] font-bold text-rose-800 leading-tight">
                Rencana aksi perbaikan pangkas pohon (ROW) dioptimalkan di bulan-bulan basah.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SAIDI & SAIFI Visualizations Section (Visualisasi SAIDI SAIFI) */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-6">
        
        {/* Section Title & Timeframe Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Visualisasi Trend Kinerja SAIDI, SAIFI & Energi Tidak Tersalurkan (ENS)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Perbandingan target kumulatif vs realisasi bulanan serta estimasi dampak finansial PLN ULP Baguala
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedTimeframe('2026')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedTimeframe === '2026'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Tahun 2026
            </button>
            <button
              onClick={() => setSelectedTimeframe('2025')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedTimeframe === '2025'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Tahun 2025
            </button>
          </div>
        </div>

        {/* Charts Grid: Left SAIDI SAIFI Bar Chart, Right Impact & Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Chart: SAIDI Realisasi vs Target (2 Cols) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Grafik Batang SAIDI & SAIFI Bulanan (Real vs Target)
              </h3>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                Dalam Batas Aman Target (&lt;0.200 Jam/Plg)
              </span>
            </div>

            <div className="h-72 w-full bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySaidiData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#cbd5e1', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    formatter={(val: any, name: any) => [
                      `${val} ${name.includes('Saidi') ? 'Jam/Plg' : 'Kali/Plg'}`,
                      name === 'realisasiSaidi' ? 'Realisasi SAIDI' : name === 'targetSaidi' ? 'Target SAIDI' : 'Realisasi SAIFI'
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="targetSaidi" name="Target SAIDI" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="realisasiSaidi" name="Realisasi SAIDI" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="realisasiSaifi" name="Realisasi SAIFI" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Chart: Feeder Outage Contribution Pie Chart & Target Gauge */}
          <div className="space-y-4">
            <div className="px-1">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <PieChart className="w-4 h-4 text-blue-600" />
                Kontribusi Gangguan Feeder
              </h3>
            </div>

            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-4">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={feederOutagePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {feederOutagePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: any) => [`${val}% Gangguan`, 'Kontribusi']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend list */}
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold pt-2 border-t border-slate-200">
                {feederOutagePieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span className="font-bold text-slate-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Budget Progress Meter */}
            <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-100 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-blue-900">
                <span>Kuota Batas SAIDI Terpakai:</span>
                <span className="text-blue-700 font-extrabold">42.5%</span>
              </div>
              <div className="w-full h-2.5 bg-blue-200/80 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full w-[42.5%]" />
              </div>
              <p className="text-[10px] text-blue-700/80 font-medium leading-tight">
                *Status Sangat Aman. Alokasi durasi pemadaman berada di bawah ambang batas toleransi kinerja ULP.
              </p>
            </div>
          </div>

        </div>

        {/* ENS & Financial Loss Area Chart */}
        <div className="pt-2">
          <div className="flex items-center justify-between px-1 mb-3">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Estimasi Kerugian Energi Tidak Tersalurkan (ENS kWh & Rp)
            </h3>
            <span className="text-xs font-bold text-slate-600">
              Tarif Listrik Asumsi: Rp 1.444,7 / kWh
            </span>
          </div>

          <div className="h-56 w-full bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySaidiData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRupiah" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#cbd5e1' }}
                  formatter={(val: any, name: any) => [
                    name === 'ensKwh' ? `${val} kWh` : `Rp ${val} Juta`,
                    name === 'ensKwh' ? 'ENS Kumulatif (kWh)' : 'Kerugian Financial (Rp Juta)'
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                <Area type="monotone" dataKey="ensKwh" name="ENS Kumulatif (kWh)" stroke="#10b981" fillOpacity={1} fill="url(#colorEns)" strokeWidth={2} />
                <Area type="monotone" dataKey="kerugianRp" name="Kerugian Financial (Rp Juta)" stroke="#2563eb" fillOpacity={1} fill="url(#colorRupiah)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 4. Interactive Tabs Section for Operational Lists */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        
        {/* Tab Headers */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('health')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'health'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Matriks Health Index ({penyulangList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('gangguan')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'gangguan'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Log Gangguan Terakhir ({gangguanList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('row')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'row'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Trees className="w-4 h-4" />
              <span>Area ROW Rawan ({pendingROW.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('inspeksi')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'inspeksi'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Temuan Inspeksi ({inspeksiList.length})</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Updated: <span className="font-bold text-slate-800">Hari Ini, 20:47</span>
          </div>
        </div>

        {/* TAB 1: Feeder Health Overview */}
        {activeTab === 'health' && (
          <div className="space-y-4">
            {/* Health Summary Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">Sempurna</span>
                  <span className="text-xl font-black text-emerald-900">{sempurnaCount} Feeder</span>
                </div>
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>

              <div className="p-3.5 bg-blue-50 border border-blue-200/80 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-blue-800 uppercase tracking-wider block">Sehat</span>
                  <span className="text-xl font-black text-blue-900">{sehatCount} Feeder</span>
                </div>
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block">Sakit</span>
                  <span className="text-xl font-black text-amber-900">{sakitCount} Feeder</span>
                </div>
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>

              <div className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-rose-800 uppercase tracking-wider block">Kronis</span>
                  <span className="text-xl font-black text-rose-900">{kronisCount} Feeder</span>
                </div>
                <XCircle className="w-6 h-6 text-rose-600" />
              </div>
            </div>

            {/* Top Priority Feeders Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3">Gardu Induk</th>
                    <th className="p-3">Nama Feeder</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Frekuensi Trip</th>
                    <th className="p-3">Section Rawan / Catatan</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {penyulangList.slice(0, 6).map((penyulang) => (
                    <tr key={penyulang.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-900">{penyulang.namaGi}</td>
                      <td className="p-3 font-extrabold text-blue-700">{penyulang.namaPenyulang} ({penyulang.kodeId})</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          penyulang.healthIndexStatus === 'Sempurna' ? 'bg-emerald-100 text-emerald-800' :
                          penyulang.healthIndexStatus === 'Sehat' ? 'bg-blue-100 text-blue-800' :
                          penyulang.healthIndexStatus === 'Sakit' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {penyulang.healthIndexStatus}
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold">{penyulang.frekuensiGangguan}x Trip</td>
                      <td className="p-3 text-slate-500 text-[11px] truncate max-w-xs">
                        {penyulang.sectionTerlama || 'Seluruh Jalur Normal'}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => onSelectView('health_index')}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Recent Outages Table */}
        {activeTab === 'gangguan' && (
          <div className="space-y-3">
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Feeder</th>
                    <th className="p-3">Section Terdampak</th>
                    <th className="p-3">Jam & Durasi</th>
                    <th className="p-3">Relay & Arus (R/S/T/IN)</th>
                    <th className="p-3">Penyebab / Kode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {gangguanList.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold whitespace-nowrap">{g.tanggal}</td>
                      <td className="p-3 font-extrabold text-blue-700 whitespace-nowrap">{g.namaPenyulang}</td>
                      <td className="p-3 text-slate-700 max-w-xs truncate">{g.section}</td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="font-bold">{g.jamKeluar} - {g.jamMasuk}</div>
                        <span className="text-[10px] text-rose-600 font-semibold">{g.durasi}</span>
                      </td>
                      <td className="p-3 text-[11px] font-mono whitespace-nowrap">
                        <span className="font-bold text-slate-900">{g.relayBekerja}</span>
                        <div className="text-slate-500">R:{g.arusR} A | S:{g.arusS} A | T:{g.arusT} A | IN:{g.arusIN} A</div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-extrabold text-[10px] border border-slate-200">
                          {g.kodeGangguan}
                        </span>
                        <div className="text-[11px] text-slate-500 mt-0.5">{g.penyebab}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: High Risk ROW Patrol */}
        {activeTab === 'row' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rowList.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                    Tiang {item.tiangId}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    item.prioritas === 'Tinggi' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                  }`}>
                    Prioritas {item.prioritas}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-black text-slate-900">{item.namaPenyulang}</h4>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">{item.lokasi}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Pohon:</span>
                    <span className="font-bold text-slate-900">{item.jenisPohon} ({item.jumlahPohon} Batang)</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Status Pangkas:</span>
                    <span className="font-bold text-amber-700">{item.status}</span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectView('row')}
                  className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Proses Pemangkasan ROW
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: Inspections */}
        {activeTab === 'inspeksi' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {inspeksiList.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold">
                    {item.tipe}: {item.tiangOrGarduId}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    item.kondisi === 'Berat' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                  }`}>
                    Kondisi {item.kondisi}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-black text-slate-900">{item.namaPenyulang}</h4>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">{item.lokasi}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                  <div className="text-slate-600">
                    <span>Temuan:</span>
                    <p className="font-bold text-slate-900 mt-0.5">{item.temuan}</p>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px] pt-1">
                    <span>Petugas: {item.petugas}</span>
                    <span>{item.tanggalInspeksi}</span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectView('inspeksi_tier1')}
                  className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Tindak Lanjut Perbaikan
                </button>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
