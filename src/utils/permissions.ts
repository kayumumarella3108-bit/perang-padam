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
  if (!user || !user.role) return false;
  const roleLower = user.role.toLowerCase().trim();
  
  return (
    roleLower.includes('koordinator') ||
    roleLower.includes('admin teknik') ||
    roleLower.includes('admin system') ||
    roleLower.includes('pemasaran') ||
    roleLower.includes('transaksi') ||
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


