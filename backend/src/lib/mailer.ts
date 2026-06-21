import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env';
import { logger } from './logger';

let transporter: Transporter | null = null;

/** True when real SMTP is configured (SMTP_HOST set). */
export const emailConfigured = (): boolean => Boolean(env.SMTP_HOST);

function getTransporter(): Transporter {
  if (transporter) return transporter;
  if (env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    });
  } else {
    // Dev fallback: don't actually send — serialize the message so the flow works
    // without an SMTP server. Configure SMTP_* in backend/.env to send for real.
    transporter = nodemailer.createTransport({ jsonTransport: true });
  }
  return transporter;
}

export interface SendResult {
  sent: boolean;
}

/** Send (or, without SMTP, log) an email. Never throws for missing config. */
export async function sendMail(opts: { to: string; subject: string; text: string }): Promise<SendResult> {
  const from = env.SMTP_FROM;
  const info = await getTransporter().sendMail({ from, ...opts });
  if (!emailConfigured()) {
    logger.warn('Email NOT sent (SMTP not configured) — set SMTP_* in backend/.env', {
      to: opts.to,
      subject: opts.subject,
    });
    return { sent: false };
  }
  logger.info('Email sent', { to: opts.to, subject: opts.subject, messageId: (info as { messageId?: string }).messageId });
  return { sent: true };
}
