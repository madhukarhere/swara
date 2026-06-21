import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSong } from '@/lib/api';
import { SongExperience } from '@/components/song/song-experience';
import { UtilityActions } from '@/components/song/utility-actions';
import { CommentSection } from '@/components/song/comment-section';
import { SongGrid, SectionHeading } from '@/components/home/home-sections';
import { Badge } from '@/components/ui/badge';
import { iconForKey } from '@/components/icons/cultural-icons';
import { categoryName, categorySlug } from '@/lib/types';
import { formatDuration, formatNumber } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function SongDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const song = await getSong(slug);
  if (!song) notFound();

  const cat = categoryName(song.category);
  const Fallback = iconForKey(song.id);

  const meta = [
    { label: 'Composer', value: song.composer },
    { label: 'Lyricist', value: song.lyricist },
    { label: 'Duration', value: song.duration ? formatDuration(song.duration) : null },
    { label: 'Languages', value: song.languages.length ? song.languages.join(', ') : null },
  ].filter((m) => m.value);

  return (
    <div className="container space-y-8 py-8">
      <nav className="text-sm text-muted-foreground">
        <Link href="/songs" className="hover:text-foreground">
          Songs
        </Link>{' '}
        / <span className="text-foreground">{song.title}</span>
      </nav>

      {/* Compact banner — small icon/thumbnail on the left, song name on the right */}
      <div className="flex items-center gap-4 overflow-hidden rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl temple-gradient text-white sm:h-20 sm:w-20">
          {song.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={song.coverUrl} alt={song.title} className="h-full w-full object-cover" />
          ) : (
            <Fallback className="h-8 w-8" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-2xl font-bold leading-tight sm:text-3xl">{song.title}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {cat ? (
              <Link href={`/songs?category=${categorySlug(song.category)}`}>
                <Badge>{cat}</Badge>
              </Link>
            ) : null}
            {song.singer ? <span>{song.singer}</span> : null}
            <span>{formatNumber(song.playCount)} plays</span>
          </div>
        </div>
      </div>

      {/* Meta + utility actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {meta.length ? (
          <dl className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
            {meta.map((m) => (
              <div key={m.label} className="flex gap-1.5">
                <dt className="text-muted-foreground">{m.label}:</dt>
                <dd className="font-medium">{m.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <span />
        )}
        <UtilityActions songId={song.id} title={song.title} />
      </div>

      {/* Player + multi-language lyrics (full width) */}
      <SongExperience songId={song.id} audioUrl={song.audioUrl ?? null} duration={song.duration ?? null} lyrics={song.lyrics} />

      <CommentSection songId={song.id} />

      {song.related.length > 0 ? (
        <section>
          <SectionHeading title="Related Songs" />
          <SongGrid songs={song.related} />
        </section>
      ) : null}
    </div>
  );
}
