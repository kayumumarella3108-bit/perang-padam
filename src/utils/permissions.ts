import { User } from '../types';

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
    // Admin Teknik can edit operational modules, but CANNOT manage users
    const mod = moduleName.toLowerCase();
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


