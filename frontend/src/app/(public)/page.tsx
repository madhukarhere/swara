import { getHomepage } from '@/lib/api';
import {
  SectionHeading,
  SongGrid,
  SongList,
  CalendarWidget,
  QuoteCard,
  CategoryChips,
  FestivalBanner,
  MiniContentRow,
} from '@/components/home/home-sections';
import { MotifDivider, InstrumentBand } from '@/components/cultural/motif';
import { DevotionPanel } from '@/components/cultural/cultural-image';
import { Veena, Diya, Bansuri, Tabla, Lotus } from '@/components/icons/cultural-icons';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let data;
  try {
    data = await getHomepage();
  } catch {
    return (
      <div className="container py-24 text-center">
        <h1 className="font-serif text-2xl font-bold">Vijayavipanchi is starting up…</h1>
        <p className="mt-2 text-muted-foreground">
          Could not reach the API. Make sure the backend is running on port 4000 and the database is seeded.
        </p>
      </div>
    );
  }

  const enabled = (key: string) => data!.sections.find((s) => s.key === key)?.enabled !== false;

  return (
    <>
      <div className="container space-y-12 py-8 motif-bg">
        <DevotionPanel />

        <MotifDivider />

        {/* Recently Added — first section, card grid */}
        {enabled('recentlyAdded') && data.recentlyAdded.length > 0 ? (
          <section>
            <SectionHeading title="Recently Added" href="/songs?sort=latest" icon={<Bansuri className="h-6 w-6 text-primary" />} />
            <SongGrid songs={data.recentlyAdded} limit={6} />
          </section>
        ) : null}

        {enabled('featured') && data.featured.length > 0 ? (
          <section>
            <SectionHeading title="Featured" href="/songs" icon={<Diya className="h-6 w-6 text-primary" />} />
            <SongList songs={data.featured} limit={6} />
          </section>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          {enabled('calendar') ? <CalendarWidget today={data.today} /> : null}
          {enabled('quote') && data.quote ? <QuoteCard quote={data.quote} /> : null}
        </div>

        {/* Admin-curated picks beside Most Played — moved below the calendar/quote row */}
        {(enabled('top5') && data.top5.length > 0) || (enabled('mostPlayed') && data.mostPlayed.length > 0) ? (
          <section className="grid gap-8 lg:grid-cols-2">
            {enabled('top5') && data.top5.length > 0 ? (
              <div>
                <SectionHeading title="Editor’s Picks" icon={<Veena className="h-6 w-6 text-primary" />} />
                <SongList songs={data.top5} numbered limit={5} />
              </div>
            ) : null}
            {enabled('mostPlayed') && data.mostPlayed.length > 0 ? (
              <div>
                <SectionHeading title="Most Played" href="/songs?sort=most_played" icon={<Tabla className="h-6 w-6 text-primary" />} />
                <SongList songs={data.mostPlayed} numbered limit={5} />
              </div>
            ) : null}
          </section>
        ) : null}

        {data.banner ? <FestivalBanner banner={data.banner} /> : null}

        {data.categories.length > 0 ? (
          <section>
            <SectionHeading title="Browse by Category" href="/songs" icon={<Lotus className="h-6 w-6 text-primary" />} />
            <CategoryChips categories={data.categories} />
          </section>
        ) : null}

        <section className="space-y-6">
          <MotifDivider />
          <InstrumentBand />
        </section>

        <MiniContentRow data={data} />
      </div>
    </>
  );
}
