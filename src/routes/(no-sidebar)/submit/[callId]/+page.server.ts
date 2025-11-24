import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getDB } from '$lib/server/db';
import { ObjectId } from 'mongodb';
import { GOOGLE_APPS_SCRIPT_URL } from '$env/static/private';
import { generateSubmissionConfirmation, formatTitlesForSubject } from '$lib/emails/emailSubmissionTemplate.js';
import { sendEmail } from '$lib/utils/emailService.js';

function getSerializableFormData(formData: FormData): Record<string, string> {
  const serializable: Record<string, string> = {};
  
  for (const [key, value] of formData.entries()) {
    // Only include string values, skip File objects
    if (typeof value === 'string') {
      serializable[key] = value;
    }
  }
  
  return serializable;
}

// Add type for form field config
interface FormFieldConfig {
  visible: boolean;
  required: boolean;
  min?: number;
  max?: number;
  description?: string;
  allowMultiple?: boolean;
}

export const load: PageServerLoad = async ({ params }) => {
  const db = await getDB();
  
  const call = await db.collection('calls').findOne(
    { _id: new ObjectId(params.callId) }
  );

  if (!call) {
    throw error(404, 'Call for submissions not found');
  }

  if (call.status !== 'active' && call.status !== 'preview') {
    throw error(403, 'This call is not currently accepting submissions');
  }

  return {
    call: {
      ...call,
      id: call._id.toString(),
      _id: undefined
    }
  };
};

