/**
 * Hero devotion panel: two side-by-side (or stacked) devotional images.
 * Data comes from the CMS via the homepage API response — admin can upload
 * images and edit the titles/captions from Admin → Homepage.
 *
 * Falls back to the bundled static images under `/cultural/*` when the CMS
 * has no image set, so a fresh install still shows Bharat Mata + Veena.
 */

interface PanelPiece {
  image: string | null;
  title: string;
  caption: string;
}

interface DevotionPanelProps {
  enabled?: boolean;
  left?: PanelPiece;
  right?: PanelPiece;
}

function DevotionImage({ src, alt, title, caption }: { src: string; alt: string; title: string; caption: string }) {
  return (
    <figure className="flex flex-col items-center text-center">
      <div className="grid place-items-center overflow-hidden rounded-2xl border-4 border-gold/30 bg-card p-2 shadow-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" className="max-h-[380px] w-auto max-w-full rounded-xl object-contain" />
      </div>
      <figcaption className="mt-4">
        <p className="font-serif text-2xl font-bold text-primary">{title}</p>
        <p className="text-sm text-muted-foreground">{caption}</p>
      </figcaption>
    </figure>
  );
}

export function DevotionPanel({ enabled = true, left, right }: DevotionPanelProps) {
  if (!enabled) return null;

  const leftSrc = left?.image || '/cultural/bharat-mata.jpg';
  const rightSrc = right?.image || '/cultural/veena.png';
  const leftTitle = left?.title || 'वन्दे मातरम्';
  const leftCaption = left?.caption || 'Vande Mataram — in devotion to the Motherland';
  const rightTitle = right?.title || 'सरस्वती वीणा';
  const rightCaption = right?.caption || 'The veena — the instrument of Goddess Saraswati';

  return (
    <section className="flex animate-fade-in flex-col items-center justify-center gap-8 md:flex-row md:items-end md:gap-12">
      <DevotionImage src={leftSrc} alt="Bharat Mata — Mother India" title={leftTitle} caption={leftCaption} />
      <DevotionImage src={rightSrc} alt="Saraswati veena" title={rightTitle} caption={rightCaption} />
    </section>
  );
}
