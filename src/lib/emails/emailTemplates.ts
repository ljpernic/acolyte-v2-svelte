import { formatNames, formatTitles, getSubmissionTypeDisplay } from '$lib/utils/emailFormat';

export interface EmailTemplateData {
  authorName: string | string[];
  readerName: string;
  readerRole: string;
  submissionType: string;
  readerSubRole?: string;
  submissionTitle?: string | string[];
}

function getRoleDisplay(role: string): string {
  const roleMap: Record<string, string> = {
    'EIC': 'Editor',
    'assistantEditor': 'Assistant Editor',
    'associateEditor': 'Associate Editor'
  };
  return roleMap[role] || role;
}

export function generateEmailTemplate(
  action: string, 
  data: EmailTemplateData, 
  isAnonymized: boolean = false
): string {
  const { authorName, readerName, readerRole, readerSubRole, submissionType, submissionTitle } = data;

  // Use subRole if it exists, otherwise fall back to role
  const displayRole = readerSubRole || readerRole;

  const signature = isAnonymized 
    ? 'The Editorial Team\nHaven Spec Magazine'
    : `${readerName}, ${getRoleDisplay(displayRole)}\nHaven Spec Magazine`;
  
  // Format the title properly using the utility function
  const formattedTitle = formatTitles(submissionTitle);
  const hasMultipleTitles = Array.isArray(submissionTitle) && submissionTitle.length > 1;
  const typeDisplay = getSubmissionTypeDisplay(submissionType, hasMultipleTitles);
  
  // Format the author name properly using the utility function
  const formattedNames = formatNames(authorName);

  const templates: Record<string, string> = {
    'reject-high': `Dear ${formattedNames},

Thank you again for the submission of your ${typeDisplay} ${formattedTitle} to Haven Spec Magazine. Unfortunately, we have decided to pass on ${hasMultipleTitles ? 'these' : 'this one'}, but we wish you the best of luck on your writing and publishing endeavors. We would be happy to consider anything else you might write.



That's just our subjective opinion, of course, but we appreciated the chance to look at your work, and we hope you send us more.`,

    'reject-middle': `Dear ${formattedNames},

Thank you again for the submission of your ${typeDisplay} ${formattedTitle} to Haven Spec Magazine. Unfortunately, we have decided to pass on ${hasMultipleTitles ? 'these' : 'this one'}, but we wish you the best of luck on your writing and publishing endeavors. We would be happy to consider anything else you might write.`,

    'reject-low': `Dear ${formattedNames},

Thank you again for the submission of your ${typeDisplay} ${formattedTitle} to Haven Spec Magazine. Unfortunately, we have decided to pass on ${hasMultipleTitles ? 'these' : 'this one'}, but we wish you the best of luck on your writing and publishing endeavors.`,

    'recommend-high': `Dear ${formattedNames},

Thank you again for the submission of your ${typeDisplay} ${formattedTitle} to Haven Spec Magazine. This is just a quick note to say that ${hasMultipleTitles ? 'they have' : 'it has'} been held for further consideration. You should hear from us again in the next couple months.`,

    'recommend-middle': `Dear ${formattedNames},

Thank you again for the submission of your ${typeDisplay} ${formattedTitle} to Haven Spec Magazine. This is just a quick note to say that ${hasMultipleTitles ? 'they have' : 'it has'} been held for further consideration. You should hear from us again in the next couple months.`,

    'recommend-low': `Dear ${formattedNames},

Thank you again for the submission of your ${typeDisplay} ${formattedTitle} to Haven Spec Magazine. This is just a quick note to say that ${hasMultipleTitles ? 'they have' : 'it has'} been held for further consideration. You should hear from us again in the next couple months.`,
  };

  const template = templates[action] || `Dear ${formattedNames},\n\nThank you for your submission. If you do not hear from us again in a couple of months, please reach out.\n\n`;
  
  return `${template}\n\nSincerely,\n${signature}`;
}