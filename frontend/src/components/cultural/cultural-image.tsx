'use client';

import { useEffect, useState } from 'react';

/**
 * Static cultural imagery dropped into frontend/public/cultural/.
 * Each image probes whether it actually loads (client-side) and only renders
 * once confirmed — so a missing file shows nothing (no broken-image box), and
 * it appears automatically once the file is added.
 */
function useImageExists(src: string): boolean | null {
  const [exists, setExists] = useState<boolean | null>(null);
  useEffect(() => {
    let active = true;
    const img = new Image();
    img.onload = () => {
      if (active) setExists(true);
    };
    img.onerror = () => {
      if (active) setExists(false);
    };
    img.src = src;
    return () => {
      active = false;
    };
  }, [src]);
  return exists;
}

function DevotionImage({
  src,
  alt,
  title,
  caption,
}: {
  src: string;
  alt: string;
  title: string;
  caption: string;
}) {
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

/**
 * Hero devotion panel: Bharat Mata and the Saraswati veena shown side by side
 * (stacked on mobile). Each image renders only if its file is present.
 */
export function DevotionPanel() {
  const bharat = useImageExists('/cultural/bharat-mata.jpg');
  const veena = useImageExists('/cultural/veena.png');
  if (!bharat && !veena) return null;
  return (
    <section className="flex animate-fade-in flex-col items-center justify-center gap-8 md:flex-row md:items-end md:gap-12">
      {bharat ? (
        <DevotionImage
          src="/cultural/bharat-mata.jpg"
          alt="Bharat Mata — Mother India"
          title="वन्दे मातरम्"
          caption="Vande Mataram — in devotion to the Motherland"
        />
      ) : null}
      {veena ? (
        <DevotionImage
          src="/cultural/veena.png"
          alt="Saraswati veena"
          title="सरस्वती वीणा"
          caption="The veena — the instrument of Goddess Saraswati"
        />
      ) : null}
    </section>
  );
}
