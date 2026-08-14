import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  MapPin,
  TrendingUp,
  Zap,
  Wrench,
  Trees,
  ClipboardList,
  Search,
  Factory,
  Database,
  BarChart3,
  Package,
  Shield,
  Users,
  GitGraph,
  ChevronDown,
  ChevronRight,
  Lock,
  FileText,
  Gauge,
  Car,
  Calendar,
  Thermometer,
  Network,
  Calculator,
  FolderTree,
  Activity,
  Layers,
  Sparkles,
  Share2,
  MessageCircle,
  Send,
  BatteryCharging
} from 'lucide-react';
import { ViewType, User } from '../types';
import { canManageUsers } from '../utils/permissions';
import { SocialContacts } from './SocialContacts';

interface SidebarProps {
  activeView: ViewType;
  onSelectView: (view: ViewType) => void;
  isOpen?: boolean;
  currentUser?: User | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  isOpen = true,
  currentUser
}) => {
  // Accordion open/close states
  const [pemeliharaanOpen, setPemeliharaanOpen] = useState(
    ['row', 'inspeksi_tier1', 'inspeksi_tier1_jtm', 'inspeksi_tier1_gtt', 'inspeksi_tier1_switching', 'inspeksi_tier2', 'inspeksi_tier2_thermovision', 'inspeksi_tier2_ultrasound', 'inspeksi_gardu', 'pemeliharaan_20kv'].includes(activeView)
  );

  const [suratSpkOpen, setSuratSpkOpen] = useState(
    ['perintah_kerja', 'format_surat'].includes(activeView)
  );

  const [masterAsetOpen, setMasterAsetOpen] = useState(
    ['master_data', 'aset_jaringan', 'topologi_jaringan'].includes(activeView)
  );

  const [saidiSaifiOpen, setSaidiSaifiOpen] = useState(
    ['saidi_saifi', 'estimasi_saidi_saifi'].includes(activeView)
  );

  const [monitoringYantekOpen, setMonitoringYantekOpen] = useState(
    ['alker_apd', 'material', 'jadwal_piket', 'kendaraan_operasional'].includes(activeView)
  );

  // Auto expand active accordion on activeView change
  useEffect(() => {
    if (['row', 'inspeksi_tier1', 'inspeksi_tier1_jtm', 'inspeksi_tier1_gtt', 'inspeksi_tier1_switching', 'inspeksi_tier2', 'inspeksi_tier2_thermovision', 'inspeksi_tier2_ultrasound', 'inspeksi_gardu', 'pemeliharaan_20kv'].includes(activeView)) {
      setPemeliharaanOpen(true);
    }
    if (['perintah_kerja', 'format_surat'].includes(activeView)) {
      setSuratSpkOpen(true);
    }
    if (['master_data', 'aset_jaringan', 'topologi_jaringan'].includes(activeView)) {
      setMasterAsetOpen(true);
    }
    if (['saidi_saifi', 'estimasi_saidi_saifi'].includes(activeView)) {
      setSaidiSaifiOpen(true);
    }
    if (['alker_apd', 'material', 'jadwal_piket', 'kendaraan_operasional'].includes(activeView)) {
      setMonitoringYantekOpen(true);
    }
  }, [activeView]);

  if (!isOpen) return null;

  const isPemeliharaanActive = ['row', 'inspeksi_tier1', 'inspeksi_tier1_jtm', 'inspeksi_tier1_gtt', 'inspeksi_tier1_switching', 'inspeksi_tier2', 'inspeksi_tier2_thermovision', 'inspeksi_tier2_ultrasound', 'inspeksi_gardu', 'pemeliharaan_20kv'].includes(activeView);
  const isSuratSpkActive = ['perintah_kerja', 'format_surat'].includes(activeView);
  const isMasterAsetActive = ['master_data', 'aset_jaringan', 'topologi_jaringan'].includes(activeView);
  const isSaidiSaifiActive = ['saidi_saifi', 'estimasi_saidi_saifi'].includes(activeView);
  const isMonitoringYantekActive = ['alker_apd', 'material', 'jadwal_piket', 'kendaraan_operasional'].includes(activeView);

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] text-slate-300 font-sans z-20 select-none overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between px-3 pt-2 pb-1">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-blue-400" />
            MENU SYSTEM
          </span>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Navigation List */}
        <nav className="space-y-1.5">
          {/* 1. Dashboard Utama */}
          <button
            onClick={() => onSelectView('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
              activeView === 'dashboard'
                ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="p-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg shrink-0">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <span>Dashboard Utama</span>
          </button>

          {/* 2. Peta Penyulang GIS */}
          <button
            onClick={() => onSelectView('peta_penyulang')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
              activeView === 'peta_penyulang'
                ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="p-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <span>Peta Penyulang GIS</span>
          </button>

          {/* 2b. SPKLU */}
          <button
            onClick={() => onSelectView('spklu')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
              activeView === 'spklu'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="p-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-between flex-1">
              <span>SPKLU</span>
            </div>
          </button>

          {/* 3. Master Data Aset Baguala (ACCORDION) */}
          <div>
            <button
              onClick={() => setMasterAsetOpen(!masterAsetOpen)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                isMasterAsetActive && !masterAsetOpen
                  ? 'bg-purple-600/15 text-purple-400 border border-purple-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <span>Master Data Aset Baguala</span>
              </div>
              <div>
                {masterAsetOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-purple-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </button>

            {masterAsetOpen && (
              <div className="pl-4 mt-1 space-y-1 border-l-2 border-purple-500/30 ml-5">
                <button
                  onClick={() => onSelectView('master_data')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                    activeView === 'master_data'
                      ? 'bg-purple-600/20 text-purple-300 font-extrabold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <FolderTree className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Master Data Penyulang</span>
                </button>

                <button
                  onClick={() => onSelectView('aset_jaringan')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                    activeView === 'aset_jaringan'
                      ? 'bg-purple-600/20 text-purple-300 font-extrabold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Network className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <span>Aset Jaringan JTM/JTR</span>
                </button>

                <button
                  onClick={() => onSelectView('topologi_jaringan')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                    activeView === 'topologi_jaringan'
                      ? 'bg-purple-600/20 text-purple-300 font-extrabold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <GitGraph className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Topologi Jaringan Feeder</span>
                </button>
              </div>
            )}
          </div>

          {/* 4. Health Index Penyulang */}
          <button
            onClick={() => onSelectView('health_index')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
              activeView === 'health_index'
                ? 'bg-cyan-600/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="p-1.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span>Health Index Penyulang</span>
          </button>

          {/* 5. Gangguan Trip Feeder */}
          <button
            onClick={() => onSelectView('matriks_gangguan')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
              activeView === 'matriks_gangguan'
                ? 'bg-amber-600/15 text-amber-400 border border-amber-500/30 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="p-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <span>Gangguan Trip Feeder</span>
          </button>

          {/* 6. Pemeliharaan 20kV (ACCORDION) */}
          <div>
            <button
              onClick={() => setPemeliharaanOpen(!pemeliharaanOpen)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                isPemeliharaanActive && !pemeliharaanOpen
                  ? 'bg-rose-600/15 text-rose-400 border border-rose-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg shrink-0">
                  <Wrench className="w-4 h-4" />
                </div>
                <span>Pemeliharaan 20kV</span>
              </div>
              <div>
                {pemeliharaanOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </button>

            {pemeliharaanOpen && (
              <div className="pl-4 mt-1 space-y-1 border-l-2 border-rose-500/30 ml-5">
                <button
                  onClick={() => onSelectView('row')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                    activeView === 'row'
                      ? 'bg-rose-600/20 text-rose-300 font-extrabold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Trees className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>ROW (Pangkas Pohon)</span>
                </button>

                <button
                  onClick={() => onSelectView('inspeksi_tier1')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                    activeView === 'inspeksi_tier1'
                      ? 'bg-rose-600/20 text-rose-300 font-extrabold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Inspeksi Tier 1 (Simple)</span>
                </button>

                <button
                  onClick={() => onSelectView('inspeksi_tier1_jtm')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                    activeView === 'inspeksi_tier1_jtm'
                      ? 'bg-rose-600/20 text-rose-300 font-extrabold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Checklist JTM (Tier 1)</span>
                </button>

                <button
                  onClick={() => onSelectView('inspeksi_tier1_gtt')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                    activeView === 'inspeksi_tier1_gtt'
                      ? 'bg-rose-600/20 text-rose-300 font-extrabold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Factory className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Checklist GTT (Tier 1)</span>
                </button>

                <button
                  onClick={() => onSelectView('inspeksi_tier1_switching')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                    activeView === 'inspeksi_tier1_switching'
                      ? 'bg-rose-600/20 text-rose-300 font-extrabold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <GitGraph className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Checklist Switching (Tier 1)</span>
                </button>

                <button
                  onClick={() => onSelectView('inspeksi_tier2')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                    activeView === 'inspeksi_tier2'
                      ? 'bg-rose-600/20 text-rose-300 font-extrabold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Search className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Inspeksi Tier 2</span>
                </button>

                <button
                  onClick={() => onSelectView('inspeksi_tier2_thermovision')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                    activeView === 'inspeksi_tier2_thermovision'
                      ? 'bg-rose-600/20 text-rose-300 font-extrabold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Thermometer className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>Checklist Thermovision (Tier 2)</span>
                </button>

                <button
                  onClick={() => onSelectView('inspeksi_tier2_ultrasound')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                    activeView === 'inspeksi_tier2_ultrasound'
                      ? 'bg-rose-600/20 text-rose-300 font-extrabold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Network className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Checklist Ultrasound (Tier 2)</span>
                </button>

                <button
                  onClick={() => onSelectView('pemeliharaan_20kv')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                    activeView === 'pemeliharaan_20kv'
                      ? 'bg-rose-600/20 text-rose-300 font-extrabold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Monitoring Pemeliharaan</span>
                </button>
              </div>
            )}
          </div>

          {/* 7. Format Surat & SPK (ACCORDION) */}
          <div>
            <button
              onClick={() => setSuratSpkOpen(!suratSpkOpen)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                isSuratSpkActive && !suratSpkOpen
                  ? 'bg-teal-600/15 text-teal-400 border border-teal-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-lg shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <span>Format Surat & SPK</span>
              </div>
              <div>
                {suratSpkOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-teal-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </button>

            {suratSpkOpen && (
              <div className="pl-4 mt-1 space-y-1 border-l-2 border-teal-500/30 ml-5">
                <button
                  onClick={() => onSelectView('perintah_kerja')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                    activeView === 'perintah_kerja'
                      ? 'bg-teal-600/20 text-teal-300 font-extrabold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Perintah Kerja Harian (SPK)</span>
                </button>

                <button
                  onClick={() => onSelectView('format_surat')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                    activeView === 'format_surat'
                      ? 'bg-teal-600/20 text-teal-300 font-extrabold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Format Pembuatan Surat</span>
                </button>
              </div>
            )}
          </div>

          {/* 8. Pengukuran & Beban Gardu */}
          <button
            onClick={() => onSelectView('pengukuran_gardu')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
              activeView === 'pengukuran_gardu'
                ? 'bg-orange-600/15 text-orange-400 border border-orange-500/30 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="p-1.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg shrink-0">
              <Gauge className="w-4 h-4" />
            </div>
            <span>Pengukuran & Beban Gardu</span>
          </button>

          {/* 9. Saidi Saifi (ACCORDION) */}
          <div>
            <button
              onClick={() => setSaidiSaifiOpen(!saidiSaifiOpen)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                isSaidiSaifiActive && !saidiSaifiOpen
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <span>Saidi Saifi</span>
              </div>
              <div>
                {saidiSaifiOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </button>

            {saidiSaifiOpen && (
              <div className="pl-4 mt-1 space-y-1 border-l-2 border-indigo-500/30 ml-5">
                <button
                  onClick={() => onSelectView('saidi_saifi')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                    activeView === 'saidi_saifi'
                      ? 'bg-indigo-600/20 text-indigo-300 font-extrabold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Realisasi SAIDI & SAIFI</span>
                </button>

                <button
                  onClick={() => onSelectView('estimasi_saidi_saifi')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                    activeView === 'estimasi_saidi_saifi'
                      ? 'bg-indigo-600/20 text-indigo-300 font-extrabold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Estimasi SAIDI/SAIFI (Event)</span>
                </button>
              </div>
            )}
          </div>

          {/* 10. Monitoring Yantek (ACCORDION) */}
          <div>
            <button
              onClick={() => setMonitoringYantekOpen(!monitoringYantekOpen)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                isMonitoringYantekActive && !monitoringYantekOpen
                  ? 'bg-sky-600/15 text-sky-400 border border-sky-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-lg shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <span>Monitoring Yantek</span>
              </div>
              <div>
                {monitoringYantekOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-sky-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </button>

            {monitoringYantekOpen && (
              <div className="pl-4 mt-1 space-y-1 border-l-2 border-sky-500/30 ml-5">
                <button
                  onClick={() => onSelectView('alker_apd')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                    activeView === 'alker_apd'
                      ? 'bg-sky-600/20 text-sky-300 font-extrabold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Peralatan & Alker Yantek</span>
                </button>

                <button
                  onClick={() => onSelectView('material')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                    activeView === 'material'
                      ? 'bg-sky-600/20 text-sky-300 font-extrabold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Package className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Stok & Pemakaian Material</span>
                </button>

                <button
                  onClick={() => onSelectView('jadwal_piket')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                    activeView === 'jadwal_piket'
                      ? 'bg-sky-600/20 text-sky-300 font-extrabold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Jadwal Piket Petugas</span>
                </button>

                <button
                  onClick={() => onSelectView('kendaraan_operasional')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                    activeView === 'kendaraan_operasional'
                      ? 'bg-sky-600/20 text-sky-300 font-extrabold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Car className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Kendaraan Operasional</span>
                </button>
              </div>
            )}
          </div>

          {/* 11. Share Laporan (WhatsApp Web & Telegram) */}
          <button
            onClick={() => onSelectView('share_laporan')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
              activeView === 'share_laporan'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg shrink-0">
                <Share2 className="w-4 h-4" />
              </div>
              <span>Share Laporan</span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase">
              WA & TG
            </span>
          </button>

          {/* 12. Kelola User & Hak Akses */}
          {(() => {
            const hasUserMgmtAccess = canManageUsers(currentUser);
            return (
              <button
                onClick={() => {
                  if (hasUserMgmtAccess) {
                    onSelectView('kelola_user');
                  }
                }}
                disabled={!hasUserMgmtAccess}
                title={
                  !hasUserMgmtAccess
                    ? `Menu Kelola User dinonaktifkan untuk role ${currentUser?.role || 'Admin Teknik'} (Khusus Koordinator)`
                    : 'Kelola User & Hak Akses'
                }
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  hasUserMgmtAccess
                    ? activeView === 'kelola_user'
                      ? 'bg-fuchsia-600/15 text-fuchsia-400 border border-fuchsia-500/30 shadow-sm cursor-pointer'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60 cursor-pointer'
                    : 'text-slate-600 bg-slate-950/20 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 rounded-lg shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <span>Kelola User & Hak Akses</span>
                </div>
                {!hasUserMgmtAccess && (
                  <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                )}
              </button>
            );
          })()}
        </nav>

        {/* Developer & Admin Social Contact Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 px-2">
          <SocialContacts variant="dark" />
        </div>
      </div>
    </aside>
  );
};
