import { Router } from 'express';
import { Category, Song } from '../../models';
import { asyncHandler } from '../../middleware/asyncHandler';
import { serializeCategory } from '../../serializers';

const router = Router();

/* GET /api/categories — visible categories with published-song counts. */
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const [cats, counts] = await Promise.all([
      Category.find({ isVisible: { $ne: false } }).sort({ order: 1, name: 1 }).lean(),
      Song.aggregate([{ $match: { status: 'published' } }, { $group: { _id: '$category', n: { $sum: 1 } } }]),
    ]);
    const countMap = new Map(counts.map((c: { _id: unknown; n: number }) => [String(c._id), c.n]));
    res.json({
      data: cats.map((c) => ({ ...serializeCategory(c), songCount: countMap.get(String(c._id)) ?? 0 })),
    });
  }),
);

export default router;
