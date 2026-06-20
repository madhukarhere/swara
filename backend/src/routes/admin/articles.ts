import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Article } from '../../models';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate';
import { AppError } from '../../middleware/error';
import { writeAudit } from '../../middleware/audit';
import { uploader, deleteStored } from '../../lib/storage';
import { cleanText, cleanRich } from '../../lib/sanitize';
import { uniqueSlug } from '../../lib/slugify';
import { serializeArticle, serializeArticleDetail } from '../../serializers';

const router = Router();
const coverUpload = uploader('article_images', 'image').single('cover');

const tagsField = z.preprocess(
  (v) => (typeof v === 'string' ? v.split(',').map((s) => s.trim()).filter(Boolean) : v),
  z.array(z.string()).optional(),
);

const articleCreate = z.object({
  title: z.string().trim().min(1).max(200),
  excerpt: z.string().trim().max(500).optional(),
  body: z.string().min(1).max(100000),
  author: z.string().trim().max(120).optional(),
  tags: tagsField,
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});
const articleUpdate = articleCreate.partial();

/* GET /api/admin/articles */
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const articles = await Article.find().sort({ createdAt: -1 }).lean();
    res.json({ data: articles.map(serializeArticle) });
  }),
);

/* GET /api/admin/articles/:id */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new AppError(404, 'Article not found');
    const a = await Article.findById(req.params.id).lean();
    if (!a) throw new AppError(404, 'Article not found');
    res.json({ data: serializeArticleDetail(a) });
  }),
);

/* POST /api/admin/articles */
router.post(
  '/',
  coverUpload,
  validate({ body: articleCreate }),
  asyncHandler(async (req, res) => {
    const data = req.body as z.infer<typeof articleCreate>;
    const slug = await uniqueSlug(data.title, async (s) => Boolean(await Article.exists({ slug: s })), 'article');
    const article = await Article.create({
      title: cleanText(data.title),
      slug,
      excerpt: data.excerpt ? cleanText(data.excerpt) : undefined,
      body: cleanRich(data.body),
      author: data.author ? cleanText(data.author) : undefined,
      tags: (data.tags ?? []).map(cleanText),
      status: data.status,
      coverImage: req.file?.filename,
      publishedAt: data.status === 'published' ? new Date() : undefined,
    });
    await writeAudit({ req, action: 'create', entity: 'Article', entityId: String(article._id), meta: { title: article.title } });
    res.status(201).json({ data: serializeArticleDetail(article.toObject()) });
  }),
);

/* PUT /api/admin/articles/:id */
router.put(
  '/:id',
  coverUpload,
  validate({ body: articleUpdate }),
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new AppError(404, 'Article not found');
    const article = await Article.findById(req.params.id);
    if (!article) throw new AppError(404, 'Article not found');
    const data = req.body as z.infer<typeof articleUpdate>;

    if (data.title !== undefined) article.title = cleanText(data.title);
    if (data.excerpt !== undefined) article.excerpt = cleanText(data.excerpt);
    if (data.body !== undefined) article.body = cleanRich(data.body);
    if (data.author !== undefined) article.author = cleanText(data.author);
    if (data.tags !== undefined) article.tags = data.tags.map(cleanText);
    if (data.status !== undefined) {
      if (data.status === 'published' && !article.publishedAt) article.publishedAt = new Date();
      article.status = data.status;
    }
    if (req.file) {
      deleteStored('article_images', article.coverImage);
      article.coverImage = req.file.filename;
    }

    await article.save();
    await writeAudit({ req, action: 'update', entity: 'Article', entityId: String(article._id) });
    res.json({ data: serializeArticleDetail(article.toObject()) });
  }),
);

/* DELETE /api/admin/articles/:id */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new AppError(404, 'Article not found');
    const article = await Article.findById(req.params.id);
    if (!article) throw new AppError(404, 'Article not found');
    deleteStored('article_images', article.coverImage);
    await article.deleteOne();
    await writeAudit({ req, action: 'delete', entity: 'Article', entityId: String(article._id), meta: { title: article.title } });
    res.json({ message: 'Article deleted' });
  }),
);

export default router;
