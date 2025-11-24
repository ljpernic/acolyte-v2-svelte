import type { PageServerLoad } from './$types';
import { getDB } from '$lib/server/db';
import { requireUser } from '$lib/server/auth';
import { ObjectId } from 'mongodb';

export const load: PageServerLoad = async (event) => {
  // Ensure the user is logged in
  const user = requireUser(event);

  const db = await getDB();

  // Get the submission ID from the URL
  const submissionId = event.params.id;
  if (!ObjectId.isValid(submissionId)) {
    throw new Error('Invalid submission ID');
  }

  const submission = await db.collection('submissions').findOne({
    _id: new ObjectId(submissionId)
  });

  if (!submission) {
    throw new Error('Submission not found');
  }

  // Fetch reader objects for those IDs
  type Reader = { _id: string; name: string };
  let readers: Reader[] = [];

  // Handle both string and array cases for reader field
  let readerIds: string[] = [];
  
  if (submission.reader) {
    if (Array.isArray(submission.reader)) {
      readerIds = submission.reader;
    } else {
      readerIds = [submission.reader];
    }
  }

  // Filter out invalid ObjectIds and special values like "unclaimed"
  const validReaderIds = readerIds.filter((id: string) => {
    return ObjectId.isValid(id) && id !== 'unclaimed';
  });

  if (validReaderIds.length > 0) {
    const readerDocs = await db.collection('readers')
      .find({ _id: { $in: validReaderIds.map((id: string) => new ObjectId(id)) } })
      .toArray();

    // Convert ObjectId to string and keep name
    readers = readerDocs.map(r => ({ _id: r._id.toString(), name: r.name }));
  }

  // Convert Mongo ObjectId and dates to strings for Svelte
  const safeSubmission = JSON.parse(JSON.stringify(submission));

  return {
    submission: safeSubmission,
    readers,
    user
  };
};