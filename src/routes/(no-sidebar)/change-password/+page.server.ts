import type { Actions, PageServerLoad } from './$types';
import { getDB } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';

export const load: PageServerLoad = async ({ locals }) => {
  // Redirect if not logged in
  if (!locals.user) {
    throw redirect(302, '/login');
  }
  
  return {};
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    // Check if user is logged in
    if (!locals.user) {
      throw redirect(302, '/login');
    }

    const data = await request.formData();
    const currentPassword = data.get('currentPassword')?.toString();
    const newPassword = data.get('newPassword')?.toString();
    const confirmPassword = data.get('confirmPassword')?.toString();

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return fail(400, { message: 'All fields are required' });
    }

    // Check password length
    if (newPassword.length < 6) {
      return fail(400, { message: 'New password must be at least 6 characters long' });
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return fail(400, { message: 'New passwords do not match' });
    }

    // Check if new password is different from current
    if (currentPassword === newPassword) {
      return fail(400, { message: 'New password must be different from current password' });
    }

    const db = await getDB();

    try {
      // Get user from database
      const user = await db.collection('readers').findOne({ email: locals.user.email });
      if (!user) {
        return fail(400, { message: 'User not found' });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return fail(400, { message: 'Current password is incorrect' });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password in database
      await db.collection('readers').updateOne(
        { email: locals.user.email },
        { 
          $set: { 
            password: hashedNewPassword,
            updatedAt: new Date()
          }
        }
      );

      console.log(`Password changed for user: ${locals.user.email}`);

    } catch (error) {
      console.error('Error changing password:', error);
      return fail(500, { message: 'Failed to change password' });
    }

    // Redirect with success message
    throw redirect(302, '/stats?passwordChanged=true');
  }
};