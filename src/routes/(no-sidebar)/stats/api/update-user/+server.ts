import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDB } from '$lib/server/db';
import { requireUser } from '$lib/server/auth';
import { ObjectId } from 'mongodb';

export const POST: RequestHandler = async (event) => {
  const user = requireUser(event);
  const { userId, updates } = await event.request.json();

  // Permission checks
  const canManage = user.role === 'EIC' || user.userDesignee === true;
  const canChangePermissions = user.role === 'EIC';

  if (!canManage) {
    return json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  // Don't allow non-EIC to change permissions
  if ((updates.userDesignee !== undefined || updates.formDesignee !== undefined) && !canChangePermissions) {
    return json({ error: 'Cannot change permissions' }, { status: 403 });
  }

  const db = await getDB();
  
  await db.collection('readers').updateOne(
    { _id: new ObjectId(userId) },
    { $set: updates }
  );

  return json({ success: true });
};