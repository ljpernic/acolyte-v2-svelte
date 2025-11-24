import type { LayoutServerLoad } from './$types';
import { requireUser } from '$lib/server/auth';

export const load: LayoutServerLoad = async (event) => {
  const user = requireUser(event);
  return {
    user,
    permissions: {
      canManage: user.role === 'EIC' || user.userDesignee === true,
      canChangePermissions: user.role === 'EIC'
    }
  };
};