import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { ContactMessage } from '../../models';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate';
import { AppError } from '../../middleware/error';
import { writeAudit } from '../../middleware/audit';
import { paginate } from '../../lib/http';
import { cleanText } from '../../lib/sanitize';
import { sendMail } from '../../lib/mailer';

const router = Router();
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serialize(c: any) {
  return {
    id: String(c._id),
    name: c.name,
    email: c.email,
    mobile: c.mobile ?? null,
    category: c.category,
    message: c.message,
    status: c.status,
    replyText: c.replyText ?? null,
    repliedAt: c.repliedAt ?? null,
    createdAt: c.createdAt ?? null,
  };
}

/* GET /api/admin/contact */
const listQuery = z.object({
  q: z.string().trim().optional(),
  status: z.enum(['new', 'replied', 'all']).default('all'),
  category: z.enum(['contribute', 'functionality', 'donation', 'all']).default('all'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(15),
});

router.get(
  '/',
  validate({ query: listQuery }),
  asyncHandler(async (req, res) => {
    const { q, status, category, page, limit } = req.valid!.query as z.infer<typeof listQuery>;
    const filter: Record<string, unknown> = {};
    if (status !== 'all') filter.status = status;
    if (category !== 'all') filter.category = category;
    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i');
      filter.$or = [{ name: rx }, { email: rx }, { message: rx }, { mobile: rx }];
    }

    const [items, total, counts] = await Promise.all([
      ContactMessage.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      ContactMessage.countDocuments(filter),
      ContactMessage.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
    ]);
    const byStatus = Object.fromEntries(counts.map((c: { _id: string; n: number }) => [c._id, c.n]));
    res.json({
      ...paginate(items.map(serialize), total, page, limit),
      counts: { new: byStatus.new ?? 0, replied: byStatus.replied ?? 0 },
    });
  }),
);

/* POST /api/admin/contact/:id/reply — email the sender and mark replied */
router.post(
  '/:id/reply',
  validate({ body: z.object({ reply: z.string().trim().min(1).max(5000) }) }),
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new AppError(404, 'Message not found');
    const c = await ContactMessage.findById(req.params.id);
    if (!c) throw new AppError(404, 'Message not found');

    const reply = (req.body as { reply: string }).reply;
    const result = await sendMail({
      to: c.email,
      subject: 'Re: your message to Vijayavipanchi',
      text: `Dear ${c.name},\n\n${reply}\n\n— The Vijayavipanchi team\n\n----------------------------------------\nYour original message (${c.category}):\n${c.message}`,
    });

    c.status = 'replied';
    c.replyText = cleanText(reply);
    c.repliedAt = new Date();
    await c.save();
    await writeAudit({ req, action: 'reply', entity: 'ContactMessage', entityId: String(c._id) });

    res.json({
      data: serialize(c.toObject()),
      sent: result.sent,
      message: result.sent
        ? `Reply emailed to ${c.email}.`
        : `Reply saved. Email was NOT delivered — configure SMTP_* in backend/.env to send replies.`,
    });
  }),
);

/* DELETE /api/admin/contact/:id */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new AppError(404, 'Message not found');
    const c = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!c) throw new AppError(404, 'Message not found');
    await writeAudit({ req, action: 'delete', entity: 'ContactMessage', entityId: String(c._id) });
    res.json({ message: 'Message deleted' });
  }),
);

export default router;
