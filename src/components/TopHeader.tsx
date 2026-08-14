import React, { useState } from 'react';
import { Menu, Zap, Cloud, User, LogOut, ChevronDown, ShieldCheck, Search, Eye, AlertTriangle, X } from 'lucide-react';
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

export const TopHeader: React.FC<TopHeaderProps> = ({
  user,
  onLogout,
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

  return (
    <header className="h-16 w-full bg-white border-b border-slate-200 px-6 flex items-center justify-between z-30 shrink-0 shadow-sm relative">
      {/* Left section: Hamburger, PLN Logo, Title */}
      <div className="flex items-center gap-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-3">
          {/* Logo representation matching Professional Polish */}
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-md shadow-blue-500/20">
            <Zap className="w-5 h-5 fill-white stroke-white" />
          </div>

          <div>
            <h1 className="text-base font-extrabold text-slate-900 leading-none tracking-tight flex items-center gap-2">
              Perang Padam Baguala
            </h1>
            <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase block mt-1">
              PLN ULP BAGUALA • SISTEM KEANDALAN 20KV
            </span>
          </div>
        </div>
      </div>

      {/* Center Section: Mode Indicator Badge */}
      <div className="hidden lg:flex items-center gap-3">
        {isEditMode ? (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Mode Edit ({user.role})</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shadow-xs">
            <Eye className="w-4 h-4 text-amber-600" />
            <span>Mode Read-Only ({user.role})</span>
          </div>
        )}
      </div>

      {/* Right Section: Cloud status, User Profile, Logout */}
      <div className="flex items-center gap-3">
        {/* Cloud Active Badge */}
        {isOnline ? (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <Cloud className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sistem Terhubung</span>
            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black uppercase">Online</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-850 text-xs font-bold shadow-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <Cloud className="w-3.5 h-3.5 text-amber-600" />
            <span>Mode Cache Lokal</span>
            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-black uppercase">Offline</span>
          </div>
        )}

        {/* User Profile Badge */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover border-2 border-slate-200 shadow-xs"
              />
            ) : (
              <div className={`w-9 h-9 rounded-full border-2 border-white shadow-xs flex items-center justify-center font-extrabold text-xs ${
                isEditMode ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {user.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                {user.name}
                {isEditMode ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Eye className="w-3.5 h-3.5 text-amber-600" />
                )}
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                {user.role} {user.unit ? `• ${user.unit}` : ''}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-1 cursor-pointer"
            title="Keluar / Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal Konfirmasi Keluar */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-left space-y-4">
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

