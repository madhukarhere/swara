import { Router } from 'express';
import {
  Song,
  Category,
  Quote,
  Banner,
  Announcement,
  CalendarEvent,
  Video,
  Article,
  EventModel,
} from '../../models';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getOrCreateHomepageSettings } from '../../services/homepage';
import { serializeSong, serializeCategory } from '../../serializers';
import { publicUrl } from '../../lib/storage';

const router = Router();

function activeWindow(now: Date) {
  return {
    isActive: true,
    $and: [
      { $or: [{ startDate: null }, { startDate: { $exists: false } }, { startDate: { $lte: now } }] },
      { $or: [{ endDate: null }, { endDate: { $exists: false } }, { endDate: { $gte: now } }] },
    ],
  };
}

async function songsByIds(ids: unknown[]) {
  if (!ids?.length) return [];
  const docs = await Song.find({ _id: { $in: ids }, status: 'published' })
    .populate('category', 'name slug')
    .lean();
  const map = new Map(docs.map((d) => [String(d._id), d]));
  return ids.map((id) => map.get(String(id))).filter(Boolean) as typeof docs;
}

/* GET /api/homepage — everything the homepage renders, assembled per settings. */
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const now = new Date();
    const settings = await getOrCreateHomepageSettings();

    // Top 5
    let top5 = await songsByIds(settings.top5Songs);
    if (!top5.length) {
      top5 = await Song.find({ status: 'published', isTop5: true })
        .sort({ top5Order: 1 })
        .limit(5)
        .populate('category', 'name slug')
        .lean();
    }
    if (!top5.length) {
      top5 = await Song.find({ status: 'published' })
        .sort({ playCount: -1 })
        .limit(5)
        .populate('category', 'name slug')
        .lean();
    }

    // Featured
    let featured = await songsByIds(settings.featuredSongs);
    if (!featured.length) {
      featured = await Song.find({ status: 'published', isFeatured: true })
        .sort({ updatedAt: -1 })
        .limit(8)
        .populate('category', 'name slug')
        .lean();
    }

    // Recently added
    const recentlyAdded =
      settings.recentlyAddedMode === 'manual' && settings.recentlyAddedSongs.length
        ? await songsByIds(settings.recentlyAddedSongs)
        : await Song.find({ status: 'published' })
            .sort({ createdAt: -1 })
            .limit(8)
            .populate('category', 'name slug')
            .lean();

    // Most played
    const mostPlayed =
      settings.mostPlayedMode === 'manual' && settings.mostPlayedSongs.length
        ? await songsByIds(settings.mostPlayedSongs)
        : await Song.find({ status: 'published' })
            .sort({ playCount: -1 })
            .limit(8)
            .populate('category', 'name slug')
            .lean();

    // Quote of the day
    let quote = null;
    if (settings.quoteMode === 'manual' && settings.manualQuote) {
      quote = await Quote.findOne({ _id: settings.manualQuote, isActive: true }).lean();
    }
    if (!quote) {
      const sampled = await Quote.aggregate([{ $match: { isActive: true } }, { $sample: { size: 1 } }]);
      quote = sampled[0] ?? null;
    }

    // Announcements + banners
    const [announcements, banners, categories] = await Promise.all([
      Announcement.find(activeWindow(now)).sort({ order: 1, createdAt: -1 }).limit(10).lean(),
      Banner.find(activeWindow(now)).sort({ order: 1, createdAt: -1 }).lean(),
      Category.find({ isVisible: { $ne: false } }).sort({ order: 1 }).limit(12).lean(),
    ]);

    // Today / calendar festival
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const calMatches = await CalendarEvent.find({ month, day }).lean();
    const todayFestival =
      calMatches.find((c) => c.year === now.getFullYear()) ??
      calMatches.find((c) => c.year === undefined || c.year === null) ??
      calMatches[0] ??
      null;

    // Pick the most relevant banner (today's festival, else first active)
    const banner =
      (todayFestival && banners.find((b) => b.festivalKey === todayFestival.festivalKey)) ||
      banners[0] ||
      null;

    // Latest content (videos/articles/events) — used by later phases, surfaced now if present
    const [featuredVideos, latestArticles, upcomingEvents] = await Promise.all([
      Video.find({ status: 'published', isFeatured: true }).sort({ createdAt: -1 }).limit(6).lean(),
      Article.find({ status: 'published' }).sort({ publishedAt: -1, createdAt: -1 }).limit(4).lean(),
      EventModel.find({ status: 'published', startDate: { $gte: now } }).sort({ startDate: 1 }).limit(6).lean(),
    ]);

    res.json({
      sections: settings.sections.sort((a, b) => a.order - b.order),
      heroSlides: settings.heroSlides.map((h) => ({
        title: h.title,
        subtitle: h.subtitle ?? null,
        image: h.image?.startsWith('http') ? h.image : publicUrl('banners', h.image),
        link: h.link ?? null,
      })),
      announcements: announcements.map((a) => ({ id: String(a._id), message: a.message, link: a.link ?? null })),
      banner: banner
        ? {
            id: String(banner._id),
            festivalKey: banner.festivalKey,
            title: banner.title,
            subtitle: banner.subtitle ?? null,
            image: banner.image?.startsWith('http') ? banner.image : publicUrl('banners', banner.image),
            link: banner.link ?? null,
          }
        : null,
      today: {
        iso: now.toISOString(),
        weekday: now.toLocaleDateString('en-US', { weekday: 'long' }),
        dateLabel: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        festival: todayFestival
          ? {
              name: todayFestival.name,
              festivalKey: todayFestival.festivalKey ?? null,
              description: todayFestival.description ?? null,
            }
          : null,
      },
      quote: quote ? { text: quote.text, author: quote.author ?? null, language: quote.language ?? null } : null,
      top5: top5.map(serializeSong),
      featured: featured.map(serializeSong),
      recentlyAdded: recentlyAdded.map(serializeSong),
      mostPlayed: mostPlayed.map(serializeSong),
      categories: categories.map(serializeCategory),
      featuredVideos: featuredVideos.map((v) => ({
        id: String(v._id),
        title: v.title,
        slug: v.slug,
        thumbnail: v.thumbnail ? publicUrl('videos', v.thumbnail) : null,
        externalUrl: v.externalUrl ?? null,
      })),
      latestArticles: latestArticles.map((a) => ({
        id: String(a._id),
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt ?? null,
        coverUrl: a.coverImage ? publicUrl('article_images', a.coverImage) : null,
        publishedAt: a.publishedAt ?? a.createdAt,
      })),
      upcomingEvents: upcomingEvents.map((e) => ({
        id: String(e._id),
        title: e.title,
        slug: e.slug,
        startDate: e.startDate,
        location: e.location ?? null,
      })),
    });
  }),
);

export default router;
