import type { Request, Response, NextFunction } from 'express';
import { verifyAdminToken } from '../lib/jwt';
import { AppError } from './error';

export const ADMIN_COOKIE = 'swara_admin_token';

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  const fromCookie = (req.cookies as Record<string, string> | undefined)?.[ADMIN_COOKIE];
  const header = req.headers.authorization;
  const fromHeader = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  const token = fromCookie || fromHeader;
  if (!token) {
    next(new AppError(401, 'Authentication required'));
    return;
  }
  try {
    req.admin = verifyAdminToken(token);
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired session'));
  }
}
