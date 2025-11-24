import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDB } from '$lib/server/db';
import { ObjectId } from 'mongodb';

export const load: PageServerLoad = async ({ params }) => {
  const db = await getDB();
  
  const call = await db.collection('calls').findOne(
    { _id: new ObjectId(params.callId) },
    {
      projection: {
        title: 1,
        type: 1
      }
    }
  );

  if (!call) {
    throw error(404, 'Call for submissions not found');
  }

  return {
    call: {
      ...call,
      id: call._id.toString(),
      _id: undefined
    }
  };
};