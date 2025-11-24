import { BREVO_API_KEY } from '$env/static/private';

interface EmailOptions {
  to: string;
  subject: string;
  content: string;
  senderName?: string;
  senderEmail?: string;
}

function formatEmailContent(text: string): string {
  return text.replace(/\n/g, '<br>');
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const {
    to,
    subject,
    content,
    senderName = 'Haven Spec Magazine',
    senderEmail = 'editor@havenspec.com'
  } = options;

  const htmlContent = formatEmailContent(content);

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': BREVO_API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: {
        name: senderName,
        email: senderEmail
      },
      to: [{ email: to }],
      subject: subject,
      htmlContent: htmlContent
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Brevo API error details:', errorText);
    throw new Error(`Brevo API error: ${response.status} - ${errorText}`);
  }
}