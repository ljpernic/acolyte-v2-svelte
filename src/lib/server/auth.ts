import { redirect, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export function requireUser(event: RequestEvent, allowedRoles?: string[]) {
  const user = event.locals.user;

  if (!user) {
    throw redirect(303, '/login');
  }

  // if allowedRoles is passed, check role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw error(403, 'You do not have permission to access this page.');
  }

  return user;
}