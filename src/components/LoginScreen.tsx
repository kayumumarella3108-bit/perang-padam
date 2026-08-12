import React, { useState, useMemo } from 'react';
import { Shield, Eye, EyeOff, Lock, User as UserIcon, HardHat, Zap, Leaf, AlertTriangle, Sun, Wind, Activity, Sparkles } from 'lucide-react';
import { User } from '../types';
import { SocialContacts } from './SocialContacts';

interface LoginScreenProps {
  onLogin: (user: User) => void;
  onLoginSuccess?: () => void;
  usersList?: User[];
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onLoginSuccess, usersList = [] }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Dynamic daily K3 safety message updated per day
  const dailySafetyInfo = useMemo(() => {
    const today = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dayName = days[today.getDay()];
    const formattedDate = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    const messagesByDay: Record<number, string> = {
      0: "⚡ PIKET SIAGA MINGGU: Selalu Lakukan Grounding Lokal & Periksa Kelayakan APD Sebelum Manuver Jaringan 20kV ⚡",
      1: "⚡ SENIN SAFETY TALK: Wajib Gunakan APD Lengkap (Helm, Sepatu Safety, Sarung Tangan Tahan Tegangan 20kV & Body Harness) Sebelum Pekerjaan ⚡",
      2: "⚡ SELASA BEBAS BAHAYA LISTRIK: Gunakan Voltage Detector Untuk Memastikan Jaringan 20kV Bertegangan Nol Sebelum Sentuh Konduktor ⚡",
      3: "⚡ RABU INSPEKSI ALKER & APD: Rutin Cek Kondisi Kelayakan Tangga, Sarung Tangan Karet 20kV, dan Sabuk Pengaman ⚡",
      4: "⚡ KAMIS KESELAMATAN ROW POHON: Utamakan Jarak Aman minimal 2.5 Meter Dari Jaringan 20kV Saat Penebangan & Pemangkasan Ranting ⚡",
      5: "⚡ JUMAT K3 PEMELIHARAAN: Operasikan Fused Cut Out (FCO) & LBS Sesuai SOP Tanpa Beban & Pastikan Koordinasi Tim Jelas ⚡",
      6: "⚡ SABTU PENANGANAN GANGGUAN: Jaga Kewaspadaan & Komunikasi Tim Saat Pekerjaan Darurat Malam/Kondisi Hujan ⚡"
    };

    const tip = messagesByDay[today.getDay()] || messagesByDay[1];
    return {
      dayName,
      formattedDate,
      fullMessage: `[HARI ${dayName.toUpperCase()}, ${formattedDate.toUpperCase()}] ${tip} • ZERO ACCIDENT PLN ULP BAGUALA`
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim()) {
      setErrorMsg('Username tidak boleh kosong');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Password tidak boleh kosong');
      return;
    }

    // Match against registered users or fallback
    const matchedUser = usersList.find(
      (u) => (u.username || '').toLowerCase().trim() === (username || '').toLowerCase().trim()
    );

    if (matchedUser) {
      // Validate password if user has a password set
      if (matchedUser.password && matchedUser.password.trim() !== '' && matchedUser.password !== password) {
        setErrorMsg('Password salah! Periksa kembali password Anda.');
        return;
      }
      onLogin(matchedUser);
    } else {
      // Fallback user based on entered username
      const authenticatedUser: User = {
        username: username,
        name: `User ${username}`,
        role: username.includes('admin') ? 'Admin Teknik' : 'Koordinator',
        unit: 'ULP Baguala',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      };
      onLogin(authenticatedUser);
    }

    if (onLoginSuccess) onLoginSuccess();
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center text-slate-900 bg-slate-950 overflow-x-hidden font-sans">
      {/* Fullscreen EBT (Energi Baru Terbarukan) Atmospheric Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 scale-105 filter contrast-125"
        style={{
          backgroundImage: `radial-gradient(circle at center, rgba(6,78,59,0.3) 0%, rgba(2,6,23,0.95) 100%), url('https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=2000&auto=format&fit=crop')`
        }}
      />

      {/* Animated EBT Background Kincir Angin (Wind Turbines) Backdrop Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex justify-between items-end px-10 pb-0 opacity-25">
        {/* Left Side Wind Turbines */}
        <div className="hidden lg:flex items-end gap-12">
          {/* Large Turbine 1 */}
          <div className="flex flex-col items-center">
            <div className="animate-[spin_4s_linear_infinite] origin-center text-emerald-400 filter drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]">
              <svg className="w-32 h-32" viewBox="0 0 100 100" fill="currentColor">
                <circle cx="50" cy="50" r="7" fill="currentColor" />
                <path d="M50 50 L46 5 C48 0 52 0 54 5 L50 50 Z" />
                <path d="M50 50 L89 72 C93 70 95 66 91 63 L50 50 Z" fillOpacity="0.9" />
                <path d="M50 50 L11 72 C7 70 5 66 9 63 L50 50 Z" fillOpacity="0.9" />
              </svg>
            </div>
            <div className="w-2 h-48 bg-gradient-to-b from-emerald-400 via-slate-600 to-slate-900 rounded-b-md -mt-3" />
          </div>

          {/* Medium Turbine 2 */}
          <div className="flex flex-col items-center">
            <div className="animate-[spin_6s_linear_infinite] origin-center text-cyan-300 filter drop-shadow-[0_0_10px_rgba(34,211,238,0.7)]">
              <svg className="w-24 h-24" viewBox="0 0 100 100" fill="currentColor">
                <circle cx="50" cy="50" r="7" fill="currentColor" />
                <path d="M50 50 L46 5 C48 0 52 0 54 5 L50 50 Z" />
                <path d="M50 50 L89 72 C93 70 95 66 91 63 L50 50 Z" fillOpacity="0.9" />
                <path d="M50 50 L11 72 C7 70 5 66 9 63 L50 50 Z" fillOpacity="0.9" />
              </svg>
            </div>
            <div className="w-1.5 h-36 bg-gradient-to-b from-cyan-300 via-slate-600 to-slate-900 rounded-b-md -mt-2" />
          </div>
        </div>

        {/* Right Side Wind Turbines */}
        <div className="hidden lg:flex items-end gap-10">
          {/* Medium Turbine 3 */}
          <div className="flex flex-col items-center">
            <div className="animate-[spin_5s_linear_infinite] origin-center text-emerald-300 filter drop-shadow-[0_0_10px_rgba(52,211,153,0.7)]">
              <svg className="w-28 h-28" viewBox="0 0 100 100" fill="currentColor">
                <circle cx="50" cy="50" r="7" fill="currentColor" />
                <path d="M50 50 L46 5 C48 0 52 0 54 5 L50 50 Z" />
                <path d="M50 50 L89 72 C93 70 95 66 91 63 L50 50 Z" fillOpacity="0.9" />
                <path d="M50 50 L11 72 C7 70 5 66 9 63 L50 50 Z" fillOpacity="0.9" />
              </svg>
            </div>
            <div className="w-2 h-40 bg-gradient-to-b from-emerald-300 via-slate-600 to-slate-900 rounded-b-md -mt-2.5" />
          </div>

          {/* Large Turbine 4 */}
          <div className="flex flex-col items-center">
            <div className="animate-[spin_3.8s_linear_infinite] origin-center text-teal-400 filter drop-shadow-[0_0_12px_rgba(45,212,191,0.8)]">
              <svg className="w-36 h-36" viewBox="0 0 100 100" fill="currentColor">
                <circle cx="50" cy="50" r="7" fill="currentColor" />
                <path d="M50 50 L46 5 C48 0 52 0 54 5 L50 50 Z" />
                <path d="M50 50 L89 72 C93 70 95 66 91 63 L50 50 Z" fillOpacity="0.9" />
                <path d="M50 50 L11 72 C7 70 5 66 9 63 L50 50 Z" fillOpacity="0.9" />
              </svg>
            </div>
            <div className="w-2.5 h-56 bg-gradient-to-b from-teal-400 via-slate-600 to-slate-900 rounded-b-md -mt-3.5" />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-xl px-4 py-8 my-auto flex flex-col items-center text-center">
        
        {/* HardHat Icon & Support Badge */}
        <div className="mb-3 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-3 border border-emerald-400/40">
            <HardHat className="w-9 h-9 text-white stroke-[1.8]" />
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold backdrop-blur-md shadow-xs">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span>SISTEM EBT RE-GREEN 20kV</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-md shadow-xs">
              <Zap className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
              <span>Support by THE TUKIMEN</span>
            </div>
          </div>
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2 drop-shadow-md">
          Perang Padam Baguala
        </h1>
        <p className="text-xs md:text-sm text-slate-300 max-w-lg mb-4 leading-relaxed font-medium">
          Digitalisasi Monitoring PLN ULP Baguala
        </p>

        {/* Running Text Pesan Keselamatan Kerja K3 (Updated Daily) */}
        <div className="w-full max-w-xl mb-6 bg-gradient-to-r from-amber-500/20 via-slate-900/90 to-amber-500/20 border border-amber-500/40 rounded-2xl p-3 backdrop-blur-md text-amber-300 overflow-hidden text-xs font-bold shadow-xl">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold uppercase text-[10px] tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
              <span>PESAN KESELAMATAN K3 HARIAN ({dailySafetyInfo.dayName.toUpperCase()})</span>
            </div>
            <span className="text-[10px] text-amber-300/80 font-mono">
              {dailySafetyInfo.formattedDate}
            </span>
          </div>
          <div className="overflow-hidden whitespace-nowrap bg-slate-950/80 rounded-xl p-2 border border-amber-500/30">
            <div className="animate-marquee text-[11px] font-bold text-amber-200">
              {dailySafetyInfo.fullMessage}
            </div>
          </div>
        </div>

        {/* Centered Login Form Card */}
        <div className="w-full max-w-md bg-white/95 rounded-2xl p-7 shadow-2xl border border-emerald-500/20 backdrop-blur-md text-left">
          <div className="mb-4">
            <h2 className="text-base font-extrabold text-slate-900">Masuk Akun Sistem</h2>
            <p className="text-xs text-slate-500">Gunakan username dan password Anda</p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Username / User ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password..."
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 active:from-blue-800 active:to-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              Masuk Aplikasi
            </button>
          </form>

          {/* Bottom info text */}
          <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Keandalan 20kV Baguala</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <Leaf className="w-3 h-3" /> EBT Integrated
            </span>
          </div>
        </div>

        {/* Social Media Contact Cards */}
        <div className="w-full max-w-md mt-4">
          <SocialContacts variant="login" />
        </div>

        {/* Footer Slogans */}
        <div className="mt-8">
          <div className="flex items-center justify-center gap-2 text-blue-400 font-black tracking-wider text-xs uppercase">
            <Zap className="w-3.5 h-3.5 fill-blue-400" />
            <span>PANTANG PULANG SEBELUM TERANG</span>
            <Zap className="w-3.5 h-3.5 fill-blue-400" />
          </div>
        </div>
      </div>

      {/* Floating Bottom Left Badge */}
      <div className="relative z-10 w-full px-6 py-4 flex justify-between items-end pointer-events-none">
        <div className="pointer-events-auto inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-emerald-300 text-xs font-bold backdrop-blur-md shadow-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Leaf className="w-3.5 h-3.5 text-emerald-400" />
          <span>CLEAN GRID PLN ULP BAGUALA • SYSTEM OPERATIONAL 20kV</span>
        </div>
      </div>
    </div>
  );
};


