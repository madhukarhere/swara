import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { EventModel } from '../../models';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate';
import { AppError } from '../../middleware/error';
import { writeAudit } from '../../middleware/audit';
import { uploader, deleteStored, publicUrl } from '../../lib/storage';
import { cleanText } from '../../lib/sanitize';
import { uniqueSlug } from '../../lib/slugify';
import { paginate } from '../../lib/http';

const router = Router();
const bannerUpload = uploader('banners', 'image').single('banner');
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const listQuery = z.object({
  q: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeEvent(e: any) {
  return {
    id: String(e._id),
    title: e.title,
    slug: e.slug,
    description: (e.description as string) ?? null,
    startDate: e.startDate,
    endDate: (e.endDate as Date) ?? null,
    location: (e.location as string) ?? null,
    link: (e.link as string) ?? null,
    status: e.status,
    bannerUrl: e.banner ? publicUrl('banners', e.banner as string) : null,
  };
}

const optionalDate = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? undefined : v),
  z.coerce.date().optional(),
);

const eventCreate = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).optional(),
  startDate: z.coerce.date(),
  endDate: optionalDate,
  location: z.string().trim().max(200).optional(),
  link: z.string().trim().max(500).optional(),
  status: z.enum(['draft', 'published']).default('published'),
});
const eventUpdate = eventCreate.partial();

/* GET /api/admin/events */
router.get(
  '/',
  validate({ query: listQuery }),
  asyncHandler(async (req, res) => {
    const { q, page, limit } = req.valid!.query as z.infer<typeof listQuery>;
    const filter: Record<string, unknown> = {};
    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i');
      filter.$or = [{ title: rx }, { location: rx }];
    }
    const [items, total] = await Promise.all([
      EventModel.find(filter).sort({ startDate: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      EventModel.countDocuments(filter),
    ]);
    res.json(paginate(items.map(serializeEvent), total, page, limit));
  }),
);

/* POST /api/admin/events */
router.post(
  '/',
  bannerUpload,
  validate({ body: eventCreate }),
  asyncHandler(async (req, res) => {
    const data = req.body as z.infer<typeof eventCreate>;
    const slug = await uniqueSlug(data.title, async (s) => Boolean(await EventModel.exists({ slug: s })), 'event');
    const event = await EventModel.create({
      title: cleanText(data.title),
      slug,
      description: data.description ? cleanText(data.description) : undefined,
      startDate: data.startDate,
      endDate: data.endDate,
      location: data.location ? cleanText(data.location) : undefined,
      link: data.link,
      status: data.status,
      banner: req.file?.filename,
    });
    await writeAudit({ req, action: 'create', entity: 'Event', entityId: String(event._id), meta: { title: event.title } });
    res.status(201).json({ data: serializeEvent(event.toObject()) });
  }),
);

/* PUT /api/admin/events/:id */
router.put(
  '/:id',
  bannerUpload,
  validate({ body: eventUpdate }),
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new AppError(404, 'Event not found');
    const event = await EventModel.findById(req.params.id);
    if (!event) throw new AppError(404, 'Event not found');
    const data = req.body as z.infer<typeof eventUpdate>;

    if (data.title !== undefined) event.title = cleanText(data.title);
    if (data.description !== undefined) event.description = cleanText(data.description);
    if (data.startDate !== undefined) event.startDate = data.startDate;
    if (data.endDate !== undefined) event.endDate = data.endDate;
    if (data.location !== undefined) event.location = cleanText(data.location);
    if (data.link !== undefined) event.link = data.link;
    if (data.status !== undefined) event.status = data.status;
    if (req.file) {
      deleteStored('banners', event.banner);
      event.banner = req.file.filename;
    }

    await event.save();
    await writeAudit({ req, action: 'update', entity: 'Event', entityId: String(event._id) });
    res.json({ data: serializeEvent(event.toObject()) });
  }),
);

/* DELETE /api/admin/events/:id */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new AppError(404, 'Event not found');
    const event = await EventModel.findById(req.params.id);
    if (!event) throw new AppError(404, 'Event not found');
    deleteStored('banners', event.banner);
    await event.deleteOne();
    await writeAudit({ req, action: 'delete', entity: 'Event', entityId: String(event._id), meta: { title: event.title } });
    res.json({ message: 'Event deleted' });
  }),
);

export default router;
