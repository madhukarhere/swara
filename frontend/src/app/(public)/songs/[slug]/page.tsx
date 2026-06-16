import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSong } from '@/lib/api';
import { SongExperience } from '@/components/song/song-experience';
import { UtilityActions } from '@/components/song/utility-actions';
import { CommentSection } from '@/components/song/comment-section';
import { SongGrid, SectionHeading } from '@/components/home/home-sections';
import { Badge } from '@/components/ui/badge';
import { categoryName, categorySlug } from '@/lib/types';
import { formatDuration, formatNumber } from '@/lib/utils';

export const dynamic = 'force-dynamic';

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-dashed py-1.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

export default async function SongDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const song = await getSong(slug);
  if (!song) notFound();

  const cat = categoryName(song.category);

  return (
    <div className="container space-y-10 py-8">
      <nav className="text-sm text-muted-foreground">
        <Link href="/songs" className="hover:text-foreground">
          Songs
        </Link>{' '}
        / <span className="text-foreground">{song.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-2xl border bg-muted shadow-sm">
            {song.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={song.coverUrl} alt={song.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center temple-gradient font-serif text-6xl text-white">ॐ</div>
            )}
          </div>
          <div className="space-y-2">
            <h1 className="font-serif text-3xl font-bold leading-tight">{song.title}</h1>
            {cat ? (
              <Link href={`/songs?category=${categorySlug(song.category)}`}>
                <Badge>{cat}</Badge>
              </Link>
            ) : null}
            <dl className="grid grid-cols-1 gap-0.5 pt-2 text-sm">
              {song.singer ? <Meta label="Singer" value={song.singer} /> : null}
              {song.composer ? <Meta label="Composer" value={song.composer} /> : null}
              {song.lyricist ? <Meta label="Lyricist" value={song.lyricist} /> : null}
              {song.duration ? <Meta label="Duration" value={formatDuration(song.duration)} /> : null}
              <Meta label="Plays" value={formatNumber(song.playCount)} />
              {song.languages.length > 0 ? <Meta label="Languages" value={song.languages.join(', ')} /> : null}
            </dl>
          </div>
          <UtilityActions songId={song.id} title={song.title} />
        </div>

        <div className="space-y-8">
          <SongExperience songId={song.id} audioUrl={song.audioUrl ?? null} duration={song.duration ?? null} lyrics={song.lyrics} />
          <CommentSection songId={song.id} />
        </div>
      </div>

      {song.related.length > 0 ? (
        <section>
          <SectionHeading title="Related Songs" />
          <SongGrid songs={song.related} />
        </section>
      ) : null}
    </div>
  );
}
