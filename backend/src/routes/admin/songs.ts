import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Song, SongLyrics, SongComment, SongPlay, SongDownload, Category } from '../../models';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate';
import { AppError } from '../../middleware/error';
import { writeAudit } from '../../middleware/audit';
import { songMediaUpload, deleteStored } from '../../lib/storage';
import { cleanText } from '../../lib/sanitize';
import { uniqueSlug } from '../../lib/slugify';
import { paginate } from '../../lib/http';
import { serializeSong, serializeLyrics } from '../../serializers';

const router = Router();

const boolish = z
  .union([z.boolean(), z.string()])
  .transform((v) => v === true || v === 'true' || v === 'on' || v === '1')
  .optional();

const tagsField = z.preprocess(
  (v) => (typeof v === 'string' ? v.split(',').map((s) => s.trim()).filter(Boolean) : v),
  z.array(z.string()).optional(),
);

const songCreate = z.object({
  title: z.string().trim().min(1).max(200),
  category: z.string().refine((v) => mongoose.isValidObjectId(v), 'Invalid category id'),
  singer: z.string().trim().max(160).optional(),
  composer: z.string().trim().max(160).optional(),
  lyricist: z.string().trim().max(160).optional(),
  duration: z.coerce.number().min(0).optional(),
  tags: tagsField,
  status: z.enum(['draft', 'published']).default('published'),
  isFeatured: boolish,
  isTop5: boolish,
  top5Order: z.coerce.number().optional(),
});

const songUpdate = songCreate.partial();

type Files = Record<string, Express.Multer.File[]> | undefined;
const getFiles = (req: { files?: unknown }) => {
  const files = req.files as Files;
  return { audio: files?.audio?.[0], cover: files?.cover?.[0] };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeAdminSong(song: any) {
  return {
    ...serializeSong(song),
    isTop5: Boolean(song.isTop5),
    top5Order: (song.top5Order as number) ?? 0,
  };
}

/* GET /api/admin/songs */
const listQuery = z.object({
  q: z.string().trim().optional(),
  status: z.enum(['draft', 'published', 'all']).default('all'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

router.get(
  '/',
  validate({ query: listQuery }),
  asyncHandler(async (req, res) => {
    const { q, status, page, limit } = req.valid!.query as z.infer<typeof listQuery>;
    const filter: Record<string, unknown> = {};
    if (status !== 'all') filter.status = status;
    if (q) filter.title = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const [items, total] = await Promise.all([
      Song.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('category', 'name slug')
        .lean(),
      Song.countDocuments(filter),
    ]);

    const counts = await SongLyrics.aggregate([
      { $match: { song: { $in: items.map((i) => i._id) } } },
      { $group: { _id: '$song', n: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c: { _id: unknown; n: number }) => [String(c._id), c.n]));

    res.json(
      paginate(
        items.map((s) => ({ ...serializeAdminSong(s), lyricsCount: countMap.get(String(s._id)) ?? 0 })),
        total,
        page,
        limit,
      ),
    );
  }),
);

/* GET /api/admin/songs/:id */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new AppError(404, 'Song not found');
    const song = await Song.findById(req.params.id).populate('category', 'name slug').lean();
    if (!song) throw new AppError(404, 'Song not found');
    const lyrics = await SongLyrics.find({ song: song._id }).sort({ order: 1, createdAt: 1 }).lean();
    res.json({ data: { ...serializeAdminSong(song), lyrics: lyrics.map(serializeLyrics) } });
  }),
);

/* POST /api/admin/songs */
router.post(
  '/',
  songMediaUpload(),
  validate({ body: songCreate }),
  asyncHandler(async (req, res) => {
    const data = req.body as z.infer<typeof songCreate>;
    const { audio, cover } = getFiles(req);

    if (!(await Category.exists({ _id: data.category }))) {
      throw new AppError(400, 'Category does not exist');
    }

    const slug = await uniqueSlug(data.title, async (s) => Boolean(await Song.exists({ slug: s })), 'song');
    const song = await Song.create({
      title: cleanText(data.title),
      slug,
      category: data.category,
      singer: data.singer ? cleanText(data.singer) : undefined,
      composer: data.composer ? cleanText(data.composer) : undefined,
      lyricist: data.lyricist ? cleanText(data.lyricist) : undefined,
      duration: data.duration,
      tags: (data.tags ?? []).map(cleanText),
      status: data.status,
      isFeatured: Boolean(data.isFeatured),
      isTop5: Boolean(data.isTop5),
      top5Order: data.top5Order ?? 0,
      audioFile: audio?.filename,
      coverImage: cover?.filename,
      publishedAt: data.status === 'published' ? new Date() : undefined,
    });

    await writeAudit({ req, action: 'create', entity: 'Song', entityId: String(song._id), meta: { title: song.title } });
    res.status(201).json({ data: serializeAdminSong(song.toObject()) });
  }),
);

/* PUT /api/admin/songs/:id */
router.put(
  '/:id',
  songMediaUpload(),
  validate({ body: songUpdate }),
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new AppError(404, 'Song not found');
    const song = await Song.findById(req.params.id);
    if (!song) throw new AppError(404, 'Song not found');

    const data = req.body as z.infer<typeof songUpdate>;
    const { audio, cover } = getFiles(req);

    if (data.title !== undefined) song.title = cleanText(data.title);
    if (data.category !== undefined) {
      if (!(await Category.exists({ _id: data.category }))) throw new AppError(400, 'Category does not exist');
      song.category = new mongoose.Types.ObjectId(data.category);
    }
    if (data.singer !== undefined) song.singer = cleanText(data.singer);
    if (data.composer !== undefined) song.composer = cleanText(data.composer);
    if (data.lyricist !== undefined) song.lyricist = cleanText(data.lyricist);
    if (data.duration !== undefined) song.duration = data.duration;
    if (data.tags !== undefined) song.tags = data.tags.map(cleanText);
    if (data.isFeatured !== undefined) song.isFeatured = Boolean(data.isFeatured);
    if (data.isTop5 !== undefined) song.isTop5 = Boolean(data.isTop5);
    if (data.top5Order !== undefined) song.top5Order = data.top5Order;
    if (data.status !== undefined) {
      if (data.status === 'published' && song.status !== 'published') song.publishedAt = new Date();
      song.status = data.status;
    }
    if (audio) {
      deleteStored('songs', song.audioFile);
      song.audioFile = audio.filename;
    }
    if (cover) {
      deleteStored('images', song.coverImage);
      song.coverImage = cover.filename;
    }

    await song.save();
    await writeAudit({ req, action: 'update', entity: 'Song', entityId: String(song._id) });
    res.json({ data: serializeAdminSong(song.toObject()) });
  }),
);

/* DELETE /api/admin/songs/:id */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new AppError(404, 'Song not found');
    const song = await Song.findById(req.params.id);
    if (!song) throw new AppError(404, 'Song not found');

    deleteStored('songs', song.audioFile);
    deleteStored('images', song.coverImage);
    await Promise.all([
      SongLyrics.deleteMany({ song: song._id }),
      SongComment.deleteMany({ song: song._id }),
      SongPlay.deleteMany({ song: song._id }),
      SongDownload.deleteMany({ song: song._id }),
    ]);
    await song.deleteOne();

    await writeAudit({ req, action: 'delete', entity: 'Song', entityId: String(song._id), meta: { title: song.title } });
    res.json({ message: 'Song deleted' });
  }),
);

export default router;
