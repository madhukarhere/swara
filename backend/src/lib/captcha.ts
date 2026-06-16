import crypto from 'crypto';
import svgCaptcha from 'svg-captcha';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface CaptchaChallenge {
  /** Inline SVG markup of the challenge image. */
  svg: string;
  /** Signed, short-lived token the client must echo back on submit. */
  token: string;
}

function hashAnswer(answer: string): string {
  return crypto
    .createHash('sha256')
    .update(answer.trim().toLowerCase() + env.CAPTCHA_SECRET)
    .digest('hex');
}

/** Sign a short-lived CAPTCHA token for a known answer (used by createCaptcha and tests). */
export function signCaptchaToken(answer: string): string {
  return jwt.sign({ h: hashAnswer(answer) }, env.CAPTCHA_SECRET, {
    expiresIn: env.CAPTCHA_TTL_SECONDS,
  });
}

/** Create a fresh local image CAPTCHA (no third-party service). */
export function createCaptcha(): CaptchaChallenge {
  const c = svgCaptcha.create({
    size: 5,
    noise: 3,
    color: true,
    ignoreChars: '0oO1ilI',
    background: '#fdf6ec',
    width: 170,
    height: 60,
  });
  return { svg: c.data, token: signCaptchaToken(c.text) };
}

/** Constant-time verification of a CAPTCHA answer against its signed token. */
export function verifyCaptcha(token: string | undefined, answer: string | undefined): boolean {
  if (!token || !answer) return false;
  try {
    const decoded = jwt.verify(token, env.CAPTCHA_SECRET) as { h: string };
    const expected = Buffer.from(decoded.h, 'hex');
    const actual = Buffer.from(hashAnswer(answer), 'hex');
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}
