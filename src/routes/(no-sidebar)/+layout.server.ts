import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { requireUser } from '$lib/server/auth';
import { getDB } from '$lib/server/db';
import { ObjectId } from 'mongodb';

export const load: LayoutServerLoad = async (event) => {
  // Skip auth for public submission forms
  if (event.url.pathname.startsWith('/submit/')) {
    return {
      user: null
    };
  }
  const user = requireUser(event);

  const db = await getDB();
  const userDoc = await db
    .collection('readers')
    .findOne({ _id: new ObjectId(user.id) });

  if (!userDoc) {
    throw redirect(303, '/login');
  }

  return {
    user: {
      id: userDoc._id.toString(),
      name: userDoc.name,
      email: userDoc.email,
      role: userDoc.role,
      subRole: userDoc.subRole,
      formDesignee: userDoc.formDesignee || false,      
      userDesignee: userDoc.userDesignee || false      
    }
  };
};
