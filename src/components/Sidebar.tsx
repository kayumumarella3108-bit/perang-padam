import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  MapPin,
  Map,
  HardHat,
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
  BatteryCharging,
  Building2,
  Workflow,
  ShieldCheck,
  Target,
  Eye
} from 'lucide-react';
import { ViewType, User } from '../types';
import { canManageUsers, isPemasaranUser, isInspeksiUser, isPetugasRowUser, canAccessMenu, canEditData } from '../utils/permissions';
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
  const [inspeksiOpen, setInspeksiOpen] = useState(
    ['inspeksi_tier1', 'inspeksi_tier1_jtm', 'inspeksi_tier1_gtt', 'inspeksi_tier1_switching', 'inspeksi_tier2', 'inspeksi_tier2_thermovision', 'inspeksi_tier2_ultrasound', 'inspeksi_gardu'].includes(activeView)
  );

  const [suratSpkOpen, setSuratSpkOpen] = useState(
    ['perintah_kerja', 'format_surat'].includes(activeView)
  );

  const [saidiSaifiOpen, setSaidiSaifiOpen] = useState(
    ['saidi_saifi', 'estimasi_saidi_saifi'].includes(activeView)
  );

  const [monitoringYantekOpen, setMonitoringYantekOpen] = useState(
    ['alker_apd', 'material', 'jadwal_piket', 'kendaraan_operasional'].includes(activeView)
  );

  // Auto expand active accordion on activeView change
  useEffect(() => {
    if (['inspeksi_tier1', 'inspeksi_tier1_jtm', 'inspeksi_tier1_gtt', 'inspeksi_tier1_switching', 'inspeksi_tier2', 'inspeksi_tier2_thermovision', 'inspeksi_tier2_ultrasound', 'inspeksi_gardu'].includes(activeView)) {
      setInspeksiOpen(true);
    }
    if (['perintah_kerja', 'format_surat'].includes(activeView)) {
      setSuratSpkOpen(true);
    }
    if (['saidi_saifi', 'estimasi_saidi_saifi'].includes(activeView)) {
      setSaidiSaifiOpen(true);
    }
    if (['alker_apd', 'material', 'jadwal_piket', 'kendaraan_operasional'].includes(activeView)) {
      setMonitoringYantekOpen(true);
    }
  }, [activeView]);

  if (!isOpen) return null;

  const isInspeksiActive = ['inspeksi_tier1', 'inspeksi_tier1_jtm', 'inspeksi_tier1_gtt', 'inspeksi_tier1_switching', 'inspeksi_tier2', 'inspeksi_tier2_thermovision', 'inspeksi_tier2_ultrasound', 'inspeksi_gardu'].includes(activeView);
  const isSuratSpkActive = ['perintah_kerja', 'format_surat'].includes(activeView);
  const isMasterAsetActive = ['master_data', 'aset_jaringan', 'sld_visio'].includes(activeView);
  const isSaidiSaifiActive = ['saidi_saifi', 'estimasi_saidi_saifi'].includes(activeView);
  const isMonitoringYantekActive = ['alker_apd', 'material', 'jadwal_piket', 'kendaraan_operasional'].includes(activeView);

  const isPemasaran = isPemasaranUser(currentUser);
  const isInspeksi = isInspeksiUser(currentUser);
  const isRow = isPetugasRowUser(currentUser);

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] text-slate-300 font-sans z-20 select-none overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* User Authority Status Badge Header */}
        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              OTORITAS NAVIGASI
            </span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
            <span className="text-xs font-extrabold text-white truncate max-w-[130px]">
              {currentUser.role || 'Pengguna'}
            </span>
            {canEditData(currentUser) ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-extrabold">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Edit Data
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-extrabold">
                <Eye className="w-3 h-3 text-amber-400" />
                Read-Only
              </span>
            )}
          </div>
        </div>

        {/* FULL DYNAMIC NAVIGATION ACCORDING TO USER'S ALLOWED MENUS */}
        <nav className="space-y-1.5">
          {canAccessMenu(currentUser, 'dashboard') && (
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
          )}

          {canAccessMenu(currentUser, 'peta') && (
            <button
              onClick={() => onSelectView('peta_penyulang')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeView === 'peta_penyulang' || activeView === 'peta'
                  ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="p-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg shrink-0">
                <Map className="w-4 h-4" />
              </div>
              <span>Peta Penyulang</span>
            </button>
          )}

          {canAccessMenu(currentUser, 'master_data') && (
            <button
              onClick={() => onSelectView('master_data')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeView === 'master_data'
                  ? 'bg-purple-600/15 text-purple-400 border border-purple-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="p-1.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <span>Master Data Penyulang</span>
            </button>
          )}

          {canAccessMenu(currentUser, 'health_index') && (
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
          )}

          {/* 5. Gangguan Trip Feeder */}
          {canAccessMenu(currentUser, 'gangguan') && (
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
          )}

          {/* 6. Pemeliharaan 20kV (Monitoring) */}
          {canAccessMenu(currentUser, 'pemeliharaan') && (
            <button
              onClick={() => onSelectView('pemeliharaan_20kv')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeView === 'pemeliharaan_20kv'
                  ? 'bg-rose-600/15 text-rose-400 border border-rose-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="p-1.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg shrink-0">
                <Wrench className="w-4 h-4" />
              </div>
              <span>Monitoring Pemeliharaan</span>
            </button>
          )}

          {/* 7. Format Surat & SPK (ACCORDION) */}
          {canAccessMenu(currentUser, 'spk') && (
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
          )}

          {/* 8. Pengukuran & Beban Gardu */}
          {canAccessMenu(currentUser, 'pengukuran_gardu') && (
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
          )}

          {/* 9. Survey PB PD */}
          {canAccessMenu(currentUser, 'survey_pb_pd') && (
            <button
              onClick={() => onSelectView('survey_pb_pd')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeView === 'survey_pb_pd'
                  ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <span>Survey PB & PD</span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase">
                PB / PD
              </span>
            </button>
          )}

          {/* 10. Saidi Saifi (ACCORDION) */}
          {canAccessMenu(currentUser, 'saidi_saifi') && (
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
          )}



          {/* 13. Share Laporan (WhatsApp Web & Telegram) */}
          {canAccessMenu(currentUser, 'share_laporan') && (
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
          )}

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
