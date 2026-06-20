import { Router } from 'express';
import { z } from 'zod';
import { Article } from '../../models';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate';
import { AppError } from '../../middleware/error';
import { paginate } from '../../lib/http';
import { serializeArticle, serializeArticleDetail } from '../../serializers';

const router = Router();
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const listQuery = z.object({
  q: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

/* GET /api/articles — published, paginated, searchable */
router.get(
  '/',
  validate({ query: listQuery }),
  asyncHandler(async (req, res) => {
    const { q, page, limit } = req.valid!.query as z.infer<typeof listQuery>;
    const filter: Record<string, unknown> = { status: 'published' };
    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i');
      filter.$or = [{ title: rx }, { excerpt: rx }, { body: rx }, { tags: rx }];
    }
    const [items, total] = await Promise.all([
      Article.find(filter).sort({ publishedAt: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Article.countDocuments(filter),
    ]);
    res.json(paginate(items.map(serializeArticle), total, page, limit));
  }),
);

/* GET /api/articles/:slug — a single published article */
router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const article = await Article.findOne({ slug: req.params.slug.toLowerCase(), status: 'published' }).lean();
    if (!article) throw new AppError(404, 'Article not found');
    res.json(serializeArticleDetail(article));
  }),
);

export default router;
