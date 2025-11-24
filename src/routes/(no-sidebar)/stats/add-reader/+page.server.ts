import type { Actions } from './$types';
import { getDB } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';

export const actions: Actions = {
  default: async ({ request, locals }) => {
    // Check if user is authorized
    if (!locals.user?.userDesignee) {
      throw redirect(302, '/stats');
    }

    const data = await request.formData();
    const name = data.get('name')?.toString();
    const email = data.get('email')?.toString();
    const role = data.get('role')?.toString();
    const subRole = data.get('subRole')?.toString() || '';
    const password = data.get('password')?.toString();

    // Validate required fields
    if (!name || !email || !role || !password) {
      return fail(400, { message: 'Name, email, role, and password are required' });
    }

    const db = await getDB();

    try {
      // Check if email already exists
      const existingUser = await db.collection('readers').findOne({ email });
      if (existingUser) {
        return fail(400, { message: 'A user with this email already exists' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create new reader
      const newReader = {
        name,
        email,
        role,
        subRole,
        password: hashedPassword,
        isActive: true,
        formDesignee: false,
        userDesignee: false,
        createdAt: new Date()
      };

      await db.collection('readers').insertOne(newReader);

      console.log(`Created new reader: ${name} (${email})`);

    } catch (error) {
      console.error('Error creating reader:', error);
      return fail(500, { message: 'Failed to create reader' });
    }

    // Redirect with success message
    throw redirect(302, '/stats?created=' + encodeURIComponent(name));
  }
};