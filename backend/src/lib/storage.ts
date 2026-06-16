import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import { env } from '../config/env';
import { AppError } from '../middleware/error';

export const STORAGE_FOLDERS = [
  'songs',
  'videos',
  'documents',
  'banners',
  'images',
  'article_images',
  'lyrics_pdfs',
  'profile_images',
  'backups',
] as const;

export type StorageFolder = (typeof STORAGE_FOLDERS)[number];

/** Create every media folder if missing. Safe to call repeatedly. */
export function ensureStorage(): void {
  for (const f of STORAGE_FOLDERS) {
    fs.mkdirSync(path.join(env.DATA_DIR, f), { recursive: true });
  }
}

export function storagePath(folder: StorageFolder, filename?: string): string {
  const dir = path.join(env.DATA_DIR, folder);
  return filename ? path.join(dir, filename) : dir;
}

/** URL path the frontend uses to fetch a stored file (served by the /media route). */
export function publicUrl(folder: StorageFolder, filename: string): string {
  return `/media/${folder}/${filename}`;
}

/** Collision-resistant, filesystem-safe filename derived from the original. */
export function makeFilename(original: string): string {
  const ext = path.extname(original).toLowerCase().replace(/[^a-z0-9.]/g, '');
  const base = path
    .basename(original, path.extname(original))
    .replace(/[^a-z0-9_-]/gi, '-')
    .replace(/-+/g, '-')
    .slice(0, 40);
  const rand = crypto.randomBytes(6).toString('hex');
  return `${Date.now()}-${rand}-${base || 'file'}${ext}`;
}

const ALLOWED_MIME: Record<string, string[]> = {
  audio: [
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/wave',
    'audio/ogg', 'audio/mp4', 'audio/aac', 'audio/x-m4a', 'audio/webm', 'audio/flac',
  ],
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
  video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
};

export type UploadKind = keyof typeof ALLOWED_MIME;

/** Build a Multer instance that validates mime/extension and enforces the size cap. */
export function uploader(folder: StorageFolder, kind: UploadKind) {
  ensureStorage();
  return multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, storagePath(folder)),
      filename: (_req, file, cb) => cb(null, makeFilename(file.originalname)),
    }),
    limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024, files: 4 },
    fileFilter: (_req, file, cb) => {
      if (!ALLOWED_MIME[kind].includes(file.mimetype)) {
        cb(new AppError(400, `Unsupported ${kind} file type: ${file.mimetype}`));
        return;
      }
      cb(null, true);
    },
  });
}

/** Delete a stored file by folder + filename; never throws. */
export function deleteStored(folder: StorageFolder, filename?: string | null): void {
  if (!filename) return;
  const fp = storagePath(folder, path.basename(filename));
  fs.promises.unlink(fp).catch(() => undefined);
}

/**
 * Multer instance for the song create/update form: routes the `audio` field to
 * data/songs and the `cover` field to data/images, validating each by type.
 */
export function songMediaUpload() {
  ensureStorage();
  return multer({
    storage: multer.diskStorage({
      destination: (_req, file, cb) =>
        cb(null, storagePath(file.fieldname === 'audio' ? 'songs' : 'images')),
      filename: (_req, file, cb) => cb(null, makeFilename(file.originalname)),
    }),
    limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024, files: 2 },
    fileFilter: (_req, file, cb) => {
      const kind: UploadKind = file.fieldname === 'audio' ? 'audio' : 'image';
      if (!ALLOWED_MIME[kind].includes(file.mimetype)) {
        cb(new AppError(400, `Unsupported ${kind} file type: ${file.mimetype}`));
        return;
      }
      cb(null, true);
    },
  }).fields([
    { name: 'audio', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
  ]);
}
