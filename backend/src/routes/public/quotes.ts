import { Router } from 'express';
import { Quote } from '../../models';
import { asyncHandler } from '../../middleware/asyncHandler';

const router = Router();

/* GET /api/quotes — active quotes (featured first) */
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const quotes = await Quote.find({ isActive: true }).sort({ mode: 1, createdAt: -1 }).lean();
    res.json({
      data: quotes.map((q) => ({
        id: String(q._id),
        text: q.text,
        author: q.author ?? null,
        language: q.language ?? null,
        featured: q.mode === 'featured',
      })),
    });
  }),
);

export default router;
