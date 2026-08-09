import { User } from '../types';

/**
 * Checks whether the logged-in user has permission to add, edit, or delete data.
 * Roles with edit/entry permissions:
 *  - Koordinator
 *  - Admin Teknik
 *  - Admin System (Legacy default)
 *
 * Roles with monitoring-only (read-only) permissions:
 *  - Bagian Teknik
 *  - Team Leader
 *  - Manager ULP
 *  - UP3
 *  - UIW
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

export const getRoleCategory = (roleStr: string): 'Edit & Entri Data' | 'Hanya Monitoring (Read Only)' => {
  if (canEditData({ username: '', name: '', role: roleStr })) {
    return 'Edit & Entri Data';
  }
  return 'Hanya Monitoring (Read Only)';
};
