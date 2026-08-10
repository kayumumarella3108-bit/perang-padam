import React, { useState } from 'react';
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
  Timer,
  Database,
  BarChart3,
  Package,
  Shield,
  Users,
  GitGraph,
  ChevronDown,
  ChevronRight,
  Leaf,
  Lock,
  FileText,
  Gauge,
  Car
} from 'lucide-react';
import { ViewType, User } from '../types';

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
  const [pemeliharaanOpen, setPemeliharaanOpen] = useState(
    ['row', 'inspeksi_tier1', 'inspeksi_tier2', 'inspeksi_gardu', 'pemeliharaan_20kv'].includes(activeView)
  );

  if (!isOpen) return null;

  const isPemeliharaanActive = ['row', 'inspeksi_tier1', 'inspeksi_tier2', 'inspeksi_gardu', 'pemeliharaan_20kv'].includes(activeView);

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] text-slate-300 font-sans z-20 select-none overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between px-3 pt-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            MENU SYSTEM
          </span>
          <div className="w-2 h-2 rounded-full bg-blue-500" />
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {/* Dashboard Utama */}
          <button
            onClick={() => onSelectView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
              activeView === 'dashboard'
                ? 'bg-blue-600/10 text-blue-400 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 shrink-0 ${activeView === 'dashboard' ? 'text-blue-400' : 'text-slate-400'}`} />
            <span>Dashboard Utama</span>
          </button>

          {/* Peta Penyulang Baguala */}
          <button
            onClick={() => onSelectView('peta_penyulang')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
              activeView === 'peta_penyulang'
                ? 'bg-blue-600/10 text-blue-400 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MapPin className={`w-4 h-4 shrink-0 ${activeView === 'peta_penyulang' ? 'text-blue-400' : 'text-slate-400'}`} />
            <span>Peta Penyulang GIS</span>
          </button>

          {/* Monitoring Healthy Index */}
          <button
            onClick={() => onSelectView('health_index')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
              activeView === 'health_index'
                ? 'bg-blue-600/10 text-blue-400 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className={`w-4 h-4 shrink-0 ${activeView === 'health_index' ? 'text-blue-400' : 'text-slate-400'}`} />
            <span>Health Index Penyulang</span>
          </button>

          {/* Gangguan & Trip */}
          <button
            onClick={() => onSelectView('matriks_gangguan')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
              activeView === 'matriks_gangguan'
                ? 'bg-blue-600/10 text-blue-400 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Zap className={`w-4 h-4 shrink-0 ${activeView === 'matriks_gangguan' ? 'text-amber-400' : 'text-slate-400'}`} />
            <span>Gangguan & Trip Feeder</span>
          </button>

          {/* Pemeliharaan 20kV Accordion */}
          <div>
            <button
              onClick={() => setPemeliharaanOpen(!pemeliharaanOpen)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                isPemeliharaanActive && !pemeliharaanOpen
                  ? 'bg-blue-600/10 text-blue-400 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Wrench className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Pemeliharaan 20kV</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold text-[9px]">
                  4 Sub
                </span>
                {pemeliharaanOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </button>

            {/* Sub-menu items */}
            {pemeliharaanOpen && (
              <div className="pl-4 mt-1 space-y-1 border-l border-slate-800 ml-4">
                <button
                  onClick={() => onSelectView('row')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                    activeView === 'row'
                      ? 'bg-blue-600/20 text-blue-400 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Trees className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ROW (Pangkas Pohon)</span>
                </button>

                <button
                  onClick={() => onSelectView('inspeksi_tier1')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                    activeView === 'inspeksi_tier1'
                      ? 'bg-blue-600/20 text-blue-400 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5 text-blue-400" />
                  <span>Inspeksi Tier 1</span>
                </button>

                <button
                  onClick={() => onSelectView('inspeksi_tier2')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                    activeView === 'inspeksi_tier2'
                      ? 'bg-blue-600/20 text-blue-400 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Search className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Inspeksi Tier 2</span>
                </button>

                <button
                  onClick={() => onSelectView('pemeliharaan_20kv')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                    activeView === 'pemeliharaan_20kv'
                      ? 'bg-blue-600/20 text-blue-400 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Monitoring Pemeliharaan</span>
                </button>
              </div>
            )}
          </div>

          {/* Perintah Kerja Harian (SPK) */}
          <button
            onClick={() => onSelectView('perintah_kerja')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
              activeView === 'perintah_kerja'
                ? 'bg-blue-600/10 text-blue-400 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className={`w-4 h-4 shrink-0 ${activeView === 'perintah_kerja' ? 'text-blue-400' : 'text-slate-400'}`} />
            <span>Perintah Kerja Harian (SPK)</span>
          </button>

          {/* Pengukuran & Beban Gardu */}
          <button
            onClick={() => onSelectView('pengukuran_gardu')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
              activeView === 'pengukuran_gardu'
                ? 'bg-blue-600/10 text-blue-400 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Gauge className={`w-4 h-4 shrink-0 ${activeView === 'pengukuran_gardu' ? 'text-blue-400' : 'text-slate-400'}`} />
            <span>Pengukuran & Beban Gardu</span>
          </button>

          {/* Master Data */}
          <button
            onClick={() => onSelectView('master_data')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
              activeView === 'master_data'
                ? 'bg-blue-600/10 text-blue-400 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Database className={`w-4 h-4 shrink-0 ${activeView === 'master_data' ? 'text-blue-400' : 'text-slate-400'}`} />
            <span>Master Data Penyulang</span>
          </button>

          {/* SAIDI / SAIFI */}
          <button
            onClick={() => onSelectView('saidi_saifi')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
              activeView === 'saidi_saifi'
                ? 'bg-blue-600/10 text-blue-400 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className={`w-4 h-4 shrink-0 ${activeView === 'saidi_saifi' ? 'text-blue-400' : 'text-slate-400'}`} />
            <span>Kinerja SAIDI / SAIFI</span>
          </button>

          {/* Manajemen Material */}
          <button
            onClick={() => onSelectView('material')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
              activeView === 'material'
                ? 'bg-blue-600/10 text-blue-400 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Package className={`w-4 h-4 shrink-0 ${activeView === 'material' ? 'text-blue-400' : 'text-slate-400'}`} />
            <span>Stok & Pemakaian Material</span>
          </button>

          {/* Alat Kerja dan APD */}
          <button
            onClick={() => onSelectView('alker_apd')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
              activeView === 'alker_apd'
                ? 'bg-blue-600/10 text-blue-400 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Shield className={`w-4 h-4 shrink-0 ${activeView === 'alker_apd' ? 'text-blue-400' : 'text-slate-400'}`} />
            <span>Alat Kerja & APD</span>
          </button>

          {/* Monitoring Kendaraan Operasional */}
          <button
            onClick={() => onSelectView('kendaraan_operasional')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
              activeView === 'kendaraan_operasional'
                ? 'bg-blue-600/10 text-blue-400 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Car className={`w-4 h-4 shrink-0 ${activeView === 'kendaraan_operasional' ? 'text-blue-400' : 'text-slate-400'}`} />
            <span>Kendaraan Operasional</span>
          </button>

          {/* Kelola User & Hak Akses */}
          <button
            onClick={() => {
              if (currentUser?.role === 'Koordinator') {
                onSelectView('kelola_user');
              }
            }}
            disabled={currentUser?.role !== 'Koordinator'}
            title={currentUser?.role !== 'Koordinator' ? 'Menu ini dinonaktifkan (Hanya untuk Koordinator)' : 'Kelola User & Hak Akses'}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
              currentUser?.role === 'Koordinator'
                ? activeView === 'kelola_user'
                  ? 'bg-blue-600/10 text-blue-400 font-bold cursor-pointer'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 cursor-pointer'
                : 'text-slate-600 bg-slate-950/20 opacity-40 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className={`w-4 h-4 shrink-0 ${activeView === 'kelola_user' && currentUser?.role === 'Koordinator' ? 'text-blue-400' : 'text-slate-500'}`} />
              <span>Kelola User & Hak Akses</span>
            </div>
            {currentUser?.role !== 'Koordinator' && (
              <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            )}
          </button>
        </nav>
      </div>
    </aside>
  );
};
