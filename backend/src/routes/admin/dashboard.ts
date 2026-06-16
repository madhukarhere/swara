import fs from 'fs';
import { Router } from 'express';
import { Song, Video, Article, EventModel, SongComment, SongPlay, AuditLog } from '../../models';
import { asyncHandler } from '../../middleware/asyncHandler';
import { STORAGE_FOLDERS, storagePath } from '../../lib/storage';
import { dateBucket, monthBucket } from '../../lib/ip';

const router = Router();

function folderUsage() {
  const perFolder: Record<string, { bytes: number; files: number }> = {};
  let totalBytes = 0;
  let totalFiles = 0;
  for (const folder of STORAGE_FOLDERS) {
    let bytes = 0;
    let files = 0;
    try {
      for (const name of fs.readdirSync(storagePath(folder))) {
        try {
          const st = fs.statSync(storagePath(folder, name));
          if (st.isFile()) {
            bytes += st.size;
            files += 1;
          }
        } catch {
          /* ignore unreadable entry */
        }
      }
    } catch {
      /* folder may not exist yet */
    }
    perFolder[folder] = { bytes, files };
    totalBytes += bytes;
    totalFiles += files;
  }
  return { totalBytes, totalFiles, perFolder };
}

/* GET /api/admin/dashboard/stats */
router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const today = dateBucket();
    const month = monthBucket();

    const [songs, videos, articles, events, comments, pendingComments, dailyPlays, monthlyPlays, recentAudit, topSongs] =
      await Promise.all([
        Song.countDocuments(),
        Video.countDocuments(),
        Article.countDocuments(),
        EventModel.countDocuments(),
        SongComment.countDocuments(),
        SongComment.countDocuments({ status: 'pending' }),
        SongPlay.countDocuments({ dateBucket: today }),
        SongPlay.countDocuments({ dateBucket: new RegExp('^' + month) }),
        AuditLog.find().sort({ createdAt: -1 }).limit(8).lean(),
        Song.find().sort({ playCount: -1 }).limit(5).select('title slug playCount').lean(),
      ]);

    res.json({
      totals: { songs, videos, articles, events, comments, pendingComments },
      plays: { daily: dailyPlays, monthly: monthlyPlays },
      storage: folderUsage(),
      topSongs: topSongs.map((s) => ({ id: String(s._id), title: s.title, slug: s.slug, playCount: s.playCount })),
      recentActivity: recentAudit.map((a) => ({
        action: a.action,
        entity: a.entity,
        admin: a.adminUsername ?? null,
        at: a.createdAt,
      })),
    });
  }),
);

export default router;
