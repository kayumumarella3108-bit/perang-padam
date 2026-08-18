import { User } from '../types';

/**
 * Checks whether the logged-in user belongs to Bagian Pemasaran.
 * User Pemasaran can ONLY access Survey PB/PD & WO Survey.
 */
export const isPemasaranUser = (user: User | null | undefined): boolean => {
  if (!user || !user.role) return false;
  const roleLower = user.role.toLowerCase().trim();
  return roleLower.includes('pemasaran');
};

export const isPetugasRowUser = (user: User | null | undefined): boolean => {
  if (!user || !user.role) return false;
  const roleLower = user.role.toLowerCase().trim();
  return roleLower.includes('row') || roleLower.includes('pohon');
};

/**
 * Checks whether the logged-in user belongs to Bagian Inspeksi / Teknik.
 * Inspection user sees inspection modules and PB/PD survey parameters onwards.
 */
export const isInspeksiUser = (user: User | null | undefined): boolean => {
  if (!user || !user.role) return false;
  const roleLower = user.role.toLowerCase().trim();
  return roleLower.includes('inspeksi') || roleLower.includes('teknik');
};

/**
 * Checks whether the logged-in user belongs to Bagian Transaksi Energi (TE).
 */
export const isTransaksiEnergiUser = (user: User | null | undefined): boolean => {
  if (!user || !user.role) return false;
  const roleLower = user.role.toLowerCase().trim();
  return roleLower.includes('transaksi energi') || roleLower.includes('transaksi_energi') || roleLower.includes('transaksi');
};

/**
 * Checks whether the logged-in user has permission to manage users (create, edit, delete users).
 * - Koordinator: Can manage users and edit operational data.
 * - Admin Teknik: Can input/edit operational data ONLY, CANNOT manage or create users.
 */
export const canManageUsers = (user: User | null | undefined): boolean => {
  if (!user || !user.role) return false;
  const roleLower = user.role.toLowerCase().trim();
  return roleLower.includes('koordinator') || roleLower.includes('admin system');
};

/**
 * Checks whether the logged-in user has permission to add, edit, or delete operational data.
 * Roles with edit/entry permissions:
 *  - Koordinator
 *  - Admin Teknik (Entri data operasional)
 *  - Admin System
 *  - Bagian Pemasaran (Entri Permohonan WO PB/PD)
 *  - Bagian Transaksi Energi (Entri data teknis & pengukuran)
 */
export const canEditData = (user: User | null | undefined): boolean => {
  if (!user) return false;
  
  // If the user has explicit permissions object defined, respect it
  if (user.permissions && typeof user.permissions.canEditData === 'boolean') {
    return user.permissions.canEditData;
  }

  if (!user.role) return false;
  const roleLower = user.role.toLowerCase().trim();
  
  return (
    roleLower.includes('koordinator') ||
    roleLower.includes('admin teknik') ||
    roleLower.includes('admin system') ||
    roleLower.includes('pemasaran') ||
    roleLower.includes('transaksi') ||
    roleLower.includes('inspeksi') ||
    roleLower.includes('row') ||
    roleLower.includes('pohon') ||
    roleLower === 'admin'
  );
};

export const canEditModule = (user: User | null | undefined, moduleName: string): boolean => {
  if (!user || !user.role) return false;
  const roleLower = user.role.toLowerCase().trim();
  const mod = moduleName.toLowerCase();

  // Bagian Pemasaran is strictly limited to survey_pb_pd
  if (isPemasaranUser(user)) {
    return mod === 'survey_pb_pd' || mod === 'wo_survey';
  }

  // Petugas ROW is strictly limited to row / peta_pohon
  if (isPetugasRowUser(user)) {
    return mod === 'row' || mod === 'peta_pohon';
  }

  // Petugas Inspeksi / Teknik can edit operational & inspection modules except user management
  if (isInspeksiUser(user)) {
    if (mod === 'kelola_user' || mod === 'users' || mod === 'user_management') return false;
    return true;
  }

  if (roleLower.includes('koordinator') || roleLower.includes('admin system') || roleLower === 'admin') {
    return true;
  }

  if (roleLower.includes('admin teknik') || isTransaksiEnergiUser(user)) {
    // Cannot manage users
    if (mod === 'kelola_user' || mod === 'users' || mod === 'user_management') return false;
    return true;
  }

  return false;
};

export const getRoleCategory = (roleStr: string): 'Edit & Entri Data' | 'Hanya Monitoring (Read Only)' => {
  if (canEditData({ username: '', name: '', role: roleStr })) {
    return 'Edit & Entri Data';
  }
  return 'Hanya Monitoring (Read Only)';
};

export const canAccessMenu = (user: User | null | undefined, menuKey: string): boolean => {
  if (!user) return false;
  
  const roleLower = (user.role || '').toLowerCase().trim();
  
  // Koordinator / Super Admin always has full access to all menus
  if (roleLower.includes('koordinator') || roleLower.includes('admin system') || roleLower === 'admin' || roleLower === 'admin aplikasi') {
    return true;
  }

  // Check if explicit allowedMenus is defined for the user
  if (user.allowedMenus && Array.isArray(user.allowedMenus)) {
    if (user.allowedMenus.length === 0) return false;
    
    // Direct match
    if (user.allowedMenus.includes(menuKey)) return true;
    
    // Check key aliases
    if ((menuKey === 'matriks_gangguan' || menuKey === 'gangguan') && (user.allowedMenus.includes('gangguan') || user.allowedMenus.includes('matriks_gangguan'))) return true;
    if ((menuKey === 'peta_penyulang' || menuKey === 'peta_pohon' || menuKey === 'peta_konstruksi' || menuKey === 'peta') && user.allowedMenus.includes('peta')) return true;
    if ((menuKey === 'master_data' || menuKey === 'aset_jaringan' || menuKey === 'sld_visio') && user.allowedMenus.includes('master_data')) return true;
    if ((menuKey === 'row' || menuKey.startsWith('inspeksi_') || menuKey === 'pemeliharaan_20kv' || menuKey === 'pemeliharaan') && user.allowedMenus.includes('pemeliharaan')) return true;
    if ((menuKey === 'perintah_kerja' || menuKey === 'format_surat' || menuKey === 'spk') && (user.allowedMenus.includes('spk') || user.allowedMenus.includes('format_surat'))) return true;
    if ((menuKey === 'saidi_saifi' || menuKey === 'estimasi_saidi_saifi') && user.allowedMenus.includes('saidi_saifi')) return true;
    if ((menuKey === 'alker_apd' || menuKey === 'material' || menuKey === 'jadwal_piket' || menuKey === 'kendaraan_operasional' || menuKey === 'monitoring_yantek') && user.allowedMenus.includes('monitoring_yantek')) return true;
    
    return false;
  }

  // Fallback defaults for legacy users without explicit allowedMenus array:
  if (isPemasaranUser(user)) {
    return menuKey === 'survey_pb_pd' || menuKey === 'dashboard';
  }
  if (isPetugasRowUser(user)) {
    return menuKey === 'pemeliharaan' || menuKey === 'row' || menuKey === 'peta' || menuKey === 'peta_pohon';
  }

  // By default, non-Koordinator roles can access all operational views except kelola_user
  if (menuKey === 'kelola_user') return false;
  return true;
};


