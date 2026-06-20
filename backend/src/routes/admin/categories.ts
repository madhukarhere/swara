import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Category, Song } from '../../models';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate';
import { AppError } from '../../middleware/error';
import { writeAudit } from '../../middleware/audit';
import { uploader, deleteStored } from '../../lib/storage';
import { cleanText } from '../../lib/sanitize';
import { uniqueSlug } from '../../lib/slugify';
import { paginate } from '../../lib/http';
import { serializeCategory } from '../../serializers';

const router = Router();
const coverUpload = uploader('images', 'image').single('cover');
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const listQuery = z.object({
  q: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});

/* GET /api/admin/categories */
router.get(
  '/',
  validate({ query: listQuery }),
  asyncHandler(async (req, res) => {
    const { q, page, limit } = req.valid!.query as z.infer<typeof listQuery>;
    const filter: Record<string, unknown> = {};
    if (q) filter.name = new RegExp(escapeRegex(q), 'i');
    const [cats, total, counts] = await Promise.all([
      Category.find(filter).sort({ order: 1, name: 1 }).skip((page - 1) * limit).limit(limit).lean(),
      Category.countDocuments(filter),
      Song.aggregate([{ $group: { _id: '$category', n: { $sum: 1 } } }]),
    ]);
    const countMap = new Map(counts.map((c: { _id: unknown; n: number }) => [String(c._id), c.n]));
    res.json(
      paginate(
        cats.map((c) => ({ ...serializeCategory(c), songCount: countMap.get(String(c._id)) ?? 0 })),
        total,
        page,
        limit,
      ),
    );
  }),
);

const categoryCreate = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).optional(),
  order: z.coerce.number().int().optional(),
});

/* POST /api/admin/categories */
router.post(
  '/',
  coverUpload,
  validate({ body: categoryCreate }),
  asyncHandler(async (req, res) => {
    const data = req.body as z.infer<typeof categoryCreate>;
    const cover = req.file;
    const slug = await uniqueSlug(data.name, async (s) => Boolean(await Category.exists({ slug: s })), 'category');
    const category = await Category.create({
      name: cleanText(data.name),
      slug,
      description: data.description ? cleanText(data.description) : undefined,
      order: data.order ?? 0,
      coverImage: cover?.filename,
    });
    await writeAudit({ req, action: 'create', entity: 'Category', entityId: String(category._id), meta: { name: category.name } });
    res.status(201).json({ data: serializeCategory(category.toObject()) });
  }),
);

const categoryUpdate = categoryCreate.partial();

/* PUT /api/admin/categories/:id */
router.put(
  '/:id',
  coverUpload,
  validate({ body: categoryUpdate }),
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new AppError(404, 'Category not found');
    const category = await Category.findById(req.params.id);
    if (!category) throw new AppError(404, 'Category not found');
    const data = req.body as z.infer<typeof categoryUpdate>;

    if (data.name !== undefined) category.name = cleanText(data.name);
    if (data.description !== undefined) category.description = cleanText(data.description);
    if (data.order !== undefined) category.order = data.order;
    if (req.file) {
      deleteStored('images', category.coverImage);
      category.coverImage = req.file.filename;
    }

    await category.save();
    await writeAudit({ req, action: 'update', entity: 'Category', entityId: String(category._id) });
    res.json({ data: serializeCategory(category.toObject()) });
  }),
);

/* DELETE /api/admin/categories/:id */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new AppError(404, 'Category not found');
    const category = await Category.findById(req.params.id);
    if (!category) throw new AppError(404, 'Category not found');
    const songCount = await Song.countDocuments({ category: category._id });
    if (songCount > 0) {
      throw new AppError(409, `Cannot delete: ${songCount} song(s) use this category. Reassign them first.`);
    }
    deleteStored('images', category.coverImage);
    await category.deleteOne();
    await writeAudit({ req, action: 'delete', entity: 'Category', entityId: String(category._id), meta: { name: category.name } });
    res.json({ message: 'Category deleted' });
  }),
);

export default router;
