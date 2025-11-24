import type { RequestHandler } from './$types';
import { getDB } from '$lib/server/db';
import { requireUser } from '$lib/server/auth';
import { ObjectId } from 'mongodb';

export const POST: RequestHandler = async (event) => {
  const user = requireUser(event);
  const db = await getDB();
  const submissionId = event.params.id;

  const body = await event.request.json();
  const { 
    action, 
    readerNote, 
    title, 
    name, 
    email, 
    coverLetter,
    status,
    wasRecommended,
    active,
    emailTemplate,
    alertSentBy,
    alertSentAt,
    alertDesignees
  } = body;

  const update: Record<string, any> = {};

  // Always include notes if provided
  if (readerNote !== undefined) update.readerNote = readerNote;

  // Handle new email template fields (these take precedence over action-based updates)
  if (status !== undefined) update.status = status;
  if (wasRecommended !== undefined) update.wasRecommended = wasRecommended;
  if (active !== undefined) update.active = active;
  if (emailTemplate !== undefined) update.emailTemplate = emailTemplate;

switch (action) {
  case 'recommend':
    if (status === undefined) update.status = 'Recommended';
    update.wasRecommended = true;
    update.reader = [
      ...(user.role === 'EIC' ? ['EIC'] : []),
      ...(user.id ? [user.id] : [])
    ];
    break;
  case 'reject':
    if (status === undefined) update.status = 'Rejected';
    if (active === undefined) update.active = false;
    break;
  case 'firstRoundReject':
    if (status === undefined) update.status = 'Rejected, First Round';
    if (active === undefined) update.active = false;
    break;
  case 'secondRoundReject':
    if (status === undefined) update.status = 'Rejected, Second Round';
    if (active === undefined) update.active = false;
    break;
  case 'updateNotes':
    // Notes are already handled above
    break;
  case 'updateFields':
    // Handle EIC-specific field updates
    if (user.role === 'EIC') {
      if (title !== undefined) update.title = title;
      if (name !== undefined) update.name = name;
      if (email !== undefined) update.email = email;
      if (coverLetter !== undefined) update.coverLetter = coverLetter;
    }
    break;
  case 'processSubmission':  
    // Handle processing - includes status changes and field updates
    if (user.role === 'EIC') {
      if (title !== undefined) update.title = title;
      if (name !== undefined) update.name = name;
      if (email !== undefined) update.email = email;
      if (coverLetter !== undefined) update.coverLetter = coverLetter;
    }
    // Set time of processing
    update.processedAt = new Date();
    break;
  case 'markAlertSent': 
    const currentSubmission = await db.collection('submissions').findOne(
      { _id: new ObjectId(submissionId) }
    );
    
    update.alertSent = true;
    update.alertSentBy = alertSentBy;
    update.alertSentAt = alertSentAt;
    
    if (alertDesignees && alertDesignees.length > 0) {
      // Handle both string and array cases for current readers
      const currentReaders = Array.isArray(currentSubmission?.reader) 
        ? currentSubmission.reader 
        : (currentSubmission?.reader ? [currentSubmission.reader] : []);
      update.reader = [...new Set([...currentReaders, ...alertDesignees])];
    }
    break;
  case 'unclaim':
    update.reader = ['unclaimed'];
    if (status === undefined) update.status = 'Open';
    break;
  case 'markWithdrawn':
    if (status === undefined) update.status = 'Withdrawn';
    if (active === undefined) update.active = false;
    break;    
  case 'markAccepted':
    if (status === undefined) update.status = 'Accepted';
    if (active === undefined) update.active = false;
    break;        
  default:
    return new Response('Invalid action', { status: 400 });
}

  update.updatedAt = new Date();

  const result = await db.collection('submissions').findOneAndUpdate(
    { _id: new ObjectId(submissionId) },
    { $set: update },
    {
      returnDocument: 'after',
      includeResultMetadata: true,
    }
  );

  if (!result || !result.value) {
    console.error('findOneAndUpdate returned null value');
    return new Response('Submission not found', { status: 404 });
  }

  const doc = result.value!;
  const updatedSubmission = {
    ...doc,
    _id: doc._id.toString(),
    createdAt: doc.createdAt?.toString(),
    updatedAt: doc.updatedAt?.toString()
  };

  return new Response(JSON.stringify({ updatedSubmission }), {
    headers: { 'Content-Type': 'application/json' }
  });
};