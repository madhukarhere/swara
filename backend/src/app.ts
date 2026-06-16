import path from 'path';
import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env';
import { accessLogStream } from './lib/logger';
import { ensureStorage, STORAGE_FOLDERS } from './lib/storage';
import { ensureCsrfCookie } from './middleware/csrf';
import { errorHandler, notFound } from './middleware/error';
import { buildApiRouter } from './routes';

export function createApp(): Express {
  ensureStorage();
  const app = express();

  app.set('trust proxy', 1);
  // Allow the Next.js frontend (different origin) to load media files.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(ensureCsrfCookie);
  if (!env.isTest) app.use(morgan('combined', { stream: accessLogStream }));

  // Static media — every public storage folder except backups.
  for (const folder of STORAGE_FOLDERS) {
    if (folder === 'backups') continue;
    app.use(`/media/${folder}`, express.static(path.join(env.DATA_DIR, folder), { maxAge: '1h' }));
  }

  app.use('/api', buildApiRouter());

  app.get('/', (_req, res) => res.json({ name: 'Swara — Cultural Music & Lyrics Portal API', status: 'ok' }));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
