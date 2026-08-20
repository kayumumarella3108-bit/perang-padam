import React, { useState } from 'react';
import { Menu, Zap, Cloud, User, LogOut, ChevronDown, ShieldCheck, Search, Eye, AlertTriangle, X, MessageCircle, Send, Share2, Car, Sun, BatteryCharging } from 'lucide-react';
import { User as UserType, ViewType } from '../types';
import { canEditData } from '../utils/permissions';
import { PLN_LOGO_BASE64 } from '../utils/plnLogo';

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
  survey_pb_pd: 'Survey Pasang Baru & Perubahan Daya (PB/PD)',
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
  sld_visio: 'SLD'
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
          {/* Logo official PLN matching SPK & PB PD documents */}
          <img
            src={PLN_LOGO_BASE64}
            alt="Logo PLN (Persero)"
            className="w-8 h-10 object-contain shrink-0 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
          />

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
              <div className="text-sm font-black text-white leading-tight">
                {user?.name || 'User'}
              </div>
              <div className="text-[11px] font-extrabold text-amber-400 leading-tight mt-0.5">
                {user?.nip || user?.phone || (user?.username ? (user.username.startsWith('@') ? user.username : `@${user.username}`) : '')}
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


