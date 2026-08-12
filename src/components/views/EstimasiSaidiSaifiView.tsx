import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Calendar,
  Clock,
  Filter,
  Download,
  Printer,
  Search,
  Zap,
  TrendingUp,
  Users,
  AlertTriangle,
  Layers,
  ChevronDown,
  RefreshCw,
  FileSpreadsheet,
  Info
} from 'lucide-react';
import { GangguanLog, Penyulang, SectionJaringan, User } from '../../types';

interface EstimasiSaidiSaifiViewProps {
  currentUser?: User | null;
  gangguanList: GangguanLog[];
  penyulangList: Penyulang[];
  sectionList: SectionJaringan[];
  onSelectView?: (view: any) => void;
}

export const EstimasiSaidiSaifiView: React.FC<EstimasiSaidiSaifiViewProps> = ({
  currentUser,
  gangguanList,
  penyulangList,
  sectionList,
  onSelectView
}) => {
  // Filters
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedPenyulangId, setSelectedPenyulangId] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  // Calculate total ULP customers from Master Data
  const masterDataTotalUlp = useMemo(() => {
    const sumFromSections = sectionList.reduce(
      (acc, s) => acc + (s.jumlahPelanggan || 0),
      0
    );
    if (sumFromSections > 0) return sumFromSections;
    
    // Fallback: sum from penyulangList
    const sumFromPenyulang = penyulangList.reduce(
      (acc, p) => acc + (p.jumlahPelanggan || 0),
      0
    );
    return sumFromPenyulang > 0 ? sumFromPenyulang : 48524;
  }, [sectionList, penyulangList]);

  const [totalPelangganUlp, setTotalPelangganUlp] = useState<number>(48524);

  // Sync initial state when master data loads
  React.useEffect(() => {
    if (masterDataTotalUlp > 0) {
      setTotalPelangganUlp(masterDataTotalUlp);
    }
  }, [masterDataTotalUlp]);

  // Selected feeder customer calculation
  const selectedFeederInfo = useMemo(() => {
    if (selectedPenyulangId === 'all') return null;
    const p = penyulangList.find((item) => item.id === selectedPenyulangId);
    if (!p) return null;
    
    const fSections = sectionList.filter(
      (s) => s.penyulangId === p.id || s.namaPenyulang?.toLowerCase() === p.namaPenyulang?.toLowerCase()
    );
    const sumSecPlg = fSections.reduce((acc, curr) => acc + (curr.jumlahPelanggan || 0), 0);
    const totalPlgFeeder = p.jumlahPelanggan && p.jumlahPelanggan > 0 ? p.jumlahPelanggan : sumSecPlg;

    return {
      penyulang: p,
      sections: fSections,
      totalPlgFeeder
    };
  }, [selectedPenyulangId, penyulangList, sectionList]);

  // Helper to parse duration into minutes
  const parseDurasiMenit = (log: GangguanLog): number => {
    if (log.estimasiSaidiMenit && log.jumlahPelangganPadam && log.jumlahPelangganPadam > 0) {
      // If we saved durasi directly, we can derive or calculate
    }
    if (log.jamKeluar && log.jamMasuk) {
      try {
        const [hOut, mOut] = log.jamKeluar.split(':').map(Number);
        const [hIn, mIn] = log.jamMasuk.split(':').map(Number);
        let diffMinutes = (hIn * 60 + mIn) - (hOut * 60 + mOut);
        if (diffMinutes < 0) diffMinutes += 24 * 60;
        return diffMinutes;
      } catch {
        return 60;
      }
    }
    return 60;
  };

  // Helper to get customers for a log
  const getJumlahPelangganPadam = (log: GangguanLog): number => {
    if (log.jumlahPelangganPadam && log.jumlahPelangganPadam > 0) {
      return log.jumlahPelangganPadam;
    }
    // Lookup from sectionList
    if (log.section) {
      const matchSec = sectionList.find(
        (s) => s.namaSection.toLowerCase() === log.section.toLowerCase()
      );
      if (matchSec && matchSec.jumlahPelanggan) {
        return matchSec.jumlahPelanggan;
      }
    }
    // Default estimated value per section (~2,400 customers)
    return 2450;
  };

  // Filtered Gangguan Logs
  const filteredLogs = useMemo(() => {
    return gangguanList.filter((log) => {
      if (!log.tanggal) return false;
      const [year, monthStr] = log.tanggal.split('-');

      // Year filter
      if (selectedYear !== 'all' && year !== selectedYear) return false;

      // Month filter
      if (selectedMonth !== 'all') {
        const monthNum = parseInt(monthStr, 10);
        if (monthNum !== parseInt(selectedMonth, 10)) return false;
      }

      // Date range filter
      if (startDate && log.tanggal < startDate) return false;
      if (endDate && log.tanggal > endDate) return false;

      // Penyulang filter
      if (selectedPenyulangId !== 'all') {
        const selPenyulang = penyulangList.find((p) => p.id === selectedPenyulangId);
        if (selPenyulang) {
          if (
            log.penyulangId !== selectedPenyulangId &&
            log.namaPenyulang?.toLowerCase() !== selPenyulang.namaPenyulang.toLowerCase()
          ) {
            return false;
          }
        }
      }

      // Section filter
      if (selectedSection !== 'all' && log.section) {
        if (log.section.toLowerCase() !== selectedSection.toLowerCase()) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchFeeder = log.namaPenyulang?.toLowerCase().includes(q);
        const matchSec = log.section?.toLowerCase().includes(q);
        const matchLokasi = log.detailLokasi?.toLowerCase().includes(q);
        const matchPenyebab = log.penyebab?.toLowerCase().includes(q);
        const matchKode = log.kodeGangguan?.toLowerCase().includes(q);
        if (!matchFeeder && !matchSec && !matchLokasi && !matchPenyebab && !matchKode) {
          return false;
        }
      }

      return true;
    });
  }, [
    gangguanList,
    selectedYear,
    selectedMonth,
    startDate,
    endDate,
    selectedPenyulangId,
    selectedSection,
    searchQuery,
    penyulangList
  ]);

  // Calculations
  const metrics = useMemo(() => {
    let totalSaidiMenit = 0;
    let totalSaifi = 0;
    let totalPelangganPadamAccum = 0;
    let totalDurasiPadamMenit = 0;

    const safeUlp = totalPelangganUlp > 0 ? totalPelangganUlp : 48500;

    filteredLogs.forEach((log) => {
      const durasiMenit = parseDurasiMenit(log);
      const jmlPlg = getJumlahPelangganPadam(log);

      const eventSaifi = log.estimasiSaifi || jmlPlg / safeUlp;
      const eventSaidiMenit = log.estimasiSaidiMenit || (jmlPlg * durasiMenit) / safeUlp;

      totalSaidiMenit += eventSaidiMenit;
      totalSaifi += eventSaifi;
      totalPelangganPadamAccum += jmlPlg;
      totalDurasiPadamMenit += durasiMenit;
    });

    const totalSaidiJam = totalSaidiMenit / 60;
    const totalDurasiPadamJam = totalDurasiPadamMenit / 60;

    return {
      totalSaidiMenit,
      totalSaidiJam,
      totalSaifi,
      totalPelangganPadamAccum,
      totalDurasiPadamMenit,
      totalDurasiPadamJam,
      totalEvents: filteredLogs.length
    };
  }, [filteredLogs, totalPelangganUlp, sectionList]);

  // Group by Penyulang for Charts & Summary
  const feederBreakdown = useMemo(() => {
    const map: Record<
      string,
      {
        namaPenyulang: string;
        count: number;
        saidiMenit: number;
        saifi: number;
        pelangganPadam: number;
        durasiMenit: number;
      }
    > = {};

    const safeUlp = totalPelangganUlp > 0 ? totalPelangganUlp : 48500;

    filteredLogs.forEach((log) => {
      const name = log.namaPenyulang || 'Lainnya';
      if (!map[name]) {
        map[name] = {
          namaPenyulang: name,
          count: 0,
          saidiMenit: 0,
          saifi: 0,
          pelangganPadam: 0,
          durasiMenit: 0
        };
      }

      const durasiMenit = parseDurasiMenit(log);
      const jmlPlg = getJumlahPelangganPadam(log);
      const eventSaifi = log.estimasiSaifi || jmlPlg / safeUlp;
      const eventSaidiMenit = log.estimasiSaidiMenit || (jmlPlg * durasiMenit) / safeUlp;

      map[name].count += 1;
      map[name].saidiMenit += eventSaidiMenit;
      map[name].saifi += eventSaifi;
      map[name].pelangganPadam += jmlPlg;
      map[name].durasiMenit += durasiMenit;
    });

    return Object.values(map).sort((a, b) => b.saidiMenit - a.saidiMenit);
  }, [filteredLogs, totalPelangganUlp, sectionList]);

  // Section Breakdown
  const sectionBreakdown = useMemo(() => {
    const map: Record<
      string,
      {
        section: string;
        namaPenyulang: string;
        count: number;
        saidiMenit: number;
        pelangganPadam: number;
      }
    > = {};

    const safeUlp = totalPelangganUlp > 0 ? totalPelangganUlp : 48500;

    filteredLogs.forEach((log) => {
      const secName = log.section || 'General Section';
      if (!map[secName]) {
        map[secName] = {
          section: secName,
          namaPenyulang: log.namaPenyulang || '-',
          count: 0,
          saidiMenit: 0,
          pelangganPadam: 0
        };
      }

      const durasiMenit = parseDurasiMenit(log);
      const jmlPlg = getJumlahPelangganPadam(log);
      const eventSaidiMenit = log.estimasiSaidiMenit || (jmlPlg * durasiMenit) / safeUlp;

      map[secName].count += 1;
      map[secName].saidiMenit += eventSaidiMenit;
      map[secName].pelangganPadam += jmlPlg;
    });

    return Object.values(map).sort((a, b) => b.saidiMenit - a.saidiMenit);
  }, [filteredLogs, totalPelangganUlp]);

  // Print PDF Summary
  const handlePrintReport = () => {
    window.print();
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Tanggal',
      'Penyulang',
      'Section Padam',
      'Jam Out',
      'Jam In',
      'Durasi (Menit)',
      'Pelanggan Padam (Section)',
      'Total Pelanggan ULP',
      'Estimasi SAIDI (Menit/Plg)',
      'Estimasi SAIDI (Jam/Plg)',
      'Estimasi SAIFI (Kali/Plg)',
      'Penyebab',
      'Kode Gangguan',
      'Detail Lokasi'
    ];

    const safeUlp = totalPelangganUlp > 0 ? totalPelangganUlp : 48500;

    const rows = filteredLogs.map((log) => {
      const durasiMenit = parseDurasiMenit(log);
      const jmlPlg = getJumlahPelangganPadam(log);
      const eSaifi = log.estimasiSaifi || jmlPlg / safeUlp;
      const eSaidiM = log.estimasiSaidiMenit || (jmlPlg * durasiMenit) / safeUlp;
      const eSaidiJ = eSaidiM / 60;

      return [
        `"${log.tanggal || ''}"`,
        `"${log.namaPenyulang || ''}"`,
        `"${log.section || ''}"`,
        `"${log.jamKeluar || ''}"`,
        `"${log.jamMasuk || ''}"`,
        durasiMenit,
        jmlPlg,
        safeUlp,
        eSaidiM.toFixed(4),
        eSaidiJ.toFixed(5),
        eSaifi.toFixed(5),
        `"${log.penyebab || ''}"`,
        `"${log.kodeGangguan || ''}"`,
        `"${log.detailLokasi || ''}"`
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Estimasi_SAIDI_SAIFI_Event_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const monthsList = [
    { value: 'all', label: 'Semua Bulan' },
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' }
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 min-h-screen text-slate-800 font-sans print:bg-white print:p-0">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm print:border-none print:shadow-none">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-md shadow-blue-500/20 shrink-0">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Monitoring Estimasi SAIDI & SAIFI Gangguan
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-[10px] font-extrabold uppercase tracking-wide">
                Dedicated Per Event
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Kalkulasi estimasi indeks keandalan SAIDI & SAIFI berdasarkan data section padam & durasi gangguan trip pada setiap event. Monitoring ini <strong>terpisah dan terpisah independen</strong> dari SAIDI/SAIFI komulatif bulanan.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0 print:hidden">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan PDF</span>
          </button>
        </div>
      </div>

      {/* ISOLATION NOTICE BOX */}
      <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 text-xs shadow-xs print:hidden">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-extrabold text-amber-900">
            Penjelasan Metode Estimasi SAIDI / SAIFI Per Event & Section:
          </span>
          <p className="text-amber-800 leading-relaxed">
            • <strong>Rumus Estimasi SAIFI Event</strong> = <span className="font-mono bg-amber-100 px-1 py-0.5 rounded">Jumlah Pelanggan Padam Section / Total Pelanggan ULP</span><br />
            • <strong>Rumus Estimasi SAIDI Event</strong> = <span className="font-mono bg-amber-100 px-1 py-0.5 rounded">(Jumlah Pelanggan Padam Section × Durasi Padam Menit) / Total Pelanggan ULP</span><br />
            • Nilai ini dihitung langsung dari log input gangguan trip dan dikelompokkan per section padam tanpa mengubah nilai realisasi kumulatif SAIDI SAIFI ULP.
          </p>
        </div>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 print:hidden">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Filter Data Event Gangguan</span>
          </div>

          {/* Customer Base Setting */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl text-xs">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-600 font-semibold">Total Plg ULP (Master Data):</span>
            <input
              type="number"
              value={totalPelangganUlp}
              onChange={(e) => setTotalPelangganUlp(Number(e.target.value))}
              className="w-24 px-2 py-0.5 bg-white border border-slate-300 rounded text-center font-bold text-blue-700 focus:outline-none focus:border-blue-500"
            />
            {masterDataTotalUlp !== totalPelangganUlp && (
              <button
                onClick={() => setTotalPelangganUlp(masterDataTotalUlp)}
                className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer"
                title="Reset ke total ULP dari Master Data"
              >
                Sync Master ({masterDataTotalUlp.toLocaleString('id-ID')})
              </button>
            )}
          </div>
        </div>

        {selectedFeederInfo && (
          <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-extrabold text-[10px]">
                {selectedFeederInfo.penyulang.kodeId || 'FEEDER'}
              </span>
              <span className="font-bold text-blue-900">
                Penyulang {selectedFeederInfo.penyulang.namaPenyulang}
              </span>
              <span className="text-slate-500">
                ({selectedFeederInfo.sections.length} Section)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-blue-800">
                Total Pelanggan Feeder: <span className="font-mono text-blue-900">{selectedFeederInfo.totalPlgFeeder.toLocaleString('id-ID')}</span> Plg
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-600 text-[11px]">
                {((selectedFeederInfo.totalPlgFeeder / (totalPelangganUlp || 1)) * 100).toFixed(1)}% dari Total ULP
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
          {/* Filter Year */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Tahun</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Semua Tahun</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>

          {/* Filter Month */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Bulan</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 cursor-pointer"
            >
              {monthsList.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          {/* Filter Penyulang */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Penyulang</label>
            <select
              value={selectedPenyulangId}
              onChange={(e) => {
                setSelectedPenyulangId(e.target.value);
                setSelectedSection('all');
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Semua Penyulang</option>
              {penyulangList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.namaPenyulang}
                </option>
              ))}
            </select>
          </div>

          {/* Search Query */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Cari Keyword</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Lokasi / Kode..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Reset Filter Button */}
        {(selectedYear !== '2026' ||
          selectedMonth !== 'all' ||
          startDate ||
          endDate ||
          selectedPenyulangId !== 'all' ||
          selectedSection !== 'all' ||
          searchQuery) && (
          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                setSelectedYear('2026');
                setSelectedMonth('all');
                setStartDate('');
                setEndDate('');
                setSelectedPenyulangId('all');
                setSelectedSection('all');
                setSearchQuery('');
              }}
              className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* METRICS SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estimasi SAIDI Total */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Estimasi SAIDI Total
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {metrics.totalSaidiMenit.toFixed(3)}
            </span>
            <span className="text-xs font-bold text-blue-600">Menit/Plg</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>Setara Jam Padam:</span>
            <span className="font-bold text-slate-700">{metrics.totalSaidiJam.toFixed(4)} Jam/Plg</span>
          </div>
        </div>

        {/* Estimasi SAIFI Total */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Estimasi SAIFI Total
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {metrics.totalSaifi.toFixed(4)}
            </span>
            <span className="text-xs font-bold text-purple-600">Kali/Plg</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>Total Frekuensi Padam:</span>
            <span className="font-bold text-slate-700">{metrics.totalEvents} Event Trip</span>
          </div>
        </div>

        {/* Total Pelanggan Padam */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pelanggan Terdampak (Akumulasi)
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {metrics.totalPelangganPadamAccum.toLocaleString('id-ID')}
            </span>
            <span className="text-xs font-bold text-emerald-600">Pelanggan</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>Persentase ULP:</span>
            <span className="font-bold text-slate-700">
              {((metrics.totalPelangganPadamAccum / (totalPelangganUlp || 48500)) * 100).toFixed(1)}% Cum
            </span>
          </div>
        </div>

        {/* Total Durasi Padam */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Durasi Gangguan
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {metrics.totalDurasiPadamJam.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-rose-600">Jam Total</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>Total Menit Off:</span>
            <span className="font-bold text-slate-700">{metrics.totalDurasiPadamMenit.toLocaleString('id-ID')} Menit</span>
          </div>
        </div>
      </div>

      {/* FEEDER BREAKDOWN CHARTS & TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estimasi SAIDI per Penyulang */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Kontribusi Estimasi SAIDI per Penyulang
            </h3>
            <span className="text-xs text-slate-500 font-semibold">(Menit/Plg)</span>
          </div>

          <div className="space-y-3">
            {feederBreakdown.slice(0, 5).map((f, idx) => {
              const maxSaidi = feederBreakdown[0]?.saidiMenit || 1;
              const pct = Math.min(100, Math.max(8, (f.saidiMenit / maxSaidi) * 100));

              return (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      {f.namaPenyulang}
                    </span>
                    <span className="font-mono text-blue-700">
                      {f.saidiMenit.toFixed(3)} m/plg <span className="text-slate-400 font-normal">({f.count} trip)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {feederBreakdown.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs font-medium">
                Tidak ada data gangguan trip untuk filter terpilih.
              </div>
            )}
          </div>
        </div>

        {/* Section Breakdown Ranking */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              Top Section Padam dengan Estimasi SAIDI Terbesar
            </h3>
            <span className="text-xs text-slate-500 font-semibold">(Ranked)</span>
          </div>

          <div className="space-y-2.5">
            {sectionBreakdown.slice(0, 5).map((sec, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs hover:bg-white hover:border-purple-200 transition-all"
              >
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-extrabold">
                      #{idx + 1}
                    </span>
                    {sec.section}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Penyulang: {sec.namaPenyulang} • {sec.pelangganPadam.toLocaleString('id-ID')} Plg
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-purple-700 block text-sm">
                    {sec.saidiMenit.toFixed(3)}
                  </span>
                  <span className="text-[10px] text-slate-400">Menit/Plg</span>
                </div>
              </div>
            ))}

            {sectionBreakdown.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs font-medium">
                Belum ada data section padam.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DETAILED EVENT GANGGUAN TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-0">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="font-black text-slate-900 text-sm tracking-tight flex items-center gap-2">
              <Zap className="w-4 h-4 text-rose-600" />
              Log Rincian Event Gangguan Trip & Estimasi SAIDI SAIFI
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar seluruh event gangguan trip penyulang berserta kalkulasi per event
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs shrink-0">
            Total {filteredLogs.length} Event Log
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Tanggal & Jam</th>
                <th className="py-3 px-4">Penyulang & Section</th>
                <th className="py-3 px-4 text-center">Plg Padam (Sec)</th>
                <th className="py-3 px-4 text-center">Durasi Padam</th>
                <th className="py-3 px-4 text-right bg-blue-50/50 text-blue-900">Est. SAIDI (m/plg)</th>
                <th className="py-3 px-4 text-right bg-purple-50/50 text-purple-900">Est. SAIFI (kali/plg)</th>
                <th className="py-3 px-4">Penyebab & Kode</th>
                <th className="py-3 px-4">Detail Lokasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredLogs.map((log) => {
                const durasiMenit = parseDurasiMenit(log);
                const jmlPlg = getJumlahPelangganPadam(log);
                const safeUlp = totalPelangganUlp > 0 ? totalPelangganUlp : 48500;
                const eSaifi = log.estimasiSaifi || jmlPlg / safeUlp;
                const eSaidiM = log.estimasiSaidiMenit || (jmlPlg * durasiMenit) / safeUlp;
                const eSaidiJ = eSaidiM / 60;

                return (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Tanggal & Jam */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{log.tanggal}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {log.jamKeluar || '08:00'} - {log.jamMasuk || '09:30'}
                      </div>
                    </td>

                    {/* Penyulang & Section */}
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-blue-900">{log.namaPenyulang}</div>
                      <div className="text-[11px] text-slate-600 font-medium">
                        {log.section || '-'}
                      </div>
                    </td>

                    {/* Plg Padam */}
                    <td className="py-3 px-4 text-center font-bold text-slate-800">
                      <span className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200">
                        {jmlPlg.toLocaleString('id-ID')}
                      </span>
                    </td>

                    {/* Durasi Padam */}
                    <td className="py-3 px-4 text-center">
                      <span className="font-extrabold text-slate-900 block">{log.durasi || `${durasiMenit}m`}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({durasiMenit} menit)</span>
                    </td>

                    {/* Est SAIDI */}
                    <td className="py-3 px-4 text-right bg-blue-50/20 font-mono font-bold text-blue-700">
                      <div>{eSaidiM.toFixed(3)} <span className="text-[10px] font-normal text-slate-500">m/plg</span></div>
                      <div className="text-[10px] text-slate-400">({eSaidiJ.toFixed(4)} j/plg)</div>
                    </td>

                    {/* Est SAIFI */}
                    <td className="py-3 px-4 text-right bg-purple-50/20 font-mono font-bold text-purple-700">
                      <div>{eSaifi.toFixed(4)} <span className="text-[10px] font-normal text-slate-500">kali</span></div>
                    </td>

                    {/* Penyebab & Kode */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-[10px]">
                          {log.kodeGangguan || 'E-3'}
                        </span>
                        <span className="font-medium text-slate-700 truncate max-w-[140px]" title={log.penyebab}>
                          {log.penyebab || 'Gangguan Trip'}
                        </span>
                      </div>
                    </td>

                    {/* Detail Lokasi */}
                    <td className="py-3 px-4 text-slate-600 text-[11px] max-w-[180px] truncate" title={log.detailLokasi}>
                      {log.detailLokasi || '-'}
                    </td>
                  </tr>
                );
              })}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    Tidak ada data event log gangguan yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
