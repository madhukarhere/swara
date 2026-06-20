import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Announcement } from '../../models';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate';
import { AppError } from '../../middleware/error';
import { writeAudit } from '../../middleware/audit';
import { cleanText } from '../../lib/sanitize';
import { paginate } from '../../lib/http';

const router = Router();
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeAnnouncement(a: any) {
  return {
    id: String(a._id),
    message: a.message,
    link: a.link ?? null,
    isActive: a.isActive ?? true,
    startDate: a.startDate ?? null,
    endDate: a.endDate ?? null,
    order: a.order ?? 0,
  };
}

const optionalDate = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? undefined : v),
  z.coerce.date().optional(),
);

const listQuery = z.object({
  q: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});

const annCreate = z.object({
  message: z.string().trim().min(1).max(500),
  link: z.union([z.string().trim().max(500), z.literal('')]).optional(),
  isActive: z.boolean().optional().default(true),
  startDate: optionalDate,
  endDate: optionalDate,
  order: z.coerce.number().int().optional(),
});
const annUpdate = annCreate.partial();

/* GET /api/admin/announcements */
router.get(
  '/',
  validate({ query: listQuery }),
  asyncHandler(async (req, res) => {
    const { q, page, limit } = req.valid!.query as z.infer<typeof listQuery>;
    const filter: Record<string, unknown> = {};
    if (q) filter.message = new RegExp(escapeRegex(q), 'i');
    const [items, total] = await Promise.all([
      Announcement.find(filter).sort({ order: 1, createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Announcement.countDocuments(filter),
    ]);
    res.json(paginate(items.map(serializeAnnouncement), total, page, limit));
  }),
);

/* POST /api/admin/announcements */
router.post(
  '/',
  validate({ body: annCreate }),
  asyncHandler(async (req, res) => {
    const data = req.body as z.infer<typeof annCreate>;
    const ann = await Announcement.create({
      message: cleanText(data.message),
      link: data.link ? cleanText(data.link) : undefined,
      isActive: data.isActive,
      startDate: data.startDate,
      endDate: data.endDate,
      order: data.order ?? 0,
    });
    await writeAudit({ req, action: 'create', entity: 'Announcement', entityId: String(ann._id) });
    res.status(201).json({ data: serializeAnnouncement(ann.toObject()) });
  }),
);

/* PUT /api/admin/announcements/:id */
router.put(
  '/:id',
  validate({ body: annUpdate }),
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new AppError(404, 'Announcement not found');
    const ann = await Announcement.findById(req.params.id);
    if (!ann) throw new AppError(404, 'Announcement not found');
    const data = req.body as z.infer<typeof annUpdate>;

    if (data.message !== undefined) ann.message = cleanText(data.message);
    if (data.link !== undefined) ann.link = data.link ? cleanText(data.link) : undefined;
    if (data.isActive !== undefined) ann.isActive = data.isActive;
    if (data.startDate !== undefined) ann.startDate = data.startDate;
    if (data.endDate !== undefined) ann.endDate = data.endDate;
    if (data.order !== undefined) ann.order = data.order;

    await ann.save();
    await writeAudit({ req, action: 'update', entity: 'Announcement', entityId: String(ann._id) });
    res.json({ data: serializeAnnouncement(ann.toObject()) });
  }),
);

/* DELETE /api/admin/announcements/:id */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new AppError(404, 'Announcement not found');
    const ann = await Announcement.findByIdAndDelete(req.params.id);
    if (!ann) throw new AppError(404, 'Announcement not found');
    await writeAudit({ req, action: 'delete', entity: 'Announcement', entityId: String(ann._id) });
    res.json({ message: 'Announcement deleted' });
  }),
);

export default router;
