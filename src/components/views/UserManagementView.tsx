import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Search,
  Eye,
  Pencil,
  Trash2,
  Lock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus,
  X,
  Check,
  Building2,
  ArrowRight,
  LayoutDashboard,
  Wrench,
  FileText,
  Gauge,
  Zap,
  BarChart3,
  Share2,
  Key,
  Map,
  Database,
  TrendingUp
} from 'lucide-react';
import { User } from '../../types';
import { canEditData, canManageUsers, getRoleCategory } from '../../utils/permissions';

const getMenuBadgeProps = (menuId: string) => {
  switch (menuId) {
    case 'dashboard':
      return { label: 'Dashboard', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'peta':
      return { label: 'Peta Penyulang', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'master_data':
      return { label: 'Master Data', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
    case 'health_index':
      return { label: 'Health Index', bg: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
    case 'gangguan':
      return { label: 'Gangguan', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'pemeliharaan':
      return { label: 'Pemeliharaan', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
    case 'spk':
      return { label: 'Surat & SPK', bg: 'bg-teal-50 text-teal-700 border-teal-200' };
    case 'pengukuran_gardu':
      return { label: 'Beban Gardu', bg: 'bg-orange-50 text-orange-700 border-orange-200' };
    case 'survey_pb_pd':
      return { label: 'Survey PB/PD', bg: 'bg-yellow-50 text-yellow-800 border-yellow-200' };
    case 'saidi_saifi':
      return { label: 'SAIDI SAIFI', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    case 'monitoring_yantek':
      return { label: 'Yantek', bg: 'bg-sky-50 text-sky-700 border-sky-200' };
    case 'share_laporan':
      return { label: 'Share Laporan', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'kelola_user':
      return { label: 'Kelola User', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
    default:
      return { label: menuId, bg: 'bg-slate-50 text-slate-700 border-slate-200' };
  }
};

interface UserManagementViewProps {
  currentUser: User;
  usersList: User[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (idOrUsername: string) => void;
  onSwitchUserRole?: (user: User) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentUser,
  usersList,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onSwitchUserRole
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<string>('Koordinator');
  const [unit, setUnit] = useState('ULP Baguala');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [canAddUsers, setCanAddUsers] = useState(false);
  const [canEditDataVal, setCanEditDataVal] = useState(true);
  const [canViewDataOnly, setCanViewDataOnly] = useState(false);
  const [allowedMenus, setAllowedMenus] = useState<string[]>([]);
  const [formError, setFormError] = useState('');

  // Strict check: only Koordinator / System Admin can add/edit/delete users
  const canEdit = canManageUsers(currentUser);

  const PRESET_AVATARS = [
    { label: 'Teknisi 1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    { label: 'Engineer', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' },
    { label: 'Manager', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80' },
    { label: 'Staf Teknik', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    { label: 'Supervisor', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getMenuPresetsForRole = (roleName: string): string[] => {
    const roleLower = roleName.toLowerCase().trim();
    if (roleLower.includes('koordinator') || roleLower.includes('admin system') || roleLower.includes('admin aplikasi') || roleLower === 'admin') {
      return ['dashboard', 'gangguan', 'pemeliharaan', 'spk', 'pengukuran_gardu', 'survey_pb_pd', 'saidi_saifi', 'monitoring_yantek', 'share_laporan', 'kelola_user'];
    }
    if (roleLower.includes('pemasaran')) {
      return ['dashboard', 'survey_pb_pd'];
    }
    if (roleLower.includes('row') || roleLower.includes('inspeksi')) {
      return ['dashboard', 'pemeliharaan'];
    }
    if (roleLower.includes('teknik') || roleLower.includes('leader') || roleLower.includes('manager') || roleLower.includes('up3') || roleLower.includes('uiw') || roleLower.includes('nusadaya')) {
      return ['dashboard', 'gangguan', 'pemeliharaan', 'spk', 'pengukuran_gardu', 'survey_pb_pd', 'saidi_saifi', 'monitoring_yantek', 'share_laporan'];
    }
    return ['dashboard'];
  };

  const handleRoleChange = (selectedRole: string) => {
    setRole(selectedRole);
    // Automatically set default menus for this role, but user can still check/uncheck
    const presets = getMenuPresetsForRole(selectedRole);
    setAllowedMenus(presets);
    
    // Also set smart defaults for permissions check-buttons
    const isPowerUser = selectedRole.includes('Koordinator') || selectedRole.includes('Admin Aplikasi') || selectedRole.includes('Admin System');
    setCanAddUsers(isPowerUser);
    setCanEditDataVal(!selectedRole.includes('Manager') && !selectedRole.includes('UP3') && !selectedRole.includes('UIW'));
    setCanViewDataOnly(selectedRole.includes('Manager') || selectedRole.includes('UP3') || selectedRole.includes('UIW'));
  };

  const openAddModal = () => {
    setEditingUser(null);
    setUsername('');
    setName('');
    setRole('Koordinator');
    setUnit('ULP Baguala');
    setAvatarUrl('');
    setPassword('');
    setConfirmPassword('');
    setCanAddUsers(false);
    setCanEditDataVal(true);
    setCanViewDataOnly(false);
    setAllowedMenus(getMenuPresetsForRole('Koordinator'));
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setUsername(user.username);
    setName(user.name);
    setRole(user.role);
    setUnit(user.unit || 'ULP Baguala');
    setAvatarUrl(user.avatarUrl || '');
    setPassword(user.password || '');
    setConfirmPassword(user.password || '');
    setCanAddUsers(user.permissions?.canAddUsers || false);
    setCanEditDataVal(user.permissions?.canEditData || false);
    setCanViewDataOnly(user.permissions?.canViewDataOnly || false);
    setAllowedMenus(user.allowedMenus || getMenuPresetsForRole(user.role));
    setFormError('');
    setIsModalOpen(true);
  };

  const toggleMenuAllowed = (menuId: string) => {
    setAllowedMenus(prev => {
      if (prev.includes(menuId)) {
        return prev.filter(id => id !== menuId);
      } else {
        return [...prev, menuId];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!username.trim() || !name.trim()) {
      setFormError('Username dan Nama Lengkap wajib diisi.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Password dan Ulangi Password tidak cocok.');
      return;
    }

    // Determine default capabilities based on checked allowedMenus
    const editorVal = canEditDataVal;

    if (editingUser) {
      const updated: User = {
        ...editingUser,
        username: username.trim(),
        name: name.trim(),
        role: role as any,
        unit,
        avatarUrl,
        password,
        permissions: { 
          canAddUsers, 
          canEditData: editorVal, 
          canViewDataOnly: !editorVal 
        },
        allowedMenus: allowedMenus
      };
      onUpdateUser(updated);
    } else {
      const newUser: User = {
        id: `user_${Date.now()}`,
        username: username.trim(),
        name: name.trim(),
        role: role as any,
        unit,
        status: 'Aktif',
        avatarUrl,
        password,
        permissions: { 
          canAddUsers, 
          canEditData: editorVal, 
          canViewDataOnly: !editorVal 
        },
        allowedMenus: allowedMenus
      };
      onAddUser(newUser);
    }

    setIsModalOpen(false);
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesQuery =
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.unit && u.unit.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'Semua' || u.role === roleFilter;
    return matchesQuery && matchesRole;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-800">
      
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Kelola User & Hak Akses (RBAC)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Pengaturan hak akses entri data vs kelola user untuk Koordinator, Admin Teknik, Team Leader, Manager ULP, UP3, & UIW
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {canEdit && (
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Tambah User Baru</span>
          </button>
        )}
      </div>

      {/* Restriction Notice for non-Koordinator roles (e.g. Admin Teknik) */}
      {!canEdit && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-3.5 shadow-xs">
          <div className="p-2.5 bg-amber-500 text-white rounded-xl shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div className="text-xs leading-relaxed">
            <span className="font-extrabold text-amber-950 block text-sm mb-0.5">
              Akses Kelola User Dibatasi (Role: {currentUser?.role || 'Admin Teknik'})
            </span>
            Pengguna dengan Role <strong>{currentUser?.role || 'Admin Teknik'}</strong> dikhususkan untuk <strong>menginput & mengedit data operasional</strong> (gangguan, ROW, pemeliharaan, dll) dan <strong>tidak memiliki akses untuk membuat user baru atau mengelola user</strong>. Fitur pengelolaan user hanya dapat diakses oleh <strong>Koordinator</strong>.
          </div>
        </div>
      )}



      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Table Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari user, nama, unit..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          {/* Filter by Role */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Filter Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="Semua">Semua Role ({usersList.length})</option>
              <option value="Koordinator">Koordinator</option>
              <option value="Admin Teknik">Admin Teknik</option>
              <option value="Bagian Teknik">Bagian Teknik (Monitoring)</option>
              <option value="PLN Nusadaya">PLN Nusadaya (Monitoring)</option>
              <option value="Team Leader">Team Leader</option>
              <option value="Manager ULP">Manager ULP</option>
              <option value="UP3">UP3</option>
              <option value="UIW">UIW</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Nama Lengkap & Username</th>
                <th className="py-3.5 px-4">Role Jabatan</th>
                <th className="py-3.5 px-4">Unit Kerja</th>
                <th className="py-3.5 px-4">Kategori Hak Akses</th>
                <th className="py-3.5 px-4">Status</th>
                {canEdit && <th className="py-3.5 px-4 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada user ditemukan.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isEdit = canEditData(u);
                  const isCurrentUser = currentUser.username === u.username;

                  return (
                    <tr
                      key={u.id || u.username}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isCurrentUser ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      {/* Name & Username */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {u.avatarUrl ? (
                            <img
                              src={u.avatarUrl}
                              alt={u.name}
                              referrerPolicy="no-referrer"
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-xs shrink-0"
                            />
                          ) : (
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-xs shadow-xs shrink-0 ${
                              isEdit ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {u.name ? u.name.substring(0, 2).toUpperCase() : 'US'}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              {u.name}
                              {isCurrentUser && (
                                <span className="px-2 py-0.5 bg-blue-600 text-white rounded-md text-[9px] font-black uppercase">
                                  Anda
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 font-mono">
                              @{u.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {u.role}
                      </td>

                      {/* Unit */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{u.unit || 'ULP Baguala'}</span>
                        </div>
                      </td>

                      {/* Hak Akses Badge */}
                      <td className="py-3.5 px-4 max-w-[280px]">
                        <div className="space-y-1.5">
                          <div>
                            {isEdit ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-extrabold shadow-2xs">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                <span>Edit & Entri Data</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-extrabold shadow-2xs">
                                <Eye className="w-3 h-3 text-amber-600" />
                                <span>Monitoring Read-Only</span>
                              </span>
                            )}
                          </div>
                          
                          {/* List of checked menus as micro-pills */}
                          <div className="flex flex-wrap gap-1 max-w-[260px]">
                            {(() => {
                              const activeMenus = u.allowedMenus || getMenuPresetsForRole(u.role);
                              if (activeMenus.length === 0) {
                                return <span className="text-[10px] text-slate-400 italic">Tidak ada akses menu</span>;
                              }
                              return activeMenus.map((m) => {
                                const props = getMenuBadgeProps(m);
                                return (
                                  <span key={m} className={`inline-flex items-center px-1.5 py-0.5 rounded-md border text-[9px] font-bold ${props.bg}`}>
                                    {props.label}
                                  </span>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{u.status || 'Aktif'}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      {canEdit && (
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEditModal(u)}
                              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                              title="Edit Role User"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteUser(u.id || u.username)}
                              className="p-1.5 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Hapus User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    {editingUser ? 'Edit Hak Akses & Akun User' : 'Tambah User Baru'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Konfigurasi kredensial login, jabatan, dan hak akses menu yang dapat diakses pengguna
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col md:grid md:grid-cols-2 md:gap-8 md:space-y-0">
              
              {/* LEFT COLUMN: Account Information & Credentials */}
              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                    Informasi Akun & Jabatan
                  </h4>
                </div>

                {formError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Username */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 text-xs">
                    Username / ID Pengguna
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: koordinator_baguala"
                    required
                    disabled={!!editingUser}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all text-xs"
                  />
                  {!editingUser && (
                    <p className="text-[10px] text-slate-500 mt-1">Username bersifat unik dan tidak dapat diubah setelah dibuat.</p>
                  )}
                </div>

                {/* Nama Lengkap */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 text-xs">
                    Nama Lengkap / Nama Petugas
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Bpk. Ahmad Fauzi"
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 transition-all text-xs"
                  />
                </div>

                {/* Grid for Jabatan & Unit */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Role Jabatan */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5 text-xs">
                      Jabatan / Otoritas
                    </label>
                    <select
                      value={role}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 cursor-pointer text-xs"
                    >
                      <option value="Admin Aplikasi">Admin Aplikasi</option>
                      <option value="Koordinator">Koordinator</option>
                      <option value="Admin Teknik">Admin Teknik</option>
                      <option value="Bagian Pemasaran">Bagian Pemasaran</option>
                      <option value="Bagian Transaksi Energi">Bagian Transaksi Energi</option>
                      <option value="Petugas Inspeksi">Petugas Inspeksi</option>
                      <option value="Petugas ROW">Petugas ROW</option>
                      <option value="Bagian Teknik">Bagian Teknik</option>
                      <option value="PLN Nusadaya">PLN Nusadaya</option>
                      <option value="Team Leader">Team Leader</option>
                      <option value="Manager ULP">Manager ULP</option>
                      <option value="UP3">UP3</option>
                      <option value="UIW">UIW</option>
                    </select>
                  </div>

                  {/* Unit Kerja */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5 text-xs">
                      Unit Organisasi PLN
                    </label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 cursor-pointer text-xs"
                    >
                      <option value="ULP Baguala">ULP Baguala</option>
                      <option value="PLN Nusa Daya">PLN Nusa Daya</option>
                      <option value="UP3 Ambon">UP3 Ambon</option>
                      <option value="UIW M2U">UIW M2U</option>
                      <option value="PLN Pusat">PLN Pusat</option>
                    </select>
                  </div>
                </div>

                {/* Password & Confirm Password */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5">
                  <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                    <Key className="w-4 h-4 text-blue-600" />
                    <span>Kredensial Password Masuk</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1 text-[11px]">
                      Password Akses
                    </label>
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password rahasia..."
                      required
                      className="w-full px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-slate-950 focus:outline-none focus:border-blue-500 transition-all text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1 text-[11px]">
                      Ulangi Password
                    </label>
                    <input
                      type="text"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ketik ulang password di atas..."
                      required
                      className={`w-full px-3.5 py-1.5 bg-white border rounded-xl font-mono text-slate-950 focus:outline-none transition-all text-xs ${
                        confirmPassword && password !== confirmPassword 
                          ? 'border-rose-400 focus:border-rose-500 bg-rose-50/30' 
                          : 'border-slate-200 focus:border-blue-500'
                      }`}
                    />
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-[10px] text-rose-600 font-bold mt-1">⚠️ Password tidak cocok.</p>
                    )}
                    {confirmPassword && password === confirmPassword && (
                      <p className="text-[10px] text-emerald-600 font-bold mt-1">✓ Password cocok.</p>
                    )}
                  </div>
                </div>

                {/* Profile Photo Avatar Selection */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 text-xs">
                    Foto Profile Pengguna
                  </label>
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-full object-cover border-2 border-blue-500 shadow-sm shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 font-extrabold shrink-0 text-sm">
                        {name ? name.substring(0, 2).toUpperCase() : 'US'}
                      </div>
                    )}
                    <div className="flex-1 space-y-1">
                      <label className="inline-flex items-center justify-center px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-bold cursor-pointer transition-all border border-blue-200">
                        <span>📁 Pilih dari File...</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[9px] text-slate-500">Pilih file foto berukuran kecil langsung dari HP/Komputer Anda.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Granular Menu Access Controls */}
              <div className="space-y-4 flex flex-col">
                <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                    Hak Akses Menu Aplikasi
                  </h4>
                  <button
                    type="button"
                    onClick={() => setAllowedMenus([])}
                    className="text-[11px] text-rose-600 hover:text-rose-700 font-bold transition-colors cursor-pointer"
                  >
                    Kosongkan Semua
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                  Pilih menu apa saja yang boleh tampil di navigasi sidebar user ini. Menu yang tidak di-centang akan disembunyikan sepenuhnya dari layar mereka.
                </p>

                {/* List of menus displayed with checkboxes 1-by-1 */}
                <div className="space-y-2.5 overflow-y-auto max-h-[350px] pr-1.5 flex-1 scrollbar-thin">
                  {[
                    { id: 'dashboard', label: 'Dashboard & Beranda Utama', icon: LayoutDashboard, color: 'text-blue-500 bg-blue-50 border-blue-200', desc: 'Halaman ringkasan statistik dan monitoring cepat' },
                    { id: 'peta', label: 'Peta Penyulang & GIS', icon: Map, color: 'text-emerald-500 bg-emerald-50 border-emerald-200', desc: 'Peta spasial jaringan 20kV, trafo, & tracing kaset' },
                    { id: 'master_data', label: 'Master Data Penyulang', icon: Database, color: 'text-purple-500 bg-purple-50 border-purple-200', desc: 'Data inventaris penyulang, section, & SLD Visio' },
                    { id: 'health_index', label: 'Health Index Penyulang', icon: TrendingUp, color: 'text-cyan-500 bg-cyan-50 border-cyan-200', desc: 'Indeks kesehatan trafo & penyulang 20kV' },
                    { id: 'gangguan', label: 'Gangguan Trip Feeder', icon: Zap, color: 'text-amber-500 bg-amber-50 border-amber-200', desc: 'Manajemen data laporan gangguan & trip feeder' },
                    { id: 'pemeliharaan', label: 'Pemeliharaan 20kV (ROW & Inspeksi)', icon: Wrench, color: 'text-rose-500 bg-rose-50 border-rose-200', desc: 'Akses menu Pangkas Pohon (ROW) & checklist Inspeksi Tier 1 & 2' },
                    { id: 'spk', label: 'Format Surat & SPK', icon: FileText, color: 'text-teal-500 bg-teal-50 border-teal-200', desc: 'Pembuatan Perintah Kerja Harian & surat dinas teknik' },
                    { id: 'pengukuran_gardu', label: 'Pengukuran & Beban Gardu', icon: Gauge, color: 'text-orange-500 bg-orange-50 border-orange-200', desc: 'Input & monitor beban trafo serta tegangan ujung gardu' },
                    { id: 'survey_pb_pd', label: 'Survey PB & PD', icon: Zap, color: 'text-yellow-600 bg-yellow-50 border-yellow-200', desc: 'Input hasil survey Pasang Baru & Perubahan Daya' },
                    { id: 'saidi_saifi', label: 'Realisasi & Estimasi SAIDI SAIFI', icon: BarChart3, color: 'text-indigo-500 bg-indigo-50 border-indigo-200', desc: 'Laporan pemadaman, pemulihan, dan indeks keandalan' },
                    { id: 'monitoring_yantek', label: 'Monitoring Yantek', icon: Shield, color: 'text-sky-500 bg-sky-50 border-sky-200', desc: 'Kelola Alker/APD, material, jadwal piket, & kendaraan' },
                    { id: 'share_laporan', label: 'Share Laporan (WA & TG)', icon: Share2, color: 'text-emerald-500 bg-emerald-50 border-emerald-200', desc: 'Kirim rekapitulasi gangguan atau pemeliharaan ke WA/TG' },
                    { id: 'kelola_user', label: 'Kelola User & Hak Akses', icon: Users, color: 'text-purple-500 bg-purple-50 border-purple-200', desc: 'Menu pengaturan user login (Hanya untuk Admin/Koordinator)' }
                  ].map((menu) => {
                    const isChecked = allowedMenus.includes(menu.id);
                    const MenuIcon = menu.icon;
                    return (
                      <label 
                        key={menu.id} 
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          isChecked 
                            ? 'bg-blue-50/60 border-blue-200 shadow-sm' 
                            : 'bg-white border-slate-200 hover:bg-slate-50/50'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => toggleMenuAllowed(menu.id)}
                          className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className={`p-1 rounded-lg border shrink-0 ${menu.color}`}>
                              <MenuIcon className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-bold text-slate-800 text-xs">{menu.label}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1 leading-normal pl-0.5">{menu.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* Permission Category Details */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="block font-bold text-slate-700 text-[11px]">Mode Otoritas Data:</span>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={canEditDataVal} 
                        onChange={(e) => {
                          setCanEditDataVal(e.target.checked);
                          if (e.target.checked) setCanViewDataOnly(false);
                        }} 
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-[11px] font-bold text-slate-800">Mode Editor (Boleh Input/Edit)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={canViewDataOnly} 
                        onChange={(e) => {
                          setCanViewDataOnly(e.target.checked);
                          if (e.target.checked) setCanEditDataVal(false);
                        }} 
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-[11px] font-bold text-slate-800">Mode Read Only (Hanya Pantau)</span>
                    </label>
                  </div>
                </div>
              </div>

            </form>

            {/* Modal Actions Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] font-bold text-slate-500 block">HASIL HAK AKSES:</span>
                <span className="text-[11px] font-black text-slate-800">
                  {allowedMenus.length} Menu Diaktifkan ({canEditDataVal ? 'Mode Input/Edit' : 'Mode Read Only'})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors text-xs"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={password !== confirmPassword}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-md shadow-blue-500/10 cursor-pointer flex items-center gap-1.5 transition-all text-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingUser ? 'Simpan Perubahan' : 'Simpan User Baru'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
