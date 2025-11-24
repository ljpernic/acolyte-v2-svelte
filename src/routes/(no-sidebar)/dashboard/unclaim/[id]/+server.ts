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

  // First, get the current submission to check the reader
  const submission = await db.collection('submissions').findOne({
    _id: new ObjectId(submissionId)
  });

  if (!submission) {
    return new Response('Submission not found', { status: 404 });
  }

  // Handle both array and string cases for reader
  let isUserAssigned = false;
  let currentReaders: string[] = [];

  if (Array.isArray(submission.reader)) {
    currentReaders = submission.reader;
    isUserAssigned = submission.reader.includes(user.id);
  } else if (submission.reader === user.id) {
    // String case - user is the only reader
    currentReaders = [submission.reader];
    isUserAssigned = true;
  } else {
    // Reader is string but not this user, or doesn't exist
    isUserAssigned = false;
  }

  if (!isUserAssigned) {
    return new Response('You are not assigned to this submission', { status: 403 });
  }

  // Remove the user's ID from the reader array
  const updatedReaderArray = currentReaders.filter((readerId: string) => readerId !== user.id);

  // If the array becomes empty, set it to ['unclaimed']
  const finalReaderArray = updatedReaderArray.length === 0 ? ['unclaimed'] : updatedReaderArray;

  const result = await db.collection('submissions').updateOne(
    { _id: new ObjectId(submissionId) },
    { 
      $set: { 
        reader: finalReaderArray
      },
      $currentDate: { updatedAt: true }
    }
  );

  if (result.matchedCount === 0) {
    return new Response('Failed to update submission', { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};