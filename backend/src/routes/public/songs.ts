import fs from 'fs';
import path from 'path';
import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Song, SongLyrics, SongComment, SongPlay, SongDownload, Category } from '../../models';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate';
import { commentLimiter } from '../../middleware/rateLimit';
import { AppError } from '../../middleware/error';
import { verifyCaptcha } from '../../lib/captcha';
import { cleanText } from '../../lib/sanitize';
import { hashIp, dateBucket } from '../../lib/ip';
import { storagePath } from '../../lib/storage';
import { buildLyricsPdf } from '../../lib/pdf';
import { paginate } from '../../lib/http';
import { serializeSong, serializeLyrics, serializeComment } from '../../serializers';

const router = Router();

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const AUDIO_MIME: Record<string, string> = {
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4',
  '.aac': 'audio/aac',
  '.flac': 'audio/flac',
  '.webm': 'audio/webm',
};
const audioMime = (file: string) => AUDIO_MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';

async function resolveCategoryId(catParam?: string): Promise<unknown | null | undefined> {
  if (!catParam) return undefined;
  if (mongoose.isValidObjectId(catParam)) return catParam;
  const c = await Category.findOne({ slug: catParam.toLowerCase() }).select('_id').lean();
  return c?._id ?? null;
}

async function findSong(idOrSlug: string) {
  const query = mongoose.isValidObjectId(idOrSlug)
    ? { _id: idOrSlug }
    : { slug: idOrSlug.toLowerCase() };
  return Song.findOne(query).populate('category', 'name slug');
}

/* ------------------------------ GET /api/songs ------------------------------ */
const listQuery = z.object({
  q: z.string().trim().max(120).optional(),
  category: z.string().trim().optional(),
  language: z.string().trim().optional(),
  sort: z.enum(['latest', 'most_played']).default('latest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(60).default(12),
});

router.get(
  '/',
  validate({ query: listQuery }),
  asyncHandler(async (req, res) => {
    const { q, category, language, sort, page, limit } = req.valid!.query as z.infer<typeof listQuery>;
    const filter: Record<string, unknown> = { status: 'published' };

    const catId = await resolveCategoryId(category);
    if (catId === null) {
      res.json(paginate([], 0, page, limit));
      return;
    }
    if (catId) filter.category = catId;
    if (language) filter.languages = language;

    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i');
      const lyricSongIds = await SongLyrics.find({ content: rx }).distinct('song');
      filter.$or = [
        { title: rx },
        { singer: rx },
        { composer: rx },
        { lyricist: rx },
        { tags: rx },
        { _id: { $in: lyricSongIds } },
      ];
    }

    const sortSpec: Record<string, 1 | -1> =
      sort === 'most_played' ? { playCount: -1, createdAt: -1 } : { createdAt: -1 };

    const [items, total] = await Promise.all([
      Song.find(filter)
        .sort(sortSpec)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('category', 'name slug')
        .lean(),
      Song.countDocuments(filter),
    ]);

    res.json(paginate(items.map(serializeSong), total, page, limit));
  }),
);

/* --------------------------- GET /api/songs/:id ----------------------------- */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const song = await findSong(req.params.id);
    if (!song) throw new AppError(404, 'Song not found');

    const categoryId = (song.category as { _id?: unknown })?._id ?? song.category;
    const [lyrics, related] = await Promise.all([
      SongLyrics.find({ song: song._id }).sort({ order: 1, createdAt: 1 }).lean(),
      Song.find({ category: categoryId, _id: { $ne: song._id }, status: 'published' })
        .sort({ playCount: -1, createdAt: -1 })
        .limit(6)
        .populate('category', 'name slug')
        .lean(),
    ]);

    res.json({
      ...serializeSong(song),
      lyrics: lyrics.map(serializeLyrics),
      related: related.map(serializeSong),
    });
  }),
);

/* ------------------------ GET /api/songs/:id/lyrics ------------------------- */
router.get(
  '/:id/lyrics',
  asyncHandler(async (req, res) => {
    const song = await findSong(req.params.id);
    if (!song) throw new AppError(404, 'Song not found');
    const lyrics = await SongLyrics.find({ song: song._id }).sort({ order: 1, createdAt: 1 }).lean();
    res.json({ data: lyrics.map(serializeLyrics) });
  }),
);

/* ------------------------ GET /api/songs/:id/related ------------------------ */
router.get(
  '/:id/related',
  asyncHandler(async (req, res) => {
    const song = await findSong(req.params.id);
    if (!song) throw new AppError(404, 'Song not found');
    const categoryId = (song.category as { _id?: unknown })?._id ?? song.category;
    const related = await Song.find({ category: categoryId, _id: { $ne: song._id }, status: 'published' })
      .sort({ playCount: -1 })
      .limit(8)
      .populate('category', 'name slug')
      .lean();
    res.json({ data: related.map(serializeSong) });
  }),
);

