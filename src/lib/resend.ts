import { Resend } from 'resend';

// Ensure the API key exists before initializing
const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  throw new Error('RESEND_API_KEY is not defined in environment variables');
}

// Setup a singleton instance of the Resend client
const resend = new Resend(apiKey);

export default resend;
