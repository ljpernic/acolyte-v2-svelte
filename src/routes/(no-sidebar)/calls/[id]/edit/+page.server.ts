import type { PageServerLoad, Actions } from './$types';
import { getDB } from '$lib/server/db';
import { ObjectId } from 'mongodb';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
  const db = await getDB();
  
  const call = await db.collection('calls').findOne({
    _id: new ObjectId(params.id)
  });
  
  if (!call) {
    throw error(404, 'Call not found');
  }
  
  return {
    call: {
      id: call._id.toString(),
      title: call.title,
      description: call.description,
      callType: call.callType,
      status: call.status,
      deadline: call.deadline ? call.deadline.toISOString().slice(0, 16) : '',
      formFields: call.formFields,
      anonymousSubmissions: call.anonymousSubmissions || false,
      createdAt: call.createdAt.toISOString(),
      submissionCount: call.submissionCount || 0
    }
  };
};

export const actions: Actions = {
  default: async ({ request, params }) => {
    const data = await request.formData();
    
    const title = data.get('title') as string;
    const description = data.get('description') as string;
    const callType = data.get('callType') as string;
    const deadline = data.get('deadline') as string;
    const status = data.get('status') as string;
    const formFields = JSON.parse(data.get('formFields') as string);
    const anonymousSubmissions = data.get('anonymousSubmissions') === 'true';
    
    // Create the derived submitterTitle config (same as create)
    const submitterTitleConfig = {
      visible: formFields.piecesPerSubmission.visible,
      required: formFields.piecesPerSubmission.required,
      allowMultiple: formFields.piecesPerSubmission.allowMultiple,
      min: formFields.piecesPerSubmission.min,
      max: formFields.piecesPerSubmission.max,
      description: formFields.piecesPerSubmission.allowMultiple 
        ? `Title(s) for your ${formFields.piecesPerSubmission.min === formFields.piecesPerSubmission.max ? formFields.piecesPerSubmission.max : `${formFields.piecesPerSubmission.min}-${formFields.piecesPerSubmission.max}`} piece(s)`
        : "Title of your work"
    };

    // Add it to formFields before saving
    formFields.submitterTitle = submitterTitleConfig;
    
    const db = await getDB();
    
    await db.collection('calls').updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          title,
          description,
          callType,
          deadline: deadline ? new Date(deadline) : null,
          status,
          formFields,
          anonymousSubmissions,
          updatedAt: new Date()
        }
      }
    );
    
    throw redirect(303, '/calls');
  }
};