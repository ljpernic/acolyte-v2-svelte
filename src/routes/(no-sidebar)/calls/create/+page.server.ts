import type { Actions } from './$types';
import { getDB } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    
    const title = data.get('title') as string;
    const description = data.get('description') as string;
    const callType = data.get('callType') as string;
    const deadline = data.get('deadline') as string;
    const status = data.get('status') as string;
    const formFields = JSON.parse(data.get('formFields') as string);
    const anonymousSubmissions = data.get('anonymousSubmissions') === 'true';
    
    // Create the derived submitterTitle config
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
    
    const result = await db.collection('calls').insertOne({
      title,
      description,
      callType,
      deadline: deadline ? new Date(deadline) : null,
      status,
      formFields,
      anonymousSubmissions,
      createdAt: new Date(),
      submissionCount: 0
    });
    
    throw redirect(303, '/calls');
  }
};