/* ------------------------ GET /api/songs/:id/stream ------------------------- */
router.get(
  '/:id/stream',
  asyncHandler(async (req, res) => {
    const song = await findSong(req.params.id);
    if (!song || !song.audioFile) throw new AppError(404, 'Audio not found for this song');

    const filePath = storagePath('songs', path.basename(song.audioFile));
    if (!fs.existsSync(filePath)) throw new AppError(404, 'Audio file is missing on disk');

    const stat = fs.statSync(filePath);
    const range = req.headers.range;
    const contentType = audioMime(song.audioFile);

    // Count a play once per playback start (range absent or starting at byte 0).
    if (!range || /bytes=0-/.test(range)) {
      Song.updateOne({ _id: song._id }, { $inc: { playCount: 1 } }).catch(() => undefined);
      SongPlay.create({ song: song._id, dateBucket: dateBucket(), ipHash: hashIp(req.ip) }).catch(
        () => undefined,
      );
    }

    if (range) {
      const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
      const start = parseInt(startStr, 10) || 0;
      const end = endStr ? parseInt(endStr, 10) : stat.size - 1;
      if (start >= stat.size) {
        res.status(416).set('Content-Range', `bytes */${stat.size}`).end();
        return;
      }
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1,
        'Content-Type': contentType,
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': stat.size,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
      });
      fs.createReadStream(filePath).pipe(res);
    }
  }),
);

/* ----------------------- GET /api/songs/:id/comments ------------------------ */
router.get(
  '/:id/comments',
  asyncHandler(async (req, res) => {
    const song = await findSong(req.params.id);
    if (!song) throw new AppError(404, 'Song not found');
    const comments = await SongComment.find({ song: song._id, status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    const agg = await SongComment.aggregate([
      { $match: { song: song._id, status: 'approved', rating: { $gte: 1 } } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    res.json({
      data: comments.map(serializeComment),
      summary: {
        averageRating: agg[0]?.avg ? Math.round(agg[0].avg * 10) / 10 : null,
        ratingCount: agg[0]?.count ?? 0,
        total: comments.length,
      },
    });
  }),
);

/* ----------------------- POST /api/songs/:id/comments ----------------------- */
const commentBody = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.union([z.string().trim().email().max(160), z.literal('')]).optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  comment: z.string().trim().min(2).max(2000),
  captchaToken: z.string().min(10),
  captchaAnswer: z.string().min(1).max(12),
});

router.post(
  '/:id/comments',
  commentLimiter,
  validate({ body: commentBody }),
  asyncHandler(async (req, res) => {
    const song = await findSong(req.params.id);
    if (!song) throw new AppError(404, 'Song not found');

    const b = req.body as z.infer<typeof commentBody>;
    if (!verifyCaptcha(b.captchaToken, b.captchaAnswer)) {
      throw new AppError(400, 'Incorrect or expired CAPTCHA. Please try again.');
    }

    const created = await SongComment.create({
      song: song._id,
      name: cleanText(b.name),
      email: b.email ? cleanText(b.email) : undefined,
      rating: b.rating,
      comment: cleanText(b.comment),
      status: 'pending',
      ipHash: hashIp(req.ip),
    });

    res.status(201).json({
      message: 'Thank you! Your comment was submitted and is awaiting moderation.',
      id: String(created._id),
    });
  }),
);

/* ----------------------- GET /api/songs/:id/download ------------------------ */
router.get(
  '/:id/download',
  asyncHandler(async (req, res) => {
    const song = await findSong(req.params.id);
    if (!song) throw new AppError(404, 'Song not found');
    const lyrics = await SongLyrics.find({ song: song._id }).sort({ order: 1, createdAt: 1 }).lean();
    if (!lyrics.length) throw new AppError(404, 'No lyrics available to download');

    Song.updateOne({ _id: song._id }, { $inc: { downloadCount: 1 } }).catch(() => undefined);
    SongDownload.create({ song: song._id, type: 'lyrics_pdf', dateBucket: dateBucket() }).catch(
      () => undefined,
    );

    const pdf = await buildLyricsPdf({
      title: song.title,
      meta: [
        { label: 'Singer', value: song.singer },
        { label: 'Composer', value: song.composer },
        { label: 'Lyricist', value: song.lyricist },
      ],
      sections: lyrics.map((l) => ({
        language: l.language,
        languageCode: l.languageCode,
        content: l.content,
      })),
      siteName: 'Vijayavipanchi',
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${song.slug || 'lyrics'}.pdf"`);
    res.send(pdf);
  }),
);

export default router;
