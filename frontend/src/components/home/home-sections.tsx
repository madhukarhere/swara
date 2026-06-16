import Link from 'next/link';
import { CalendarDays, Quote as QuoteIcon, Play, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SongCard } from '@/components/song-card';
import { categoryName, type Song, type Category, type HomepageData } from '@/lib/types';
import { formatNumber } from '@/lib/utils';

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

export function SongGrid({ songs }: { songs: Song[] }) {
  if (!songs.length) return null;
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {songs.map((s) => (
        <SongCard key={s.id} song={s} />
      ))}
    </div>
  );
}

export function Top5List({ songs }: { songs: Song[] }) {
  if (!songs.length) return null;
  return (
    <Card>
      <CardContent className="divide-y p-2">
        {songs.slice(0, 5).map((s, idx) => (
          <Link key={s.id} href={`/songs/${s.slug}`} className="group flex items-center gap-3 rounded-lg p-2 hover:bg-muted">
            <span className="w-6 text-center font-serif text-xl font-bold text-primary/70">{idx + 1}</span>
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
              {s.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.coverUrl} alt="" className="h-full w-full object-cover" />
              ) : null}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{s.title}</span>
              <span className="block truncate text-xs text-muted-foreground">{categoryName(s.category) || s.singer || ''}</span>
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Play className="h-3 w-3" />
              {formatNumber(s.playCount)}
            </span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

export function CalendarWidget({ today }: { today: HomepageData['today'] }) {
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
    <div className="flex flex-wrap gap-2">
      {categories.map((c) => (
        <Link key={c.id} href={`/songs?category=${c.slug}`}>
          <Badge variant="outline" className="cursor-pointer px-4 py-1.5 text-sm hover:bg-muted">
            {c.name}
            {typeof c.songCount === 'number' ? <span className="ml-1.5 text-muted-foreground">({c.songCount})</span> : null}
          </Badge>
        </Link>
      ))}
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
