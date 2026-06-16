import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import multer from 'multer';
import { logger } from '../lib/logger';

export class AppError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Not found' });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(422).json({ error: 'Validation failed', details: err.flatten() });
    return;
  }
  if (err instanceof multer.MulterError) {
    res.status(400).json({ error: `Upload error: ${err.message}` });
    return;
  }
  if (err instanceof AppError) {
    if (err.status >= 500) logger.error(err.message, { stack: err.stack });
    res.status(err.status).json({ error: err.message, details: err.details });
    return;
  }
  const anyErr = err as { code?: number; keyValue?: unknown; message?: string; stack?: string };
  if (anyErr?.code === 11000) {
    res.status(409).json({ error: 'A record with that value already exists', details: anyErr.keyValue });
    return;
  }
  logger.error(anyErr?.message || 'Unhandled error', { stack: anyErr?.stack });
  res.status(500).json({ error: 'Internal server error' });
}
