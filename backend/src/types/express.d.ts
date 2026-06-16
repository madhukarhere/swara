import 'express';
import type { AdminTokenPayload } from '../lib/jwt';

declare global {
  namespace Express {
    interface Request {
      admin?: AdminTokenPayload;
      valid?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
    }
  }
}
