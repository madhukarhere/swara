import fs from 'fs';
import path from 'path';
import winston from 'winston';
import { env } from '../config/env';

fs.mkdirSync(env.LOG_DIR, { recursive: true });

const baseFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

/** General application logger -> app.log + error.log */
export const logger = winston.createLogger({
  level: env.isProd ? 'info' : 'debug',
  format: baseFormat,
  silent: env.isTest,
  transports: [
    new winston.transports.File({ filename: path.join(env.LOG_DIR, 'app.log'), maxsize: 5_000_000, maxFiles: 5 }),
    new winston.transports.File({ filename: path.join(env.LOG_DIR, 'error.log'), level: 'error', maxsize: 5_000_000, maxFiles: 5 }),
  ],
});

// Console output in dev (pretty) and prod (so hosts like Render capture logs from
// stdout — file logs live on an ephemeral disk there). Silent in tests.
if (!env.isTest) {
  logger.add(
    new winston.transports.Console({
      format: env.isProd
        ? winston.format.simple()
        : winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  );
}

/** Dedicated audit logger -> audit.log */
export const auditLogger = winston.createLogger({
  level: 'info',
  format: baseFormat,
  silent: env.isTest,
  transports: [new winston.transports.File({ filename: path.join(env.LOG_DIR, 'audit.log'), maxsize: 5_000_000, maxFiles: 10 })],
});

/** Append stream consumed by morgan -> access.log */
export const accessLogStream = fs.createWriteStream(path.join(env.LOG_DIR, 'access.log'), { flags: 'a' });
