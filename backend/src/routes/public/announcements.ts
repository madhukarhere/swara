import { Router } from 'express';
import { Announcement } from '../../models';
import { asyncHandler } from '../../middleware/asyncHandler';

const router = Router();

/** Announcements that are active and within their (optional) date window right now. */
const activeWindow = (now: Date) => ({
  isActive: true,
  $and: [
    { $or: [{ startDate: null }, { startDate: { $exists: false } }, { startDate: { $lte: now } }] },
    { $or: [{ endDate: null }, { endDate: { $exists: false } }, { endDate: { $gte: now } }] },
  ],
});

/* GET /api/announcements — active announcements for the site-wide bar */
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const items = await Announcement.find(activeWindow(new Date()))
      .sort({ order: 1, createdAt: -1 })
      .limit(10)
      .lean();
    res.json({ data: items.map((a) => ({ id: String(a._id), message: a.message, link: a.link ?? null })) });
  }),
);

export default router;
