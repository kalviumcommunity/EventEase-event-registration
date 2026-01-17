import { NextRequest } from 'next/server';
import { sendEmail } from '@/lib/email';
import { sendSuccess, sendError } from '@/lib/responseHandler';
import { WelcomeTemplate } from '@/components/emails/WelcomeTemplate';

export async function POST(req: NextRequest) {
  try {
    const { userEmail, userName } = await req.json();

    if (!userEmail || !userName) {
      return sendError('Missing required fields: userEmail and userName', 'VALIDATION_ERROR', 400);
    }

    // Send welcome email using React template
    const result = await sendEmail({
      to: userEmail,
      subject: 'Welcome to EventEase!',
      react: WelcomeTemplate({ userName }),
    });

    return sendSuccess({ id: result.data?.id }, 'Welcome email sent successfully', 200);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return sendError('Failed to send welcome email', 'EMAIL_ERROR', 500);
  }
}
