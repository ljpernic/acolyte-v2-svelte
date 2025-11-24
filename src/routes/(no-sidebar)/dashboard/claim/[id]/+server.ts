import type { RequestHandler } from './$types';
import { getDB } from '$lib/server/db';
import { requireUser } from '$lib/server/auth';
import { ObjectId } from 'mongodb';

export const POST: RequestHandler = async (event) => {
  const user = requireUser(event);
  const submissionId = event.params.id;

  if (!submissionId) {
    return new Response('Missing submission ID', { status: 400 });
  }

  const db = await getDB();

  const result = await db.collection('submissions').updateOne(
    { 
      _id: new ObjectId(submissionId), 
      $or: [
        { reader: "unclaimed" },       // String case
        { reader: ["unclaimed"] },     // Array case
        { reader: { $size: 0 } },      // Empty array
        { reader: { $exists: false } } // Doesn't exist
      ],
      status: 'Open', 
      active: true 
    },
    { 
      $set: { 
        reader: [user.id],  // Always set as array for consistency
        active: true 
      },
      $currentDate: { updatedAt: true }
    }
  );

  if (result.matchedCount === 0) {
    return new Response('Submission not found or already claimed', { status: 404 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};