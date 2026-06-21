import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { Request } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
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

const USE_CLOUDINARY = env.useCloudinary;
if (USE_CLOUDINARY) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/** Create every media folder if missing. Safe to call repeatedly. (No-op in cloud mode.) */
export function ensureStorage(): void {
  if (USE_CLOUDINARY) return;
  for (const f of STORAGE_FOLDERS) {
    fs.mkdirSync(path.join(env.DATA_DIR, f), { recursive: true });
  }
}

export function storagePath(folder: StorageFolder, filename?: string): string {
  const dir = path.join(env.DATA_DIR, folder);
  return filename ? path.join(dir, filename) : dir;
}

/**
 * URL the frontend uses to fetch a stored file. A locally-stored file is served by
 * the /media route; a Cloudinary-stored file is already an absolute URL, returned as-is.
 */
export function publicUrl(folder: StorageFolder, filename: string): string {
  if (/^https?:\/\//i.test(filename)) return filename;
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
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml'],
  video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
};

export type UploadKind = keyof typeof ALLOWED_MIME;

function cloudinaryResourceType(kind: UploadKind): 'image' | 'video' | 'raw' {
  if (kind === 'image') return 'image';
  if (kind === 'audio' || kind === 'video') return 'video';
  return 'raw';
}

/** The upload kind (validation + Cloudinary resource type) implied by a storage folder. */
function kindForFolder(folder: StorageFolder): UploadKind {
  if (folder === 'songs') return 'audio';
  if (folder === 'videos') return 'video';
  if (folder === 'documents' || folder === 'lyrics_pdfs') return 'document';
  return 'image'; // images, banners, article_images, profile_images
}

/**
 * Persist a buffer and return a reference to store on the model:
 *   - Cloudinary mode → the absolute secure URL.
 *   - Local mode      → a filesystem-safe filename served by the /media route.
 * Used by both runtime uploads (via the multer engine below) and the seed script.
 */
export async function storeBuffer(
  folder: StorageFolder,
  originalname: string,
  buffer: Buffer,
  kind: UploadKind = kindForFolder(folder),
): Promise<string> {
  if (USE_CLOUDINARY) {
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `vijayavipanchi/${folder}`, resource_type: cloudinaryResourceType(kind) },
        (err, res) => (err || !res ? reject(err ?? new Error('Cloudinary upload failed')) : resolve(res as { secure_url: string })),
      );
      stream.end(buffer);
    });
    return result.secure_url;
  }
  ensureStorage();
  const filename = makeFilename(originalname);
  await fs.promises.writeFile(storagePath(folder, filename), buffer);
  return filename;
}

/**
 * Multer storage engine: buffers the upload stream then persists it via storeBuffer
 * (Cloudinary or local disk). Sets `file.filename` to the stored reference so route
 * handlers can keep using `file.filename` unchanged.
 */
class HybridStorage implements multer.StorageEngine {
  constructor(private readonly resolveFolder: (file: Express.Multer.File) => StorageFolder) {}

  _handleFile(
    _req: Request,
    file: Express.Multer.File,
    cb: (error?: unknown, info?: Partial<Express.Multer.File>) => void,
  ): void {
    const folder = this.resolveFolder(file);
    const chunks: Buffer[] = [];
    let limited = false;
    file.stream.on('data', (c: Buffer) => chunks.push(c));
    file.stream.on('limit', () => {
      limited = true;
      cb(new AppError(400, `File too large (max ${env.MAX_UPLOAD_MB}MB)`));
    });
    file.stream.on('error', (err) => {
      if (!limited) cb(err);
    });
    file.stream.on('end', () => {
      if (limited) return;
      const buffer = Buffer.concat(chunks);
      storeBuffer(folder, file.originalname, buffer)
        .then((ref) => cb(null, { filename: ref, size: buffer.length }))
        .catch((err) => cb(err));
    });
  }

  _removeFile(_req: Request, file: Express.Multer.File & { filename?: string }, cb: (error: Error | null) => void): void {
    deleteStored(this.resolveFolder(file), file.filename);
    cb(null);
  }
}

/** Build a Multer instance that validates mime/extension and enforces the size cap. */
export function uploader(folder: StorageFolder, kind: UploadKind) {
  return multer({
    storage: new HybridStorage(() => folder),
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

/**
 * Multer instance for the song create/update form: routes the `audio` field to the
 * songs folder and the `cover` field to images, validating each by type.
 */
export function songMediaUpload() {
  return multer({
    storage: new HybridStorage((file) => (file.fieldname === 'audio' ? 'songs' : 'images')),
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

/** Parse a Cloudinary delivery URL into the public_id + resource_type needed to delete it. */
function parseCloudinaryUrl(url: string): { publicId: string; resourceType: 'image' | 'video' | 'raw' } | null {
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean); // [cloud, type, upload, v123?, ...folders, file.ext]
    const uploadIdx = parts.indexOf('upload');
    if (uploadIdx < 1) return null;
    const resourceType = parts[uploadIdx - 1] as 'image' | 'video' | 'raw';
    let rest = parts.slice(uploadIdx + 1);
    if (rest[0] && /^v\d+$/.test(rest[0])) rest = rest.slice(1); // drop version segment
    const last = (rest.pop() ?? '').replace(/\.[^.]+$/, '');
    const publicId = [...rest, last].join('/');
    return publicId ? { publicId, resourceType } : null;
  } catch {
    return null;
  }
}

/** Delete a stored file by folder + reference (local filename or Cloudinary URL); never throws. */
export function deleteStored(folder: StorageFolder, filename?: string | null): void {
  if (!filename) return;
  if (/^https?:\/\//i.test(filename)) {
    const parsed = parseCloudinaryUrl(filename);
    if (parsed) {
      cloudinary.uploader.destroy(parsed.publicId, { resource_type: parsed.resourceType }).catch(() => undefined);
    }
    return;
  }
  fs.promises.unlink(storagePath(folder, path.basename(filename))).catch(() => undefined);
}
