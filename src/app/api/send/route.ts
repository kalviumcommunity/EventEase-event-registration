import { NextRequest } from 'next/server';
import React from 'react';
import resend from '@/lib/resend';
import { render } from '@react-email/components';
import { WelcomeEmail } from '@/components/emails/WelcomeEmail';

/**
 * @swagger
 * /api/send:
 *   post:
 *     summary: Send welcome email
 *     description: Sends a welcome email to the specified recipient using Resend.
 *     tags:
 *       - Email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *             properties:
 *               to:
 *                 type: string
 *                 format: email
 *                 description: Recipient email address
 *               firstName:
 *                 type: string
 *                 description: Recipient's first name (optional, defaults to 'User')
 *     responses:
 *       200:
 *         description: Email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 id:
 *                   type: string
 *       400:
 *         description: Bad Request - Missing recipient email
 *       500:
 *         description: Failed to send email
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, firstName = 'User' } = body;

    if (!to) {
      return new Response(
        JSON.stringify({ error: 'Recipient email is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Send email using Resend client
    const emailElement = React.createElement(WelcomeEmail, { firstName });
    const emailHtml = await render(emailElement);

    const result = await resend.emails.send({
      from: 'EventEase <onboarding@resend.dev>',
      to,
      subject: 'Welcome to EventEase',
      html: emailHtml,
    });

    return new Response(
      JSON.stringify({ success: true, id: result.data?.id }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
