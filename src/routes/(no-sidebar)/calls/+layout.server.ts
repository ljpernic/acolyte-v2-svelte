import type { LayoutServerLoad } from './$types';
import { requireUser } from '$lib/server/auth';
import { error } from '@sveltejs/kit';

export const load: LayoutServerLoad = async (event) => {
  const user = requireUser(event);
  
  // Check if user has formDesignee permission
  if (!user.formDesignee) {
    throw error(403, 'Access denied - Form designee privileges required');
  }
  
  return {
    user
  };
};