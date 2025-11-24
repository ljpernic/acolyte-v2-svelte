import { formatNames, formatTitles, formatTitlesForSubject, getSubmissionTypeDisplay } from '$lib/utils/emailFormat';

export interface SubmissionConfirmationData {
  authorName: string | string[];
  submissionTitle?: string | string[];
  submissionType: string;
  callTitle?: string;
}

export { formatTitlesForSubject };

export function generateSubmissionConfirmation(data: SubmissionConfirmationData): string {
  const { authorName, submissionTitle, submissionType, callTitle } = data;
  
  const formattedNames = formatNames(authorName);
  const titleText = formatTitles(submissionTitle);
  
  const hasMultipleTitles = Array.isArray(submissionTitle) && submissionTitle.length > 1;
  const typeDisplay = getSubmissionTypeDisplay(submissionType, hasMultipleTitles);
  
  const callText = callTitle ? `'s ${callTitle} call` : '';

  return `<div style="font-family: Arial, sans-serif; line-height: 1.4; color: #333; max-width: 600px;">
    Dear ${formattedNames},
    
    Thank you for your ${typeDisplay} submission ${titleText} to Haven Spec Magazine${callText}. We have successfully received it, and it will be reviewed by our editorial team.

    You should hear back from us by the end of this reading period (you can find our schedule on our website at <a href="https://www.havenspec.com/submit" style="color: #0066cc;">havenspec.com/submit</a>). If you haven't heard from us by then (and you've checked your spam folder), feel free to reach out by replying to this email.

    We appreciate your interest in Haven Spec Magazine, and we look forward to reading your work.
    
    Sincerely,
    The Editorial Team
    Haven Spec Magazine

    <a href="https://bsky.app/profile/havenspec.bsky.social" style="color: #0066cc;">havenspec.bsky.social</a>
    </div>`;
}