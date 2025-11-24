import { json } from '@sveltejs/kit';
import { getDB } from '$lib/server/db';
import { ObjectId } from 'mongodb';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params }) => {
  try {
    const db = await getDB();
    
    // Check if call exists
    const call = await db.collection('calls').findOne({
      _id: new ObjectId(params.id)
    });
    
    if (!call) {
      return json({ error: 'Call not found' }, { status: 404 });
    }
    
    // Delete the call
    await db.collection('calls').deleteOne({
      _id: new ObjectId(params.id)
    });
    
    return json({ success: true });
  } catch (error) {
    console.error('Error deleting call:', error);
    return json({ error: 'Failed to delete call' }, { status: 500 });
  }
};