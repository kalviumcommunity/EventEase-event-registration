import { Resend } from 'resend';

let resend: Resend | null = null;

export const getResend = async () => {
    if (!resend) {
        const { env } = await import('./env');
        resend = new Resend(env.RESEND_API_KEY);
    }
    return resend;
}


