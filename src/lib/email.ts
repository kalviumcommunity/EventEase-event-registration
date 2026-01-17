import { Resend } from 'resend';
import React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY!);

export interface SendEmailOptions {
  to: string;
  subject: string;
  html?: string;
  react?: React.ReactNode;
  from?: string;
}

export async function sendEmail(options: SendEmailOptions) {
  const { to, subject, html, react, from = 'EventEase <noreply@eventease.com>' } = options;

  try {
    const emailData: any = {
      from,
      to,
      subject,
    };

    if (react) {
      emailData.react = react;
    } else {
      emailData.html = html;
    }

    const result = await resend.emails.send(emailData);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
