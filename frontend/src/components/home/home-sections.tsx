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

/** Compact "chip" cell for the Panchangam info grid — label above, value below. */
function PanchangCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border bg-card/40 px-2.5 py-1.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate text-sm font-medium text-foreground/90">{children}</p>
    </div>
  );
}

/** Full-width row for multi-part Panchangam values (current + end time + next). */
function PanchangDetailRow({
  label,
  value,
  end,
  next,
}: {
  label: string;
  value: string;
  end?: string;
  next?: string;
}) {
  return (
    <div className="rounded-md border bg-card/40 px-2.5 py-1.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground/90">
        {value}
        {end ? <span className="text-muted-foreground"> · {end}</span> : null}
        {next ? (
          <>
            <span className="text-muted-foreground"> → </span>
            {next}
          </>
        ) : null}
      </p>
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
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="temple-gradient px-5 py-3 text-white">
        <p className="flex items-center gap-2 text-sm font-medium">
          <CalendarDays className="h-4 w-4" /> Today
        </p>
      </div>
      <CardContent className="flex flex-1 flex-col p-5">
        <div className="text-center">
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
        </div>

        {panchang ? (
          <div className="mt-4 flex flex-1 flex-col border-t pt-4">
            <p className="mb-1 text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80">
              తెలుగు పంచాంగం · {panchang.location}
            </p>
            <p className="mb-3 text-center font-serif text-sm font-semibold text-primary">
              {panchang.date} · {panchang.vaara}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <PanchangCell label="సంవత్సరం">{panchang.samvatsara}</PanchangCell>
              <PanchangCell label="అయనం">{panchang.ayana}</PanchangCell>
              <PanchangCell label="రుతువు">{panchang.ritu}</PanchangCell>
              <PanchangCell label="మాసం">{panchang.masa}</PanchangCell>
              <PanchangCell label="పక్షం">{panchang.paksha}</PanchangCell>
              <PanchangCell label="రాహుకాలం">
                {panchang.rahuStart}–{panchang.rahuEnd}
              </PanchangCell>
              <PanchangCell label="సూర్యోదయం">{panchang.sunrise}</PanchangCell>
              <PanchangCell label="సూర్యాస్తమయం">{panchang.sunset}</PanchangCell>
            </div>
            <div className="mt-1.5 space-y-1.5">
              <PanchangDetailRow
                label="తిథి"
                value={panchang.tithi}
                end={panchang.tithiEnd}
                next={panchang.nextTithi}
              />
              <PanchangDetailRow
                label="నక్షత్రం"
                value={panchang.nakshatra}
                end={panchang.nakshatraEnd}
                next={panchang.nextNakshatra}
              />
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
    <Card className="relative flex h-full flex-col overflow-hidden">
      <div className="absolute inset-0 -z-0 opacity-[0.06]">
        <div className="temple-gradient h-full w-full" />
      </div>
      <QuoteIcon className="absolute -left-4 -top-4 h-32 w-32 rotate-6 text-primary/[0.06]" aria-hidden />
      <QuoteIcon className="absolute -bottom-6 -right-4 h-32 w-32 -rotate-180 text-primary/[0.06]" aria-hidden />
      <CardContent className="relative z-10 flex h-full flex-col justify-center p-8 text-center">
        <QuoteIcon className="mx-auto mb-4 h-8 w-8 text-primary/70" />
        <blockquote className="font-serif text-xl italic leading-relaxed sm:text-2xl">
          “{quote.text}”
        </blockquote>
        {quote.author ? (
          <>
            <div className="mx-auto mt-5 h-px w-16 bg-primary/30" />
            <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {quote.author}
            </p>
          </>
        ) : null}
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
