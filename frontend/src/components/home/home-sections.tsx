import Link from 'next/link';
import { CalendarDays, Quote as QuoteIcon, Play, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SongCard } from '@/components/song-card';
import { categoryName, type Song, type Category, type HomepageData } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import { iconForKey } from '@/components/icons/cultural-icons';
import { computePanchang } from '@/lib/panchang';

export function SectionHeading({ title, href, icon }: { title: string; href?: string; icon?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <h2 className="flex items-center gap-2 font-serif text-2xl font-bold tracking-tight">
        {icon}
        {title}
      </h2>
      {href ? (
        <Link href={href} className="text-sm font-medium text-primary hover:underline">
          View all →
        </Link>
      ) : null}
    </div>
  );
}

/**
 * Card grid of songs. `limit` caps how many render; pass e.g. 6 for a homepage
 * strip that shows 5 songs on laptop (lg) and 6 on wide screens (xl) — the
 * 6th card is hidden below xl so the row always fills exactly.
 */
export function SongGrid({ songs, limit }: { songs: Song[]; limit?: number }) {
  const list = typeof limit === 'number' ? songs.slice(0, limit) : songs;
  if (!list.length) return null;
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {list.map((s, idx) => (
        <div key={s.id} className={idx === 5 ? 'hidden xl:block' : undefined}>
          <SongCard song={s} />
        </div>
      ))}
    </div>
  );
}

/**
 * Compact list of songs — shared design for Top 5, Featured, Recently Added and
 * Most Played sections. `numbered` shows a rank column (use for ranked lists);
 * `limit` caps how many rows render.
 */
