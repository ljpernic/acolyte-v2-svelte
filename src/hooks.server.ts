import type { Handle } from '@sveltejs/kit';
import { getDB } from '$lib/server/db';
import cookie from 'cookie';
import { ObjectId } from 'mongodb';

export const handle: Handle = async ({ event, resolve }) => {
  const cookies = cookie.parse(event.request.headers.get('cookie') || '');
  const sessionToken = cookies.session;

  if (sessionToken) {
    const db = await getDB();
    const session = await db.collection('sessions').findOne({ token: sessionToken });

    if (session) {
      const user = await db.collection('readers').findOne({ _id: new ObjectId(session.userId) });
      if (user) {
        event.locals.user = {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          subRole: user.subRole,
          formDesignee: user.formDesignee || false,          
          userDesignee: user.userDesignee || false          
        };
      }
    }
  }

  return resolve(event);
};
