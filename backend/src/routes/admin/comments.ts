import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { SongComment } from '../../models';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate';
import { AppError } from '../../middleware/error';
import { writeAudit } from '../../middleware/audit';
import { paginate } from '../../lib/http';
import { serializeCommentAdmin } from '../../serializers';

const router = Router();

/* GET /api/admin/comments?status=pending|approved|rejected|all */
const listQuery = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'all']).default('pending'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

router.get(
  '/',
  validate({ query: listQuery }),
  asyncHandler(async (req, res) => {
    const { status, page, limit } = req.valid!.query as z.infer<typeof listQuery>;
    const filter: Record<string, unknown> = {};
    if (status !== 'all') filter.status = status;

    const [items, total, counts] = await Promise.all([
      SongComment.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('song', 'title slug')
        .lean(),
      SongComment.countDocuments(filter),
      SongComment.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
    ]);

    const byStatus = Object.fromEntries(counts.map((c: { _id: string; n: number }) => [c._id, c.n]));
    res.json({
      ...paginate(items.map(serializeCommentAdmin), total, page, limit),
      counts: {
        pending: byStatus.pending ?? 0,
        approved: byStatus.approved ?? 0,
        rejected: byStatus.rejected ?? 0,
      },
    });
  }),
);

/* PATCH /api/admin/comments/:id  { status } */
router.patch(
  '/:id',
  validate({ body: z.object({ status: z.enum(['pending', 'approved', 'rejected']) }) }),
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new AppError(404, 'Comment not found');
    const { status } = req.body as { status: 'pending' | 'approved' | 'rejected' };
    const comment = await SongComment.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('song', 'title slug');
    if (!comment) throw new AppError(404, 'Comment not found');
    await writeAudit({ req, action: `moderate:${status}`, entity: 'SongComment', entityId: String(comment._id) });
    res.json({ data: serializeCommentAdmin(comment.toObject()) });
  }),
);

/* DELETE /api/admin/comments/:id */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new AppError(404, 'Comment not found');
    const comment = await SongComment.findByIdAndDelete(req.params.id);
    if (!comment) throw new AppError(404, 'Comment not found');
    await writeAudit({ req, action: 'delete', entity: 'SongComment', entityId: String(comment._id) });
    res.json({ message: 'Comment deleted' });
  }),
);

export default router;
