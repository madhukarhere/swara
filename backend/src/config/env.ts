import path from 'path';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/** Parse "true"/"false" strings safely (z.coerce.boolean treats "false" as true). */
const boolish = (def: boolean) =>
  z
    .string()
    .optional()
    .transform((v) => (v === undefined ? def : v.toLowerCase() === 'true'));

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/swara'),
  MONGODB_TEST_URI: z.string().default('mongodb://127.0.0.1:27017/swara_test'),

  JWT_SECRET: z.string().min(16).default('dev-only-insecure-secret-change-me-please'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECURE: boolish(false),

  CAPTCHA_SECRET: z.string().min(8).default('dev-only-captcha-secret-change-me'),
  CAPTCHA_TTL_SECONDS: z.coerce.number().int().positive().default(300),

  ADMIN_USERNAME: z.string().default('admin'),
  ADMIN_EMAIL: z.string().default('admin@swara.local'),
  ADMIN_PASSWORD: z.string().default('Admin@12345'),

  DATA_DIR: z.string().default('../data'),
  LOG_DIR: z.string().default('../logs'),
  MAX_UPLOAD_MB: z.coerce.number().int().positive().default(50),

  // ---- Email (SMTP) for admin replies; optional — falls back to logging in dev ----
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: boolish(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('Vijayavipanchi <no-reply@vijayavipanchi.org>'),

  // ---- Cloudinary (optional): when all three are set, uploads + seed media go to
  // Cloudinary instead of local disk (required for persistent media on hosts with an
  // ephemeral filesystem, e.g. Render's free tier). ----
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

const parsed = schema.parse(process.env);

const resolveDir = (p: string) => (path.isAbsolute(p) ? p : path.resolve(process.cwd(), p));

export const env = {
  ...parsed,
  DATA_DIR: resolveDir(parsed.DATA_DIR),
  LOG_DIR: resolveDir(parsed.LOG_DIR),
  isProd: parsed.NODE_ENV === 'production',
  isTest: parsed.NODE_ENV === 'test',
  isDev: parsed.NODE_ENV === 'development',
  useCloudinary: Boolean(parsed.CLOUDINARY_CLOUD_NAME && parsed.CLOUDINARY_API_KEY && parsed.CLOUDINARY_API_SECRET),
};

export type Env = typeof env;
