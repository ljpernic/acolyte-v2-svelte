import { getAlertDesignees, getAlertDesigneeEmails } from '$lib/utils/readers';

export interface AlertTemplateData {
  submissionTitle: string;
  authorName: string;
  authorEmail: string;
  status: string;
  wordCount: number;
  type: string;
  coverLetter?: string;
  createdAt?: string;
  readerName: string;
  readerRole: string;
  readerNote: string;
}

function getRoleDisplay(role: string): string {
  const roleMap: Record<string, string> = {
    'EIC': 'Editor',
    'assistantEditor': 'Assistant Editor',
    'associateEditor': 'Associate Editor'
  };
  return roleMap[role] || role;
}

export function generateAlertTemplate(data: AlertTemplateData): string {
  const {
    submissionTitle,
    authorName,
    authorEmail,
    status,
    wordCount,
    type,
    coverLetter,
    createdAt,
    readerName,
    readerRole,
    readerNote
  } = data;

  return `Dear Editor,

A reader has flagged submission "${submissionTitle}" by ${authorName} for your attention.

Submission Details:
- Title: ${submissionTitle}
- Author: ${authorName}
- Email: ${authorEmail}
- Current Status: ${status}
- Word Count: ${wordCount}
- Type: ${type}
- Submitted: ${createdAt?.slice(0, 10)}
- CoverLetter: ${coverLetter}

Reader Information:
- Name: ${readerName}
- Role: ${getRoleDisplay(readerRole)}
- Reader Note: ${readerNote || 'No additional notes provided'}

Please review this submission when convenient. It has been moved to your queue, and you may also search for it.

Sincerely,
Your Favorite Acolyte Automaton`;
}

export function generateAlertSubject(submissionTitle: string): string {
  return `Reader Alert: ${submissionTitle} - Flagged for Review`;
}

// Function that sends the alert
export async function sendEditorAlert(
  submission: any,
  user: any,
  readerNote: string
): Promise<any> {
  // Get alert designee ids and emails
  const alertDesignees = await getAlertDesignees(); // IDs for database
  const alertDesigneeEmails = await getAlertDesigneeEmails();
  
  // Generate email content
  const alertData: AlertTemplateData = {
    submissionTitle: submission.title,
    authorName: submission.name,
    authorEmail: submission.email,
    status: submission.status,
    wordCount: submission.wordCount,
    type: submission.type,
    coverLetter: submission.coverLetter,
    createdAt: submission.createdAt,
    readerName: user.name,
    readerRole: user.role,
    readerNote: readerNote
  };

  const emailContent = generateAlertTemplate(alertData);
  const emailSubject = generateAlertSubject(submission.title);

  // Alert Email function
    try {
    // Send emails to all alert designees
    for (const designeeEmail of alertDesigneeEmails) {
      const emailResponse = await fetch(`/dashboard/api/submission/${submission._id}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailTemplate: emailContent,
          recipientEmail: designeeEmail,
          subject: emailSubject
        })
      });
      
      if (!emailResponse.ok) {
        throw new Error(`Failed to send email to ${designeeEmail}`);
      }
    }
    
    console.log('Alert emails sent successfully to:', alertDesigneeEmails);
  } catch (error) {
    console.error('Failed to send alert email:', error);
    throw new Error('Email sending failed');
  }


  // Update submission to mark alert as sent AND add designees to reader array
  const updateResponse = await fetch(`/dashboard/api/submission/${submission._id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'markAlertSent',
      alertSentBy: user.name,
      alertSentAt: new Date().toISOString(),
      alertDesignees: alertDesignees
    })
  });
  
  if (!updateResponse.ok) {
    throw new Error('Failed to update submission');
  }

  return await updateResponse.json();
}