export const actions: Actions = {
  default: async ({ request, params }) => {
    const formData = await request.formData();
    const serializableValues = getSerializableFormData(formData);
    const db = await getDB();
    
    // Get the call to validate against
    const call = await db.collection('calls').findOne(
      { _id: new ObjectId(params.callId) }
    );

    if (!call || (call.status !== 'active' && call.status !== 'preview')) {
      return fail(400, { error: 'Call is not accepting submissions' });
    }

    const formFields = call.formFields as Record<string, FormFieldConfig> || {};
    const submissionData: any = {
      callId: new ObjectId(params.callId),
      reader: [],
      readerNote: "",
      status: "Open",
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Handle pieces count first
    const piecesConfig = formFields.piecesPerSubmission;
    let numberOfPieces = 1;
    
    if (piecesConfig && piecesConfig.visible && piecesConfig.allowMultiple) {
      numberOfPieces = parseInt(formData.get('piecesCount') as string) || piecesConfig.min || 1;
      
      const minPieces = piecesConfig.min || 1;
      
      if (numberOfPieces < minPieces) {
        return fail(400, { 
          error: `Number of pieces must be at least ${minPieces}`,
          values: serializableValues
        });
      }
      
      if (piecesConfig.max && numberOfPieces > piecesConfig.max) {
        return fail(400, { 
          error: `Number of pieces cannot exceed ${piecesConfig.max}`,
          values: serializableValues
        });
      }
    }

    // Handle submitter names - always as array
    if (formFields.submitterName?.visible) {
      const names: string[] = [];
      
      if (formFields.submitterName.allowMultiple) {
        // Multiple authors
        const authorCount = parseInt(formData.get('authorCount') as string) || formFields.submitterName.min || 1;
        
        for (let i = 1; i <= authorCount; i++) {
          const authorName = formData.get(`submitterName_${i}`) as string;
          if (authorName && authorName.trim() !== '') {
            names.push(authorName.trim());
          }
        }
      } else {
        // Single author
        const singleName = formData.get('submitterName') as string;
        if (singleName && singleName.trim() !== '') {
          names.push(singleName.trim());
        }
      }
      
      if (formFields.submitterName.required && names.length === 0) {
        return fail(400, { 
          error: 'At least one author name is required',
          values: serializableValues
        });
      }
      
      submissionData.name = names; // Always an array
    }

    // Handle title field
    if (formFields.submitterTitle?.visible) {
      console.log('Inside submitterTitle handling block');
      console.log('allowMultiple:', formFields.piecesPerSubmission?.allowMultiple);
      
      const titles: string[] = [];
      
      if (formFields.piecesPerSubmission?.allowMultiple) {
        // Multiple pieces - look for title_1, title_2, etc.
        console.log('Looking for multiple titles (title_1, title_2, etc.)');
        for (let i = 1; i <= numberOfPieces; i++) {
          const title = formData.get(`title_${i}`) as string;
          console.log(`title_${i}:`, title);
          if (title && title.trim() !== '') {
            titles.push(title.trim());
          }
        }
      } else {
        // Single piece - look for just 'title'
        console.log('Looking for single title (name="title")');
        const title = formData.get('title') as string;
        console.log('Single title value:', title);
        if (title && title.trim() !== '') {
          titles.push(title.trim());
        }
      }
           
      if (formFields.submitterTitle.required && titles.length === 0) {
        return fail(400, { 
          error: 'At least one title is required',
          values: serializableValues
        });
      }
      
      submissionData.title = titles;
    }

    // Handle email
    if (formFields.submitterEmail?.visible) {
      const email = formData.get('submitterEmail') as string;
      const confirmEmail = formData.get('confirmEmail') as string;
      
      if (formFields.submitterEmail.required && (!email || email.trim() === '')) {
        return fail(400, { 
          error: 'Email is required',
          values: serializableValues
        });
      }
      
      if (email !== confirmEmail) {
        return fail(400, { 
          error: 'Email addresses do not match',
          values: serializableValues
        });
      }
      
      if (email && email.trim() !== '') {
        submissionData.email = email.trim();
      }
    }

    // Handle word count
    if (formFields.wordCount?.visible) {
      const wordCount = formData.get('wordCount') as string;
      
      if (formFields.wordCount.required && (!wordCount || wordCount.trim() === '')) {
        return fail(400, { 
          error: 'Word count is required',
          values: serializableValues
        });
      }
      
      if (wordCount && wordCount.trim() !== '') {
        const count = parseInt(wordCount);
        if (isNaN(count)) {
          return fail(400, { 
            error: 'Please enter a valid word count',
            values: serializableValues
          });
        }
        
        if (formFields.wordCount.min && count < formFields.wordCount.min) {
          return fail(400, { 
            error: `Word count must be at least ${formFields.wordCount.min}`,
            values: serializableValues
          });
        }
        
        if (formFields.wordCount.max && count > formFields.wordCount.max) {
          return fail(400, { 
            error: `Word count cannot exceed ${formFields.wordCount.max}`,
            values: serializableValues
          });
        }
        
        submissionData.wordCount = count;
      }
    }

    // Handle feedback preference
    if (formFields.offerFeedback?.visible) {
      const feedback = formData.get('offerFeedback') as string;
      
      if (formFields.offerFeedback.required && (!feedback || feedback.trim() === '')) {
        return fail(400, { 
          error: 'Please select your feedback preference',
          values: serializableValues
        });
      }
      
      submissionData.feedback = feedback === 'yes';
    }

    // Handle cover letter
    if (formFields.coverLetter?.visible) {
      const coverLetter = formData.get('coverLetter') as string;
      
      if (formFields.coverLetter.required && (!coverLetter || coverLetter.trim() === '')) {
        return fail(400, { 
          error: 'Cover letter is required',
          values: serializableValues
        });
      }
      
      if (coverLetter && coverLetter.trim() !== '') {
        submissionData.coverLetter = coverLetter.trim();
      }
    }

    // Handle type
    submissionData.type = call.callType || 'unknown';

    // Handle file upload with Google Drive integration
    if (formFields.fileUpload?.visible) {
      const file = formData.get('fileUpload') as File;
      
      if (formFields.fileUpload.required && (!file || file.size === 0)) {
        return fail(400, { 
          error: 'File upload is required',
          values: serializableValues
        });
      }
      
      if (file && file.size > 0) {
        try {
          // Convert file to base64 for Google Drive upload
          const fileBuffer = await file.arrayBuffer();
          const base64File = Buffer.from(fileBuffer).toString('base64');

          const dataSend = {
            dataReq: {
              data: base64File,
              name: file.name,
              mimeType: file.type
            },
            fname: 'uploadFilesToGoogleDrive'
          };

          const googleScriptUrl = GOOGLE_APPS_SCRIPT_URL;

          const response = await fetch(googleScriptUrl, {
            method: 'POST',
            body: JSON.stringify(dataSend),
            headers: { 'Content-Type': 'application/json' }
          });

          if (!response.ok) {
            console.error('Google Drive upload failed:', response.statusText);
            return fail(500, { 
              error: 'File upload failed. Please try again.',
              values: serializableValues
            });
          }

          const result = await response.json();
          console.log('File uploaded successfully:', result);

          // Store the Google Drive URL in the submission
          submissionData.file = result.url;
          
        } catch (uploadError) {
          console.error('File upload error:', uploadError);
          return fail(500, { 
            error: 'File upload failed. Please try again.',
            values: serializableValues
          });
        }
      }
    }

    // Insert submission into database
    try {
      const result = await db.collection('submissions').insertOne(submissionData);

      // Send confirmation email
      try {
        if (submissionData.email) {
          const authorName = submissionData.name || 'Author';
          
          const emailData = {
            authorName,
            submissionTitle: submissionData.title,
            submissionType: submissionData.type,
            callTitle: call.title
          };
          
          const emailBody = generateSubmissionConfirmation(emailData);
          const subjectTitle = formatTitlesForSubject(submissionData.title);

          await sendEmail({
            to: submissionData.email,
            subject: `Haven Spec Magazine — ${subjectTitle}`,
            content: emailBody
          });
        }
      } catch (emailError) {
        console.error('Email confirmation failed:', emailError);
        // Don't fail the submission if email fails - submission was already saved
      }

    } catch (err) {
      console.error('Submission error:', err);
      return fail(500, { 
        error: 'Failed to submit. Please try again.',
        values: serializableValues
      });
    }

    // Move the redirect outside the try-catch
    throw redirect(303, `/submit/${params.callId}/success`);
  }
};