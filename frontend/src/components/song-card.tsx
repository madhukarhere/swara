import Link from 'next/link';
import { Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { categoryName, type Song } from '@/lib/types';
import { formatNumber } from '@/lib/utils';

export function SongCard({ song }: { song: Song }) {
  const cat = categoryName(song.category);
  return (
    <Link href={`/songs/${song.slug}`} className="group block">
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {song.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={song.coverUrl} alt={song.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="flex h-full items-center justify-center temple-gradient font-serif text-4xl text-white">ॐ</div>
          )}
          <span className="absolute bottom-2 right-2 flex h-10 w-10 translate-y-1 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-lg transition-all group-hover:translate-y-0 group-hover:opacity-100">
            <Play className="h-5 w-5 translate-x-0.5 fill-current" />
          </span>
        </div>
        <div className="space-y-1.5 p-3">
          <h3 className="line-clamp-1 font-serif font-semibold leading-tight">{song.title}</h3>
          <p className="line-clamp-1 text-xs text-muted-foreground">{song.singer || song.composer || 'Traditional'}</p>
          <div className="flex items-center justify-between pt-0.5">
            {cat ? <Badge variant="muted">{cat}</Badge> : <span />}
            <span className="text-xs text-muted-foreground">{formatNumber(song.playCount)} plays</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
