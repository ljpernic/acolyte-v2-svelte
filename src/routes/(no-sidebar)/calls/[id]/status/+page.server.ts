import type { Actions } from './$types';
import { getDB } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';

export const actions: Actions = {
  default: async ({ request, params }) => {
    const formData = await request.formData();
    const status = formData.get('status') as string;
    
    const db = await getDB();
    
    await db.collection('calls').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { status } }
    );
    
    throw redirect(303, '/calls');
  }
};