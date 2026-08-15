import React, { useState } from 'react';
import { Menu, Zap, Cloud, User, LogOut, ChevronDown, ShieldCheck, Search, Eye, AlertTriangle, X, MessageCircle, Send, Share2, Car, Sun, BatteryCharging } from 'lucide-react';
import { User as UserType, ViewType } from '../types';
import { canEditData } from '../utils/permissions';

interface TopHeaderProps {
  user: UserType;
  onLogout: () => void;
  activeView: ViewType;
  onSelectView: (view: ViewType) => void;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

const VIEW_NAMES: Record<ViewType, string> = {
  dashboard: 'Dashboard Utama Keandalan 20kV',
  spklu: 'Monitoring Lokasi SPKLU',
  peta_penyulang: 'Peta Penyulang GIS & Feeder',
  master_data: 'Master Data Penyulang',
  aset_jaringan: 'Aset Jaringan JTM / JTR',
  topologi_jaringan: 'Topologi Jaringan Feeder',
  health_index: 'Health Index Penyulang',
  matriks_gangguan: 'Gangguan Trip Feeder 20kV',
  row: 'Monitoring ROW (Pangkas Pohon)',
  inspeksi_tier1: 'Inspeksi Tier 1 (Simple)',
  inspeksi_tier1_jtm: 'Checklist JTM (Tier 1)',
  inspeksi_tier1_gtt: 'Checklist GTT (Tier 1)',
  inspeksi_tier1_switching: 'Checklist Switching (Tier 1)',
  inspeksi_tier2: 'Inspeksi Tier 2',
  inspeksi_tier2_thermovision: 'Checklist Thermovision (Tier 2)',
  inspeksi_tier2_ultrasound: 'Checklist Ultrasound (Tier 2)',
  pemeliharaan_20kv: 'Monitoring Pemeliharaan 20kV',
  perintah_kerja: 'Perintah Kerja Harian (SPK)',
  format_surat: 'Format Pembuatan Surat',
  pengukuran_gardu: 'Pengukuran & Beban Gardu',
  saidi_saifi: 'Realisasi SAIDI & SAIFI',
  estimasi_saidi_saifi: 'Estimasi SAIDI/SAIFI (Event)',
  alker_apd: 'Peralatan & Alker Yantek',
  material: 'Stok & Pemakaian Material',
  jadwal_piket: 'Jadwal Piket Petugas',
  kendaraan_operasional: 'Kendaraan Operasional',
  share_laporan: 'Share Laporan (WA & Telegram)',
  kelola_user: 'Kelola User & Hak Akses',
  peta: 'Peta Jaringan GIS',
  peta_pohon: 'Peta Pohon & ROW GIS 20kV',
  peta_konstruksi: 'Peta Konstruksi & Proyek GIS 20kV',
  gangguan: 'Log Gangguan Feeder',
  sld_visio: 'Single Line Diagram (SLD)'
};

export const TopHeader: React.FC<TopHeaderProps> = ({
  user,
  onLogout,
  activeView,
  onSelectView,
  sidebarOpen,
  onToggleSidebar
}) => {
  const isEditMode = canEditData(user);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? window.navigator.onLine : true);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateOnlineStatus = () => setIsOnline(window.navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  const activeViewTitle = VIEW_NAMES[activeView] || 'Sistem Monitoring PLN';

  // WhatsApp Share URL generator
  const getWhatsAppShareUrl = () => {
    const appUrl = typeof window !== 'undefined' ? window.location.href : '';
    const text = encodeURIComponent(
      `⚡ *PLN ULP BAGUALA - LAPORAN KEANDALAN 20KV*\n\n` +
      `📌 *Menu:* ${activeViewTitle}\n` +
      `👤 *Petugas:* ${user.name} (${user.role})\n` +
      `📅 *Tanggal:* ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}\n\n` +
      `🔗 *Buka Aplikasi:* ${appUrl}`
    );
    return `https://wa.me/?text=${text}`;
  };

  // Telegram Share URL generator
  const getTelegramShareUrl = () => {
    const appUrl = typeof window !== 'undefined' ? window.location.href : '';
    const text = encodeURIComponent(
      `⚡ PLN ULP BAGUALA - ${activeViewTitle}\nSistem Monitoring Keandalan 20kV`
    );
    return `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${text}`;
  };

  return (
    <header className="h-20 w-full bg-slate-950 border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between z-30 shrink-0 shadow-xl relative text-white">
      {/* Left section: Hamburger, PLN Logo, Title */}
      <div className="flex items-center gap-3 md:gap-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-3">
          {/* Logo representation matching Official PLN Blue & Gold lightning */}
          <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20 shrink-0">
            <Zap className="w-5 h-5 fill-slate-950 stroke-slate-950" />
          </div>

          <div>
            <h1 className="text-lg font-black text-white leading-none tracking-tight flex items-center gap-2">
              Perang Padam Baguala
            </h1>
            <span className="text-[11px] font-extrabold text-amber-400 tracking-wider uppercase block mt-1">
              PLN ULP BAGUALA • SISTEM KEANDALAN 20KV
            </span>
          </div>
        </div>
      </div>

      {/* Center Section: Wind Turbine (Kincir Angin) & Power Plant (Pembangkit Listrik) Visualization */}
      <div
        onClick={() => onSelectView && onSelectView('spklu')}
        className="hidden lg:flex items-center gap-3 px-4 py-1.5 rounded-2xl bg-slate-900/90 border border-emerald-500/40 hover:border-emerald-400 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer group hover:bg-slate-900"
        title="Klik untuk melihat SPKLU"
      >
        {/* Spinning Wind Turbine (Kincir Angin Realistis) */}
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 flex items-center justify-center">
            {/* Red Aviation Warning Beacon */}
            <div className="absolute top-1.5 w-1 h-1 rounded-full bg-rose-500 animate-ping z-20" />
            
            {/* Rotating Blades */}
            <div className="w-7 h-7 animate-[spin_3.5s_linear_infinite] origin-center text-emerald-400 filter drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] z-10">
              <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
                <circle cx="50" cy="50" r="7" fill="#34d399" />
                {/* Blade 1 */}
                <path d="M50 45 C47 25, 43 5, 49 1 C52 1, 54 5, 51 25 Z" />
                {/* Blade 2 */}
                <g transform="rotate(120 50 50)">
                  <path d="M50 45 C47 25, 43 5, 49 1 C52 1, 54 5, 51 25 Z" />
                </g>
                {/* Blade 3 */}
                <g transform="rotate(240 50 50)">
                  <path d="M50 45 C47 25, 43 5, 49 1 C52 1, 54 5, 51 25 Z" />
                </g>
              </svg>
            </div>

            {/* Turbine Tower Pole */}
            <div className="absolute bottom-0 w-1 h-4 bg-gradient-to-b from-slate-400 to-slate-800 rounded-b-xs" />
          </div>

          <div className="text-left">
            <span className="text-[9px] font-extrabold text-emerald-400 tracking-wider block uppercase leading-tight">
              KINCIR ANGIN
            </span>
            <span className="text-[10px] font-black text-white block leading-tight">
              PLTB EBT
            </span>
          </div>
        </div>

        {/* Transmission Power Cable with Flowing Electricity Animation */}
        <div className="flex items-center gap-1.5 px-1">
          <div className="w-3 h-0.5 bg-emerald-400/80 rounded-full" />
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shadow-[0_0_8px_#34d399]" />
          <div className="w-6 h-1 bg-slate-800 rounded-full overflow-hidden relative">
            <div className="w-3 h-full bg-gradient-to-r from-emerald-400 to-amber-300 rounded-full animate-[shimmer_1.2s_infinite]" />
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#fbbf24]" />
          <div className="w-3 h-0.5 bg-amber-400/80 rounded-full" />
        </div>

        {/* Pembangkit Listrik (Power Station / Substation Graphic) */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800 group-hover:border-amber-500/50 transition-colors">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Zap className="w-4 h-4 fill-amber-400 stroke-amber-400 animate-bounce" />
          </div>
          <div className="text-left">
            <span className="text-[9px] font-extrabold text-slate-400 block leading-tight uppercase">
              GRID SISTEM 20KV
            </span>
            <span className="text-[10px] font-black text-amber-300 block leading-tight">
              PEMBANGKIT LISTRIK
            </span>
          </div>
        </div>
      </div>

      {/* Right Section: Cloud status, User Profile & Mode Badge */}
      <div className="flex items-center gap-3">
        {/* Cloud Active Badge */}
        {isOnline ? (
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-bold">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Online</span>
          </div>
        ) : (
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Offline</span>
          </div>
        )}

        {/* User Profile & Role/Mode Badge */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="flex items-center gap-2.5">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user?.name || 'User'}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border-2 border-slate-700 shadow-sm"
              />
            ) : (
              <div className={`w-10 h-10 rounded-full border-2 border-slate-700 shadow-sm flex items-center justify-center font-extrabold text-xs ${
                isEditMode ? 'bg-emerald-500 text-slate-950' : 'bg-amber-400 text-slate-950'
              }`}>
                {user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
              </div>
            )}
            <div className="text-left hidden md:flex flex-col justify-center">
              <span className="text-[10px] font-medium text-slate-400 block leading-tight">
                Selamat datang,
              </span>
              <div className="text-xs font-black text-white flex items-center gap-1 leading-tight">
                {user?.name || 'User'}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-bold text-amber-400 uppercase leading-none">
                  {user?.role || 'Guest'}
                </span>
                {isEditMode ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold leading-none shadow-xs">
                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                    <span>Mode Edit</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-extrabold leading-none shadow-xs">
                    <Eye className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                    <span>Read-Only</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Keluar / Logout"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Modal Konfirmasi Keluar */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-left space-y-4 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Konfirmasi Keluar</h3>
              </div>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Apakah Anda yakin ingin keluar dari sistem Digitalisasi Monitoring PLN ULP Baguala?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmLogout}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-rose-600/20"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Ya, Keluar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};


