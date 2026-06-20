import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Quote } from '../../models';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate';
import { AppError } from '../../middleware/error';
import { writeAudit } from '../../middleware/audit';
import { cleanText } from '../../lib/sanitize';
import { serializeQuote } from '../../serializers';

const router = Router();

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
  asyncHandler(async (_req, res) => {
    const quotes = await Quote.find().sort({ createdAt: -1 }).lean();
    res.json({ data: quotes.map(serializeQuote) });
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
