import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env';
import { logger } from './logger';
import { MailSettings, type IMailSettings } from '../models';

interface EffectiveConfig {
  configured: boolean;
  host?: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from: string;
  replyTo?: string;
  source: 'db' | 'env' | 'none';
}

let cached: { key: string; transporter: Transporter } | null = null;

function buildFrom(name: string | undefined, email: string | undefined): string | undefined {
  if (!email) return undefined;
  const cleanName = (name ?? '').trim();
  return cleanName ? `${cleanName} <${email}>` : email;
}

/**
 * Resolve the effective outbound mail config. DB row (when enabled+host set) wins
 * over env vars. Returns a `configured: false` shape when nothing is set — in that
 * case the mailer falls back to nodemailer's jsonTransport so callers don't crash.
 */
export async function getEffectiveConfig(): Promise<EffectiveConfig> {
  try {
    const row = (await MailSettings.findOne({ singleton: 'singleton' }).lean()) as IMailSettings | null;
    if (row && row.smtpEnabled && row.smtpHost) {
      return {
        configured: true,
        host: row.smtpHost,
        port: row.smtpPort || 587,
        secure: !!row.smtpSecure,
        user: row.smtpUser || undefined,
        pass: row.smtpPass || undefined,
        from: buildFrom(row.fromName, row.fromEmail) || env.SMTP_FROM,
        replyTo: row.replyTo || undefined,
        source: 'db',
      };
    }
  } catch (e) {
    // DB unreachable — fall through to env
    logger.warn('MailSettings lookup failed; falling back to env', { error: (e as Error).message });
  }

  if (env.SMTP_HOST) {
    return {
      configured: true,
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      user: env.SMTP_USER || undefined,
      pass: env.SMTP_PASS || undefined,
      from: env.SMTP_FROM,
      source: 'env',
    };
  }

  return {
    configured: false,
    port: 587,
    secure: false,
    from: env.SMTP_FROM,
    source: 'none',
  };
}

async function getTransporter(): Promise<{ tr: Transporter; cfg: EffectiveConfig }> {
  const cfg = await getEffectiveConfig();
  const key = cfg.configured
    ? `${cfg.host}|${cfg.port}|${cfg.secure}|${cfg.user ?? ''}|${cfg.pass ?? ''}|${cfg.source}`
    : 'jsonTransport';
  if (cached && cached.key === key) return { tr: cached.transporter, cfg };
  const tr = cfg.configured
    ? nodemailer.createTransport({
        host: cfg.host,
        port: cfg.port,
        secure: cfg.secure,
        auth: cfg.user ? { user: cfg.user, pass: cfg.pass } : undefined,
      })
    : nodemailer.createTransport({ jsonTransport: true });
  cached = { key, transporter: tr };
  return { tr, cfg };
}

/** Force the next send to rebuild the transporter (call after saving settings). */
export function invalidateMailerCache(): void {
  cached = null;
}

export const emailConfigured = async (): Promise<boolean> => (await getEffectiveConfig()).configured;

export interface SendResult {
  sent: boolean;
  source: 'db' | 'env' | 'none';
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<SendResult> {
  const { tr, cfg } = await getTransporter();
  const info = await tr.sendMail({
    from: cfg.from,
    replyTo: cfg.replyTo,
    ...opts,
  });
  if (!cfg.configured) {
    logger.warn('Email NOT sent (SMTP not configured) — configure it under Admin → Mail Settings', {
      to: opts.to,
      subject: opts.subject,
    });
    return { sent: false, source: 'none' };
  }
  logger.info('Email sent', {
    to: opts.to,
    subject: opts.subject,
    messageId: (info as { messageId?: string }).messageId,
    source: cfg.source,
  });
  return { sent: true, source: cfg.source };
}

/** Ask SMTP if it accepts our credentials. Returns null on success, error message on failure. */
export async function verifySmtp(): Promise<string | null> {
  const { tr, cfg } = await getTransporter();
  if (!cfg.configured) return 'SMTP not configured';
  try {
    await tr.verify();
    return null;
  } catch (e) {
    return (e as Error).message || 'SMTP verification failed';
  }
}
