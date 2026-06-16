import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface AdminTokenPayload {
  sub: string;
  username: string;
  role: 'ADMIN';
}

export function signAdminToken(payload: AdminTokenPayload): string {
  const opts: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_SECRET, opts);
}

export function verifyAdminToken(token: string): AdminTokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload & AdminTokenPayload;
  return { sub: decoded.sub as string, username: decoded.username, role: decoded.role };
}
