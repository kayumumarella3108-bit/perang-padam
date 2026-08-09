import React, { useState } from 'react';
import {
  BarChart3,
  Plus,
  Search,
  Download,
  FileSpreadsheet,
  FileText,
  DollarSign,
  Zap,
  Clock,
  TrendingDown,
  Trash2,
  Pencil
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
  Cell
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SaidiSaifiData, Penyulang, User } from '../../types';
import { HealthIndexBanner } from '../HealthIndexBanner';
import { InputSaidiModal } from '../modals/InputSaidiModal';
import { exportToCSV } from '../../utils/exportCsv';
import { canEditModule } from '../../utils/permissions';

interface SaidiSaifiViewProps {
  currentUser?: User;
  saidiList: SaidiSaifiData[];
  penyulangList: Penyulang[];
  onAddSaidi: (data: SaidiSaifiData) => void;
  onDeleteSaidi: (id: string) => void;
}

export const SaidiSaifiView: React.FC<SaidiSaifiViewProps> = ({
  currentUser,
  saidiList,
  penyulangList,
  onAddSaidi,
  onDeleteSaidi
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSaidi, setEditingSaidi] = useState<SaidiSaifiData | null>(null);
  const [selectedYear, setSelectedYear] = useState('2026');

  const handleExportCSV = () => {
    const headers = [
      'Bulan',
      'Tahun',
      'ENS (kWh)',
      'Target SAIDI',
      'Realisasi SAIDI',
      'Target SAIFI',
      'Realisasi SAIFI',
      'Estimasi Kerugian (Rp)',
      'Catatan'
    ];
    
    const rows = saidiList.map((s) => [
      s.bulan,
      s.tahun,
      s.ensKumulatifKwh,
      s.targetSaidi,
      s.realisasiSaidi,
      s.targetSaifi,
      s.realisasiSaifi,
      s.estimasiKerugianRp,
      s.catatan || ''
    ]);

    exportToCSV(`Realisasi_SAIDI_SAIFI_${selectedYear}`, headers, rows);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('PT PLN (PERSERO) - UL P BAGUALA / PLN NUSADAYA', 14, 15);
    doc.setFontSize(12);
    doc.text('LAPORAN REKAPITULASI SAIDI, SAIFI & ENS KUMULATIF (UP3 REPORTING)', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Tahun: ${selectedYear} | Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 28);
    doc.text(`Total ENS: ${totalEnsKwh.toLocaleString('id-ID')} kWh | Estimasi Kerugian: Rp ${totalRupiah.toLocaleString('id-ID')}`, 14, 34);
    doc.text(`Rata-rata SAIDI: ${avgSaidi} Jam/Plg | Rata-rata SAIFI: ${avgSaifi} Kali/Plg`, 14, 40);

    const headers = [
      ['Bulan', 'ENS (kWh)', 'Target SAIDI', 'Realisasi SAIDI', 'Target SAIFI', 'Realisasi SAIFI', 'Kerugian (Rp)', 'Catatan']
    ];

    const dataRows = saidiList.map(s => [
      s.bulan,
      s.ensKumulatifKwh.toLocaleString('id-ID'),
      s.targetSaidi,
      s.realisasiSaidi,
      s.targetSaifi,
      s.realisasiSaifi,
      s.estimasiKerugianRp.toLocaleString('id-ID'),
      s.catatan || '-'
    ]);

    autoTable(doc, {
      startY: 48,
      head: headers,
      body: dataRows,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59] },
      styles: { fontSize: 8, cellPadding: 2 }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.text('Mengetahui / Disetujui,', 14, finalY);
    doc.text('Manager ULP Baguala', 14, finalY + 5);
    doc.text('( ______________________ )', 14, finalY + 20);

    doc.text('Dilaporkan Kepada,', 130, finalY);
    doc.text('Pihak UP3 Ambon', 130, finalY + 5);
    doc.text('( ______________________ )', 130, finalY + 20);

    doc.save(`Laporan_SAIDI_SAIFI_UP3_${selectedYear}.pdf`);
  };

  // Sums
  const totalEnsKwh = saidiList.reduce((acc, curr) => acc + curr.ensKumulatifKwh, 0);
  const totalRupiah = saidiList.reduce((acc, curr) => acc + curr.estimasiKerugianRp, 0);
  const avgSaidi = saidiList.length > 0 ? (saidiList.reduce((acc, curr) => acc + curr.realisasiSaidi, 0) / saidiList.length).toFixed(3) : '0.000';
  const avgSaifi = saidiList.length > 0 ? (saidiList.reduce((acc, curr) => acc + curr.realisasiSaifi, 0) / saidiList.length).toFixed(3) : '0.000';

  // Chart Data
  const chartData = [
    { name: 'Januari', ens: 0, rupiah: 0 },
    { name: 'Februari', ens: 0, rupiah: 0 },
    { name: 'Maret', ens: 0, rupiah: 0 },
    { name: 'April', ens: 0, rupiah: 0 },
    { name: 'Mei', ens: 0, rupiah: 0 },
    { name: 'Juni', ens: 0, rupiah: 0 },
    { name: 'Juli', ens: totalEnsKwh, rupiah: totalRupiah / 1000000 }
  ];

  const pieData = [
    { name: 'Passo (40%)', value: 40, color: '#3b82f6' },
    { name: 'Tulehu (35%)', value: 35, color: '#10b981' },
    { name: 'Karpan (25%)', value: 25, color: '#f59e0b' }
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-50 text-slate-900 font-sans min-h-screen">
      
      {/* Banner */}
      <HealthIndexBanner
        totalCount={penyulangList.length}
        sempurnaCount={penyulangList.filter((p) => p.healthIndexStatus === 'Sempurna').length}
        sehatCount={penyulangList.filter((p) => p.healthIndexStatus === 'Sehat').length}
        sakitCount={penyulangList.filter((p) => p.healthIndexStatus === 'Sakit').length}
        kronisCount={penyulangList.filter((p) => p.healthIndexStatus === 'Kronis').length}
      />

      {/* Title Bar */}
      <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Monitoring SAIDI, SAIFI & ENS Kumulatif
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
              PLN ULP Baguala / PLN Nusadaya
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Kalkulasi kuantitatif energi tidak tersalurkan dan estimasi kerugian rupiah untuk UP3
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownloadPDF}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-rose-500/20"
            title="Unduh laporan PDF untuk dilaporkan ke UP3"
          >
            <FileText className="w-4 h-4" />
            <span>Unduh PDF (UP3)</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-emerald-500/20"
            title="Ekspor ke format Excel/CSV"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={() => {
              if (currentUser && !canEditModule(currentUser, 'saidi')) {
                alert('Akses Dibatasi: Admin Teknik hanya dapat entri & edit data untuk modul ROW dan Inspeksi.');
                return;
              }
              setEditingSaidi(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>+ Input SAIDI/SAIFI & ENS</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">KERUGIAN ENS (RUPIAH)</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            Rp {totalRupiah.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-slate-400">Hilang @ Rp 1.444,7/kWh</span>
        </div>

        <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-amber-600 tracking-wider">ENS KUMULATIF (KWH)</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">
            {totalEnsKwh.toLocaleString('id-ID')} <span className="text-xs font-semibold">kWh</span>
          </div>
          <span className="text-[11px] text-slate-400">Energi Tidak Tersalurkan</span>
        </div>

        <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">SAIDI KUMULATIF</span>
          <div className="text-2xl font-extrabold text-blue-600 mt-1">
            {avgSaidi} <span className="text-xs font-semibold">Jam/Plg</span>
          </div>
          <span className="text-[11px] text-slate-400">Rata-rata Durasi Padam</span>
        </div>

        <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-purple-600 tracking-wider">SAIFI KUMULATIF</span>
          <div className="text-2xl font-extrabold text-purple-600 mt-1">
            {avgSaifi} <span className="text-xs font-semibold">Kali/Plg</span>
          </div>
          <span className="text-[11px] text-slate-400">Rata-rata Frekuensi Padam</span>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 p-5 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Diagram Bar ENS Kumulatif per Penyulang (kWh & Juta Rp)
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                <Bar dataKey="ens" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Diagram Pie Kontribusi ENS (kWh)
          </h3>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            TABEL REALISASI SAIDI, SAIFI & ESTIMASI KERUGIAN ENS
          </h3>
          <span className="text-xs text-slate-400 font-medium">Tahun 2026</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Bulan</th>
                <th className="px-4 py-3.5 text-right">ENS (kWh)</th>
                <th className="px-4 py-3.5 text-right">Target SAIDI</th>
                <th className="px-4 py-3.5 text-right">Realisasi SAIDI</th>
                <th className="px-4 py-3.5 text-right">Target SAIFI</th>
                <th className="px-4 py-3.5 text-right">Realisasi SAIFI</th>
                <th className="px-4 py-3.5 text-right">Kerugian (Rupiah)</th>
                <th className="px-4 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {saidiList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    Belum ada rekapan SAIDI / SAIFI.
                  </td>
                </tr>
              ) : (
                saidiList.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900">{s.bulan} {s.tahun}</td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-amber-700">
                      {s.ensKumulatifKwh.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-500">{s.targetSaidi.toFixed(3)}</td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-blue-600">{s.realisasiSaidi.toFixed(3)}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-500">{s.targetSaifi.toFixed(3)}</td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-purple-600">{s.realisasiSaifi.toFixed(3)}</td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-700">
                      Rp {s.estimasiKerugianRp.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setEditingSaidi(s);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Edit SAIDI/SAIFI"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteSaidi(s.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Hapus SAIDI/SAIFI"
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

      <InputSaidiModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSaidi(null);
        }}
        onSave={onAddSaidi}
        editItem={editingSaidi}
      />
    </div>
  );
};