export function SongList({ songs, numbered = false, limit }: { songs: Song[]; numbered?: boolean; limit?: number }) {
  const list = typeof limit === 'number' ? songs.slice(0, limit) : songs;
  if (!list.length) return null;
  return (
    <Card>
      <CardContent className="divide-y p-2">
        {list.map((s, idx) => {
          const Ic = iconForKey(s.id);
          return (
            <Link key={s.id} href={`/songs/${s.slug}`} className="group flex items-center gap-3 rounded-lg p-2 hover:bg-muted">
              {numbered ? <span className="w-6 shrink-0 text-center font-serif text-xl font-bold text-primary/70">{idx + 1}</span> : null}
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                {s.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.coverUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Ic className="h-6 w-6 text-primary/40" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium group-hover:text-primary">{s.title}</span>
                <span className="block truncate text-xs text-muted-foreground">{categoryName(s.category) || s.singer || ''}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                <Play className="h-3 w-3" />
                {formatNumber(s.playCount)}
              </span>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}

/**
 * Compact tile grid — small thumbnail + title per song, packing many songs on
 * screen at once. Used by the songs page grid view (inside its viewport-fit box).
 */
export function SongTileGrid({ songs }: { songs: Song[] }) {
  if (!songs.length) return null;
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {songs.map((s) => {
        const Ic = iconForKey(s.id);
        return (
          <Link
            key={s.id}
            href={`/songs/${s.slug}`}
            className="group flex items-center gap-2.5 rounded-lg border bg-card p-2 transition-colors hover:border-primary/40 hover:bg-muted"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
              {s.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.coverUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <Ic className="h-5 w-5 text-primary/40" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium group-hover:text-primary">{s.title}</span>
              <span className="block truncate text-xs text-muted-foreground">{categoryName(s.category) || s.singer || ''}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
              <Play className="h-3 w-3" />
              {formatNumber(s.playCount)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

/** Two-column "Label : Value" row used inside the Panchangam block. */
function PanchangRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-2 text-sm">
      <span className="min-w-[6.5rem] shrink-0 text-muted-foreground">{label}:</span>
      <span className="min-w-0 text-foreground/90">{children}</span>
    </div>
  );
}

export function CalendarWidget({ today }: { today: HomepageData['today'] }) {
  // Full Drik Panchangam for Tirupati. Safe to call server-side — mhah-panchang
  // is a pure JS lib with no external calls. Wrapped in try/catch so a lib error
  // never breaks the homepage.
  let panchang: ReturnType<typeof computePanchang> | null = null;
  try {
    panchang = computePanchang(new Date(today.iso));
  } catch {
    panchang = null;
  }

  return (
    <Card className="overflow-hidden">
      <div className="temple-gradient px-5 py-3 text-white">
        <p className="flex items-center gap-2 text-sm font-medium">
          <CalendarDays className="h-4 w-4" /> Today
        </p>
      </div>
      <CardContent className="p-5 text-center">
        <p className="text-sm font-medium text-muted-foreground">{today.weekday}</p>
        <p className="font-serif text-3xl font-bold">{today.dateLabel}</p>
        {today.festival ? (
          <div className="mt-3">
            <Badge variant="gold">{today.festival.name}</Badge>
            {today.festival.description ? (
              <p className="mt-2 text-xs text-muted-foreground">{today.festival.description}</p>
            ) : null}
          </div>
        ) : null}

        {panchang ? (
          <div className="mt-4 border-t pt-4 text-left">
            <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground/80">
              తెలుగు పంచాంగం · {panchang.location}
            </p>
            <p className="mb-3 text-center font-serif text-sm font-semibold text-primary">
              తేది: {panchang.date}, {panchang.vaara}
            </p>
            <div className="space-y-1">
              <PanchangRow label="సంవత్సరం">శ్రీ {panchang.samvatsara} నామ సంవత్సరం</PanchangRow>
              <PanchangRow label="అయనం">{panchang.ayana}</PanchangRow>
              <PanchangRow label="రుతువు">{panchang.ritu}</PanchangRow>
              <PanchangRow label="మాసం">{panchang.masa}</PanchangRow>
              <PanchangRow label="పక్షం">{panchang.paksha}</PanchangRow>
              <PanchangRow label="తిథి">
                {panchang.tithi} — {panchang.tithiEnd} <span className="text-muted-foreground">తదుపరి</span> {panchang.nextTithi}
              </PanchangRow>
              <PanchangRow label="నక్షత్రం">
                {panchang.nakshatra} — {panchang.nakshatraEnd} <span className="text-muted-foreground">తదుపరి</span> {panchang.nextNakshatra}
              </PanchangRow>
              <PanchangRow label="రాహుకాలం">
                {panchang.rahuStart} <span className="text-muted-foreground">నుంచి</span> {panchang.rahuEnd} <span className="text-muted-foreground">వరకు</span>
              </PanchangRow>
              <PanchangRow label="సూర్యోదయం">{panchang.sunrise}</PanchangRow>
              <PanchangRow label="సూర్యాస్తమయం">{panchang.sunset}</PanchangRow>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function QuoteCard({ quote }: { quote: HomepageData['quote'] }) {
  if (!quote) return null;
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col justify-center p-6">
        <QuoteIcon className="mb-2 h-6 w-6 text-primary/60" />
        <blockquote className="font-serif text-lg italic leading-relaxed">“{quote.text}”</blockquote>
        {quote.author ? <p className="mt-3 text-sm font-medium text-muted-foreground">— {quote.author}</p> : null}
      </CardContent>
    </Card>
  );
}

export function CategoryChips({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;
  return (
    <div className="flex flex-wrap gap-2.5">
      {categories.map((c) => {
        const Ic = iconForKey(c.id);
        return (
          <Link key={c.id} href={`/songs?category=${c.slug}`}>
            <Badge
              variant="outline"
              className="inline-flex cursor-pointer items-center gap-2 px-4 py-2 text-sm hover:border-primary/40 hover:bg-muted"
            >
              <Ic className="h-4 w-4 text-primary" />
              {c.name}
              {typeof c.songCount === 'number' ? <span className="text-muted-foreground">({c.songCount})</span> : null}
            </Badge>
          </Link>
        );
      })}
    </div>
  );
}

export function FestivalBanner({ banner }: { banner: HomepageData['banner'] }) {
  if (!banner) return null;
  const inner = (
    <div className="relative overflow-hidden rounded-xl border shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={banner.image} alt={banner.title} className="h-32 w-full object-cover sm:h-40" />
    </div>
  );
  return banner.link ? <Link href={banner.link}>{inner}</Link> : inner;
}

export function MiniContentRow({ data }: { data: HomepageData }) {
  const hasContent = data.featuredVideos.length || data.latestArticles.length || data.upcomingEvents.length;
  if (!hasContent) return null;
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {data.upcomingEvents.length ? (
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-3 flex items-center gap-2 font-serif font-semibold">
              <Sparkles className="h-4 w-4 text-primary" /> Upcoming Events
            </h3>
            <ul className="space-y-2 text-sm">
              {data.upcomingEvents.map((e) => (
                <li key={e.id} className="flex flex-col">
                  <span className="font-medium">{e.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(e.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {e.location ? ` · ${e.location}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
      {data.latestArticles.length ? (
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-3 font-serif font-semibold">Latest Articles</h3>
            <ul className="space-y-2 text-sm">
              {data.latestArticles.map((a) => (
                <li key={a.id}>
                  <span className="font-medium">{a.title}</span>
                  {a.excerpt ? <p className="line-clamp-2 text-xs text-muted-foreground">{a.excerpt}</p> : null}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
      {data.featuredVideos.length ? (
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-3 font-serif font-semibold">Featured Videos</h3>
            <ul className="space-y-2 text-sm">
              {data.featuredVideos.map((v) => (
                <li key={v.id}>
                  {v.externalUrl ? (
                    <a href={v.externalUrl} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
                      {v.title}
                    </a>
                  ) : (
                    <span className="font-medium">{v.title}</span>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
