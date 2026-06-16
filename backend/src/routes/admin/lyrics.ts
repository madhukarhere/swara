import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Song, SongLyrics } from '../../models';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate';
import { AppError } from '../../middleware/error';
import { writeAudit } from '../../middleware/audit';
import { cleanText } from '../../lib/sanitize';
import { serializeLyrics } from '../../serializers';

const router = Router();

/** Keep Song.languages in sync with its lyric documents (ordered, de-duplicated). */
async function refreshSongLanguages(songId: mongoose.Types.ObjectId | string): Promise<void> {
  const docs = await SongLyrics.find({ song: songId }).sort({ order: 1, createdAt: 1 }).select('language').lean();
  const languages = [...new Set(docs.map((d) => d.language))];
  await Song.updateOne({ _id: songId }, { $set: { languages } });
}

/* GET /api/admin/lyrics?song=:songId */
router.get(
  '/',
  validate({ query: z.object({ song: z.string() }) }),
  asyncHandler(async (req, res) => {
    const { song } = req.valid!.query as { song: string };
    if (!mongoose.isValidObjectId(song)) throw new AppError(400, 'Invalid song id');
    const lyrics = await SongLyrics.find({ song }).sort({ order: 1, createdAt: 1 }).lean();
    res.json({ data: lyrics.map(serializeLyrics) });
  }),
);

const lyricsCreate = z.object({
  song: z.string().refine((v) => mongoose.isValidObjectId(v), 'Invalid song id'),
  language: z.string().trim().min(1).max(60),
  languageCode: z.string().trim().min(1).max(12),
  script: z.string().trim().max(60).optional(),
  content: z.string().min(1).max(20000),
  isDefault: z.boolean().optional(),
  order: z.coerce.number().int().optional(),
});

/* POST /api/admin/lyrics */
router.post(
  '/',
  validate({ body: lyricsCreate }),
  asyncHandler(async (req, res) => {
    const data = req.body as z.infer<typeof lyricsCreate>;
    if (!(await Song.exists({ _id: data.song }))) throw new AppError(400, 'Song does not exist');

    const exists = await SongLyrics.exists({ song: data.song, languageCode: data.languageCode.toLowerCase() });
    if (exists) throw new AppError(409, `Lyrics for "${data.languageCode}" already exist for this song`);

    if (data.isDefault) await SongLyrics.updateMany({ song: data.song }, { $set: { isDefault: false } });

    const lyric = await SongLyrics.create({
      song: data.song,
      language: cleanText(data.language),
      languageCode: data.languageCode.toLowerCase().trim(),
      script: data.script ? cleanText(data.script) : undefined,
      content: cleanText(data.content),
      isDefault: Boolean(data.isDefault),
      order: data.order ?? 0,
    });
    await refreshSongLanguages(data.song);
    await writeAudit({ req, action: 'create', entity: 'SongLyrics', entityId: String(lyric._id), meta: { song: data.song, languageCode: lyric.languageCode } });
    res.status(201).json({ data: serializeLyrics(lyric.toObject()) });
  }),
);

const lyricsUpdate = z.object({
  language: z.string().trim().min(1).max(60).optional(),
  languageCode: z.string().trim().min(1).max(12).optional(),
  script: z.string().trim().max(60).optional(),
  content: z.string().min(1).max(20000).optional(),
  isDefault: z.boolean().optional(),
  order: z.coerce.number().int().optional(),
});

/* PUT /api/admin/lyrics/:id */
router.put(
  '/:id',
  validate({ body: lyricsUpdate }),
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new AppError(404, 'Lyrics not found');
    const lyric = await SongLyrics.findById(req.params.id);
    if (!lyric) throw new AppError(404, 'Lyrics not found');
    const data = req.body as z.infer<typeof lyricsUpdate>;

    if (data.languageCode && data.languageCode.toLowerCase() !== lyric.languageCode) {
      const clash = await SongLyrics.exists({
        song: lyric.song,
        languageCode: data.languageCode.toLowerCase(),
        _id: { $ne: lyric._id },
      });
      if (clash) throw new AppError(409, `Lyrics for "${data.languageCode}" already exist for this song`);
      lyric.languageCode = data.languageCode.toLowerCase().trim();
    }
    if (data.language !== undefined) lyric.language = cleanText(data.language);
    if (data.script !== undefined) lyric.script = cleanText(data.script);
    if (data.content !== undefined) lyric.content = cleanText(data.content);
    if (data.order !== undefined) lyric.order = data.order;
    if (data.isDefault !== undefined) {
      if (data.isDefault) await SongLyrics.updateMany({ song: lyric.song, _id: { $ne: lyric._id } }, { $set: { isDefault: false } });
      lyric.isDefault = data.isDefault;
    }

    await lyric.save();
    await refreshSongLanguages(lyric.song);
    await writeAudit({ req, action: 'update', entity: 'SongLyrics', entityId: String(lyric._id) });
    res.json({ data: serializeLyrics(lyric.toObject()) });
  }),
);

/* DELETE /api/admin/lyrics/:id */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new AppError(404, 'Lyrics not found');
    const lyric = await SongLyrics.findById(req.params.id);
    if (!lyric) throw new AppError(404, 'Lyrics not found');
    const songId = lyric.song;
    await lyric.deleteOne();
    await refreshSongLanguages(songId);
    await writeAudit({ req, action: 'delete', entity: 'SongLyrics', entityId: String(lyric._id) });
    res.json({ message: 'Lyrics deleted' });
  }),
);

export default router;
