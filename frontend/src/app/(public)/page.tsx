import { getHomepage } from '@/lib/api';
import { SearchBar } from '@/components/search-bar';
import { SongCard } from '@/components/song-card';
import { AnnouncementBar } from '@/components/home/announcement-bar';
import { HeroCarousel } from '@/components/home/hero-carousel';
import {
  SectionHeading,
  SongGrid,
  Top5List,
  CalendarWidget,
  QuoteCard,
  CategoryChips,
  FestivalBanner,
  MiniContentRow,
} from '@/components/home/home-sections';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let data;
  try {
    data = await getHomepage();
  } catch {
    return (
      <div className="container py-24 text-center">
        <h1 className="font-serif text-2xl font-bold">Swara is starting up…</h1>
        <p className="mt-2 text-muted-foreground">
          Could not reach the API. Make sure the backend is running on port 4000 and the database is seeded.
        </p>
      </div>
    );
  }

  const enabled = (key: string) => data!.sections.find((s) => s.key === key)?.enabled !== false;

  return (
    <>
      {enabled('announcement') && <AnnouncementBar items={data.announcements} />}
      <div className="container space-y-12 py-8">
        {enabled('hero') && data.heroSlides.length > 0 ? <HeroCarousel slides={data.heroSlides} /> : null}

        {enabled('search') ? (
          <section className="mx-auto max-w-2xl space-y-4 text-center">
            <h1 className="font-serif text-3xl font-bold sm:text-4xl">Discover devotional music &amp; lyrics</h1>
            <p className="text-muted-foreground">
              Keertanas, stotras and bhajans with lyrics in Telugu, Sanskrit, Hindi, English and more.
            </p>
            <SearchBar big />
          </section>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-3">
          {enabled('calendar') ? <CalendarWidget today={data.today} /> : null}
          {enabled('quote') && data.quote ? (
            <div className="lg:col-span-2">
              <QuoteCard quote={data.quote} />
            </div>
          ) : null}
        </div>

        {data.banner ? <FestivalBanner banner={data.banner} /> : null}

        {(enabled('top5') && data.top5.length > 0) || (enabled('featured') && data.featured.length > 0) ? (
          <section className="grid gap-8 lg:grid-cols-2">
            {enabled('top5') && data.top5.length > 0 ? (
              <div>
                <SectionHeading title="Top 5 Songs" />
                <Top5List songs={data.top5} />
              </div>
            ) : null}
            {enabled('featured') && data.featured.length > 0 ? (
              <div>
                <SectionHeading title="Featured" href="/songs" />
                <div className="grid grid-cols-2 gap-4">
                  {data.featured.slice(0, 4).map((s) => (
                    <SongCard key={s.id} song={s} />
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        {enabled('recentlyAdded') && data.recentlyAdded.length > 0 ? (
          <section>
            <SectionHeading title="Recently Added" href="/songs?sort=latest" />
            <SongGrid songs={data.recentlyAdded} />
          </section>
        ) : null}

        {enabled('mostPlayed') && data.mostPlayed.length > 0 ? (
          <section>
            <SectionHeading title="Most Played" href="/songs?sort=most_played" />
            <SongGrid songs={data.mostPlayed} />
          </section>
        ) : null}

        {data.categories.length > 0 ? (
          <section>
            <SectionHeading title="Browse by Category" href="/songs" />
            <CategoryChips categories={data.categories} />
          </section>
        ) : null}

        <MiniContentRow data={data} />
      </div>
    </>
  );
}
