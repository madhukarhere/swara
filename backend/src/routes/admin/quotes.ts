import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Quote } from '../../models';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate';
import { AppError } from '../../middleware/error';
import { writeAudit } from '../../middleware/audit';
import { cleanText } from '../../lib/sanitize';
import { paginate } from '../../lib/http';
import { serializeQuote } from '../../serializers';

const router = Router();
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const listQuery = z.object({
  q: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});

const quoteCreate = z.object({
  text: z.string().trim().min(1).max(1000),
  author: z.string().trim().max(160).optional(),
  language: z.string().trim().max(60).optional(),
  mode: z.enum(['random', 'featured']).default('random'),
  isActive: z.boolean().optional().default(true),
});
const quoteUpdate = quoteCreate.partial();

/* GET /api/admin/quotes */
router.get(
  '/',
  validate({ query: listQuery }),
  asyncHandler(async (req, res) => {
    const { q, page, limit } = req.valid!.query as z.infer<typeof listQuery>;
    const filter: Record<string, unknown> = {};
    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i');
      filter.$or = [{ text: rx }, { author: rx }];
    }
    const [items, total] = await Promise.all([
      Quote.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Quote.countDocuments(filter),
    ]);
    res.json(paginate(items.map(serializeQuote), total, page, limit));
  }),
);

/* POST /api/admin/quotes */
router.post(
  '/',
  validate({ body: quoteCreate }),
  asyncHandler(async (req, res) => {
    const data = req.body as z.infer<typeof quoteCreate>;
    const quote = await Quote.create({
      text: cleanText(data.text),
      author: data.author ? cleanText(data.author) : undefined,
      language: data.language ? cleanText(data.language) : undefined,
      mode: data.mode,
      isActive: data.isActive,
    });
    await writeAudit({ req, action: 'create', entity: 'Quote', entityId: String(quote._id) });
    res.status(201).json({ data: serializeQuote(quote.toObject()) });
  }),
);

/* PUT /api/admin/quotes/:id */
router.put(
  '/:id',
  validate({ body: quoteUpdate }),
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new AppError(404, 'Quote not found');
    const quote = await Quote.findById(req.params.id);
    if (!quote) throw new AppError(404, 'Quote not found');
    const data = req.body as z.infer<typeof quoteUpdate>;
    if (data.text !== undefined) quote.text = cleanText(data.text);
    if (data.author !== undefined) quote.author = cleanText(data.author);
    if (data.language !== undefined) quote.language = cleanText(data.language);
    if (data.mode !== undefined) quote.mode = data.mode;
    if (data.isActive !== undefined) quote.isActive = data.isActive;
    await quote.save();
    await writeAudit({ req, action: 'update', entity: 'Quote', entityId: String(quote._id) });
    res.json({ data: serializeQuote(quote.toObject()) });
  }),
);

/* DELETE /api/admin/quotes/:id */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new AppError(404, 'Quote not found');
    const quote = await Quote.findByIdAndDelete(req.params.id);
    if (!quote) throw new AppError(404, 'Quote not found');
    await writeAudit({ req, action: 'delete', entity: 'Quote', entityId: String(quote._id) });
    res.json({ message: 'Quote deleted' });
  }),
);

export default router;
