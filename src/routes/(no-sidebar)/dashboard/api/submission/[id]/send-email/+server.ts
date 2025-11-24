import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BREVO_API_KEY } from '$env/static/private';

// Add this helper function
function formatEmailContent(text: string): string {
  return text.replace(/\n/g, '<br>');
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { emailTemplate, recipientEmail, subject } = await request.json();
    
    // Convert plain text line breaks to HTML
    const htmlContent = formatEmailContent(emailTemplate);
    
    // Use fetch to call Brevo API directly
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'Haven Spec Magazine',
          email: 'editor@havenspec.com'
        },
        to: [
          {
            email: recipientEmail
          }
        ],
        subject: subject,
        htmlContent: htmlContent  // Use the converted HTML instead
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Brevo API error details:', errorText);
      throw new Error(`Brevo API error: ${response.status} - ${errorText}`);
    }
    
    return json({ success: true });
    
  } catch (error) {
    console.error("Error sending email:", error);
    return json({ error: 'Failed to send email' }, { status: 500 });
  }
};