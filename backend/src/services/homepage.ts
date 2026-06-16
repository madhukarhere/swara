import { HomepageSettings, type IHomepageSettings } from '../models';

export const DEFAULT_SECTIONS = [
  { key: 'announcement', title: 'Announcement Bar', enabled: true, order: 0 },
  { key: 'hero', title: 'Hero Slider', enabled: true, order: 1 },
  { key: 'search', title: 'Search Bar', enabled: true, order: 2 },
  { key: 'calendar', title: 'Calendar Widget', enabled: true, order: 3 },
  { key: 'quote', title: 'Quote of the Day', enabled: true, order: 4 },
  { key: 'top5', title: 'Top 5 Songs', enabled: true, order: 5 },
  { key: 'featured', title: 'Featured Songs', enabled: true, order: 6 },
  { key: 'recentlyAdded', title: 'Recently Added Songs', enabled: true, order: 7 },
  { key: 'mostPlayed', title: 'Most Played Songs', enabled: true, order: 8 },
  { key: 'featuredVideos', title: 'Featured Videos', enabled: true, order: 9 },
  { key: 'latestArticles', title: 'Latest Articles', enabled: true, order: 10 },
  { key: 'upcomingEvents', title: 'Upcoming Events', enabled: true, order: 11 },
];

/** Fetch the singleton homepage settings, creating it with defaults if absent. */
export async function getOrCreateHomepageSettings(): Promise<IHomepageSettings> {
  let settings = await HomepageSettings.findOne({ singleton: 'singleton' });
  if (!settings) {
    settings = await HomepageSettings.create({ singleton: 'singleton', sections: DEFAULT_SECTIONS });
  }
  return settings;
}
