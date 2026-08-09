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
  ArrowRight
} from 'lucide-react';
import { User } from '../../types';
import { canEditData, getRoleCategory } from '../../utils/permissions';

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

  // Strict check: only Koordinator can add/edit/delete users
  const canEdit = currentUser?.role === 'Koordinator';

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

  const openAddModal = () => {
    setEditingUser(null);
    setUsername('');
    setName('');
    setRole('Koordinator');
    setUnit('ULP Baguala');
    setAvatarUrl(PRESET_AVATARS[0].url);
    setPassword('');
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
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !name.trim()) return;

    if (editingUser) {
      const updated: User = {
        ...editingUser,
        username,
        name,
        role: role as any,
        unit,
        avatarUrl,
        password
      };
      onUpdateUser(updated);
    } else {
      const newUser: User = {
        id: `user_${Date.now()}`,
        username,
        name,
        role: role as any,
        unit,
        status: 'Aktif',
        avatarUrl,
        password
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
                Pengaturan hak akses entri data vs monitoring untuk Koordinator, Admin Teknik, Team Leader, Manager ULP, UP3, & UIW
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

      {/* Role Rule Matrix Info Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Full Access Box */}
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-sm flex items-start gap-3.5">
          <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-emerald-950">
                Mode Edit & Entri Data (Akses Penuh)
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900 font-extrabold text-[10px]">
                CAN EDIT & ENTRY
              </span>
            </div>
            <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
              Dapat menginput, mengedit, memperbarui, dan menghapus data gangguan, ROW, pemeliharaan, SAIDI/SAIFI, material, serta alat kerja.
            </p>
            <div className="mt-2.5 flex items-center gap-2 flex-wrap text-xs font-bold">
              <span className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 shadow-xs">
                • Koordinator
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 shadow-xs">
                • Admin Teknik
              </span>
            </div>
          </div>
        </div>

        {/* Read Only Box */}
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 shadow-sm flex items-start gap-3.5">
          <div className="p-2 rounded-xl bg-amber-600 text-white shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-amber-950">
                Mode Monitoring (Read Only)
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 font-extrabold text-[10px]">
                MONITORING ONLY
              </span>
            </div>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              Dapat memantau seluruh dashboard, peta penyulang, tren SAIDI, laporan gangguan, tanpa opsi tombol input / edit / hapus data.
            </p>
            <div className="mt-2.5 flex items-center gap-2 flex-wrap text-xs font-bold">
              <span className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-800 shadow-xs">
                • Bagian Teknik
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-800 shadow-xs">
                • Team Leader
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-800 shadow-xs">
                • Manager ULP
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-800 shadow-xs">
                • UP3
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-800 shadow-xs">
                • UIW
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-800 shadow-xs">
                • PLN Nusadaya
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Quick Role Switcher Banner */}
      {onSwitchUserRole && (
        <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                <span>SIMULASI QUICK ROLE SWITCHER</span>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-[10px]">
                  Aktif: {currentUser.name} ({currentUser.role})
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Uji coba langsung tampilan antarmuka antara Mode Edit vs Mode Monitoring Read-Only.
              </p>
            </div>
          </div>

          {/* Role Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { role: 'Koordinator', label: 'Koordinator', edit: true },
              { role: 'Admin Teknik', label: 'Admin Teknik', edit: true },
              { role: 'Bagian Teknik', label: 'Bagian Teknik', edit: false },
              { role: 'PLN Nusadaya', label: 'PLN Nusadaya', edit: false },
              { role: 'Team Leader', label: 'Team Leader', edit: false },
              { role: 'Manager ULP', label: 'Manager ULP', edit: false },
              { role: 'UP3', label: 'UP3', edit: false },
              { role: 'UIW', label: 'UIW', edit: false }
            ].map((r) => {
              const isActive = currentUser.role === r.role;
              return (
                <button
                  key={r.role}
                  onClick={() => {
                    const matched = usersList.find((u) => u.role === r.role);
                    if (matched) {
                      onSwitchUserRole(matched);
                    } else {
                      onSwitchUserRole({
                        username: r.role.toLowerCase().replace(/\s+/g, '_'),
                        name: `User ${r.label}`,
                        role: r.role as any,
                        unit: 'PLN ULP Baguala'
                      });
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${r.edit ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span>{r.label}</span>
                </button>
              );
            })}
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
                              {u.name.substring(0, 2).toUpperCase()}
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
                      <td className="py-3.5 px-4">
                        {isEdit ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Edit & Entri Data</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 text-[11px] font-bold">
                            <Eye className="w-3.5 h-3.5 text-amber-600" />
                            <span>Monitoring Read-Only</span>
                          </span>
                        )}
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
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingUser ? 'Edit Role User' : 'Tambah User Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Konfigurasi hak akses pengguna aplikasi Perang Padam
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 font-sans text-xs">
              
              {/* Username */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Username / ID Pengguna
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: koordinator_baguala"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              {/* Nama Lengkap */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Bpk. Ahmad Fauzi"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              {/* Role Jabatan */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Role / Jabatan Akses
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 cursor-pointer"
                >
                  <optgroup label="✅ Mode Edit & Entri Data">
                    <option value="Koordinator">Koordinator (Dapat Edit & Entri)</option>
                    <option value="Admin Teknik">Admin Teknik (Dapat Edit & Entri)</option>
                  </optgroup>
                  <optgroup label="👁️ Mode Monitoring Only (Read-Only)">
                    <option value="Bagian Teknik">Bagian Teknik (Hanya Monitoring)</option>
                    <option value="PLN Nusadaya">PLN Nusadaya (Monitoring PLN Nusadaya)</option>
                    <option value="Team Leader">Team Leader (Hanya Monitoring)</option>
                    <option value="Manager ULP">Manager ULP (Hanya Monitoring)</option>
                    <option value="UP3">UP3 (Hanya Monitoring)</option>
                    <option value="UIW">UIW (Hanya Monitoring)</option>
                  </optgroup>
                </select>
              </div>

              {/* Photo Avatar Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Foto Profile User
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 shadow-sm shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold shrink-0">
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
                      <p className="text-[9px] text-slate-500">Pilih file foto langsung dari HP/Komputer Anda.</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Atau input URL Foto:
                    </span>
                    <input
                      type="url"
                      value={avatarUrl.startsWith('data:') ? '' : avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="URL Foto (https://...)"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>

                  {/* Preset Photos */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Pilih Foto Preset:
                    </span>
                    <div className="grid grid-cols-5 gap-1.5">
                      {PRESET_AVATARS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatarUrl(p.url)}
                          className={`relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer aspect-square ${
                            avatarUrl === p.url ? 'border-blue-600 ring-2 ring-blue-400' : 'border-slate-200 hover:border-slate-400'
                          }`}
                          title={p.label}
                        >
                          <img src={p.url} alt={p.label} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Akses */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Password Akses Baru
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password rahasia untuk login..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                />
                <p className="text-[10px] text-slate-500 mt-1 font-sans">Digunakan saat melakukan login ke dalam aplikasi Perang Padam.</p>
              </div>

              {/* Unit Kerja */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Unit Organisasi PLN
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                >
                  <option value="ULP Baguala">ULP Baguala</option>
                  <option value="UP3 Ambon">UP3 Ambon</option>
                  <option value="UIW Maluku & Maluku Utara">UIW Maluku & Maluku Utara</option>
                </select>
              </div>

              {/* Preview Hak Akses */}
              <div className={`p-3 rounded-xl border text-xs ${
                canEditData({ username: '', name: '', role })
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                <div className="font-extrabold flex items-center gap-1.5">
                  {canEditData({ username: '', name: '', role }) ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Hasil Akses: Kategori Edit & Entri Data</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 text-amber-600" />
                      <span>Hasil Akses: Kategori Hanya Monitoring (Read-Only)</span>
                    </>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
