import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

const skip = () => env.isTest;

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  message: { error: 'Too many attempts. Please try again later.' },
});

export const commentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  message: { error: 'Too many comments submitted. Please slow down.' },
});
