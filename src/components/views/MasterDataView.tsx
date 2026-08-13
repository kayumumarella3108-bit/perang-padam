import React, { useState } from 'react';
import {
  Database,
  Plus,
  Search,
  FileSpreadsheet,
  Download,
  FileText,
  Trash2,
  Edit2,
  History,
  Layers
} from 'lucide-react';
import { Penyulang, SectionJaringan, ActivityLog, MasterTab } from '../../types';
import { TambahPenyulangModal } from '../modals/TambahPenyulangModal';
import { TambahSectionModal } from '../modals/TambahSectionModal';
import { HealthIndexBanner } from '../HealthIndexBanner';

interface MasterDataViewProps {
  penyulangList: Penyulang[];
  sectionList: SectionJaringan[];
  activities: ActivityLog[];
  onAddPenyulang: (p: Penyulang) => void;
  onDeletePenyulang: (id: string) => void;
  onAddSection: (s: SectionJaringan) => void;
  onDeleteSection: (id: string) => void;
}

export const MasterDataView: React.FC<MasterDataViewProps> = ({
  penyulangList,
  sectionList,
  activities,
  onAddPenyulang,
  onDeletePenyulang,
  onAddSection,
  onDeleteSection
}) => {
  const [activeTab, setActiveTab] = useState<MasterTab>('penyulang');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPenyulangModalOpen, setIsPenyulangModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingPenyulang, setEditingPenyulang] = useState<Penyulang | null>(null);
  const [editingSection, setEditingSection] = useState<SectionJaringan | null>(null);

  // Filtered Penyulang
  const filteredPenyulang = penyulangList.filter((p) =>
    (p.namaPenyulang || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.namaGi || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.kodeId || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtered Sections
  const filteredSections = sectionList.filter((s) =>
    (s.namaSection || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.namaPenyulang || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtered Activities
  const filteredActivities = activities.filter((act) =>
    (act.user || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (act.aktivitas || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (act.modul || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {/* Tabs Header Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('penyulang')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'penyulang'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Master Penyulang ({penyulangList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('section')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'section'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Master Section ({sectionList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('log_aktivitas')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'log_aktivitas'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Log Aktivitas ({activities.length})</span>
        </button>
      </div>

      {/* TAB 1: MASTER PENYULANG */}
      {activeTab === 'penyulang' && (
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Master Data Penyulang
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar penyulang dan informasi panjang jaringan (KMS)
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Import Excel/CSV
              </button>
              <button className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm">
                <Download className="w-3.5 h-3.5" /> Excel
              </button>
              <button className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm">
                <FileText className="w-3.5 h-3.5" /> PDF
              </button>
              <button
                onClick={() => setIsPenyulangModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-blue-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>+ Penyulang Baru</span>
              </button>
            </div>
          </div>

          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama atau kode..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Nama GI</th>
                  <th className="px-4 py-3.5">Nama Penyulang</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5">Kode / ID</th>
                  <th className="px-4 py-3.5 text-right">Jml Pelanggan</th>
                  <th className="px-4 py-3.5 text-right">Panjang Jaringan</th>
                  <th className="px-4 py-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredPenyulang.map((p) => {
                  const feederSections = sectionList.filter(
                    (s) => s.penyulangId === p.id || s.namaPenyulang?.toLowerCase() === p.namaPenyulang?.toLowerCase()
                  );
                  const totalSectionPlg = feederSections.reduce(
                    (acc, curr) => acc + (curr.jumlahPelanggan || 0),
                    0
                  );
                  const totalPlg = p.jumlahPelanggan && p.jumlahPelanggan > 0 ? p.jumlahPelanggan : totalSectionPlg;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-amber-700">
                        <div>{p.namaGi}</div>
                        {p.penyulangUtama && (
                          <div className="text-[10px] text-slate-500 font-medium font-sans">
                            Utama: <span className="text-blue-700 font-bold">{p.penyulangUtama}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                        <span>{p.namaPenyulang}</span>
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">
                          {feederSections.length} Section
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          p.status === 'Utama' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-600">{p.kodeId}</td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-blue-700">
                        {totalPlg.toLocaleString('id-ID')} <span className="text-[10px] text-slate-400 font-normal">Plg</span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-700">
                        {p.panjangJaringanKms} <span className="text-[10px] text-slate-400 font-normal">KMS</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setEditingPenyulang(p);
                              setIsPenyulangModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                            title="Edit Penyulang"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeletePenyulang(p.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Hapus Penyulang"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MASTER SECTION */}
      {activeTab === 'section' && (
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Master Data Section
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar section dan jumlah pelanggan per section
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm">
                <Download className="w-3.5 h-3.5" /> Excel
              </button>
              <button className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm">
                <FileText className="w-3.5 h-3.5" /> PDF
              </button>
              <button
                onClick={() => setIsSectionModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-blue-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>+ Section Baru</span>
              </button>
            </div>
          </div>

          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan section, penyulang..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Nama Section</th>
                  <th className="px-4 py-3.5">Penyulang</th>
                  <th className="px-4 py-3.5 text-center">Jumlah Pelanggan</th>
                  <th className="px-4 py-3.5 text-center">Penyulang Di-Supply</th>
                  <th className="px-4 py-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredSections.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900">{s.namaSection}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px]">
                        {s.namaPenyulang}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold text-emerald-700">
                      👨‍👩‍👧 {s.jumlahPelanggan.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-bold text-[10px] uppercase">
                        {s.sistemOperasi}-{s.penyulangDiSupply}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setEditingSection(s);
                            setIsSectionModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Edit Section"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteSection(s.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Hapus Section"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LOG AKTIVITAS */}
      {activeTab === 'log_aktivitas' && (
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Log Aktivitas System Operational
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Audit trail histori perubahan data pengguna dan sistem
                </p>
              </div>
            </div>
          </div>

          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan user, aktivitas, modul..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Waktu</th>
                  <th className="px-4 py-3.5">User</th>
                  <th className="px-4 py-3.5">Detail Aktivitas</th>
                  <th className="px-4 py-3.5">Modul</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredActivities.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                      Belum ada data aktivitas yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  filteredActivities.map((act) => (
                    <tr key={act.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-slate-500 text-[11px]">{act.waktu}</td>
                      <td className="px-4 py-3.5 font-bold text-amber-700">{act.user}</td>
                      <td className="px-4 py-3.5 text-slate-900">{act.aktivitas}</td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                          {act.modul}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <TambahPenyulangModal
        isOpen={isPenyulangModalOpen}
        onClose={() => {
          setIsPenyulangModalOpen(false);
          setEditingPenyulang(null);
        }}
        onSave={onAddPenyulang}
        initialData={editingPenyulang}
        penyulangList={penyulangList}
      />

      <TambahSectionModal
        isOpen={isSectionModalOpen}
        onClose={() => {
          setIsSectionModalOpen(false);
          setEditingSection(null);
        }}
        onSave={onAddSection}
        penyulangList={penyulangList}
        initialData={editingSection}
      />
    </div>
  );
};
