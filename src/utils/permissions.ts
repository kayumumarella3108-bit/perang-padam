import { User } from '../types';

/**
 * Checks whether the logged-in user has permission to add, edit, or delete data.
 * Roles with edit/entry permissions:
 *  - Koordinator
 *  - Admin Teknik (restricted to ROW and Inspeksi)
 *  - Admin System (Legacy default)
 *
 * Roles with monitoring-only (read-only) permissions:
 *  - Bagian Teknik
 *  - Team Leader
 *  - Manager ULP
 *  - UP3
 *  - UIW
 *  - PLN Nusadaya
 */
export const canEditData = (user: User | null | undefined): boolean => {
  if (!user || !user.role) return false;
  const roleLower = user.role.toLowerCase().trim();
  
  return (
    roleLower.includes('koordinator') ||
    roleLower.includes('admin teknik') ||
    roleLower.includes('admin system') ||
    roleLower === 'admin'
  );
};

export const canEditModule = (user: User | null | undefined, moduleName: string): boolean => {
  if (!user || !user.role) return false;
  const roleLower = user.role.toLowerCase().trim();

  if (roleLower.includes('koordinator') || roleLower.includes('admin system') || roleLower === 'admin') {
    return true;
  }

  if (roleLower.includes('admin teknik')) {
    // Admin Teknik can only edit ROW and Inspeksi data
    const mod = moduleName.toLowerCase();
    return mod === 'row' || mod === 'inspeksi' || mod === 'peta_penyulang' || mod === 'tier1' || mod === 'tier2' || mod === 'pemeliharaan_20kv';
  }

  return false;
};

export const getRoleCategory = (roleStr: string): 'Edit & Entri Data' | 'Hanya Monitoring (Read Only)' => {
  if (canEditData({ username: '', name: '', role: roleStr })) {
    return 'Edit & Entri Data';
  }
  return 'Hanya Monitoring (Read Only)';
};

