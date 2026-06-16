import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { AppError } from './error';

export const CSRF_COOKIE = 'swara_csrf';
export const CSRF_HEADER = 'x-csrf-token';

/** Issue a double-submit CSRF cookie (readable by JS) if one is not present. */
export function ensureCsrfCookie(req: Request, res: Response, next: NextFunction): void {
  const cookies = req.cookies as Record<string, string> | undefined;
  let token = cookies?.[CSRF_COOKIE];
  if (!token) {
    token = crypto.randomBytes(24).toString('hex');
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false,
      sameSite: 'lax',
      secure: env.COOKIE_SECURE,
      path: '/',
    });
  }
  res.locals.csrfToken = token;
  next();
}

/** Enforce that the CSRF header matches the cookie on state-changing methods. */
export function requireCsrf(req: Request, _res: Response, next: NextFunction): void {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    next();
    return;
  }
  const cookies = req.cookies as Record<string, string> | undefined;
  const cookieToken = cookies?.[CSRF_COOKIE];
  const headerToken = req.headers[CSRF_HEADER];
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    next(new AppError(403, 'Invalid or missing CSRF token'));
    return;
  }
  next();
}
