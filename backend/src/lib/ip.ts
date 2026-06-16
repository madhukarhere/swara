import crypto from 'crypto';
import { env } from '../config/env';

/** One-way hash of a client IP (privacy-preserving, used for play/comment de-dup signals). */
export const hashIp = (ip?: string): string | undefined =>
  ip ? crypto.createHash('sha256').update(ip + env.JWT_SECRET).digest('hex').slice(0, 32) : undefined;

/** YYYY-MM-DD bucket for daily analytics aggregation. */
export const dateBucket = (d: Date = new Date()): string => d.toISOString().slice(0, 10);

/** YYYY-MM bucket for monthly analytics aggregation. */
export const monthBucket = (d: Date = new Date()): string => d.toISOString().slice(0, 7);
