import Link from 'next/link';
import { Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { categoryName, categorySlug, type Song } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import { iconForKey } from '@/components/icons/cultural-icons';

export function SongCard({ song }: { song: Song }) {
  const cat = categoryName(song.category);
  const catSlug = categorySlug(song.category);
  const Fallback = iconForKey(song.id);

  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      {/* Stretched link: clicking anywhere on the card opens the song. */}
      <Link href={`/songs/${song.slug}`} aria-label={song.title} className="absolute inset-0 z-10" />

      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {song.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={song.coverUrl} alt={song.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center temple-gradient text-white">
            <Fallback className="h-4/5 w-4/5 opacity-90" />
          </div>
        )}
        <span className="absolute bottom-2 right-2 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-lg transition-all group-hover:translate-y-0 group-hover:opacity-100">
          <Play className="h-4 w-4 translate-x-0.5 fill-current" />
        </span>
      </div>

      <div className="space-y-1 p-2.5">
        {/* Fixed 2-line height keeps every card the same total height regardless of title length. */}
        <h3
          className="line-clamp-2 min-h-[2.5rem] font-serif text-sm font-semibold leading-tight"
          title={song.title}
        >
          {song.title}
        </h3>
        <div className="flex items-center justify-between gap-2">
          {cat && catSlug ? (
            // Sits above the stretched link so it navigates to the category instead.
            <Link href={`/songs?category=${catSlug}`} className="relative z-20 min-w-0" title={`More from ${cat}`}>
              <Badge variant="muted" className="max-w-full truncate transition-colors hover:bg-primary/10 hover:text-primary">
                {cat}
              </Badge>
            </Link>
          ) : cat ? (
            <Badge variant="muted">{cat}</Badge>
          ) : (
            <span />
          )}
          <span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground">{formatNumber(song.playCount)} plays</span>
        </div>
      </div>
    </div>
  );
}
