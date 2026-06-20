'use client';

import { useEffect, useState } from 'react';

/**
 * Static cultural imagery dropped into frontend/public/cultural/.
 * Each panel probes whether its image actually loads (client-side) and only
 * renders once confirmed — so a missing file shows nothing (no broken-image
 * box), and the panel appears automatically once the file is added.
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

export function DevotionPanel() {
  const src = '/cultural/bharat-mata.jpg';
  const exists = useImageExists(src);
  if (!exists) return null;
  return (
    <section className="flex animate-fade-in flex-col items-center text-center">
      <div className="overflow-hidden rounded-2xl border-4 border-gold/30 bg-card p-1 shadow-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="Bharat Mata — Mother India" loading="lazy" className="max-h-[460px] w-auto rounded-xl object-contain" />
      </div>
      <p className="mt-4 font-serif text-2xl font-bold text-primary">वन्दे मातरम्</p>
      <p className="text-sm text-muted-foreground">Vande Mataram — in devotion to the Motherland</p>
    </section>
  );
}

export function VeenaBanner() {
  const src = '/cultural/veena.png';
  const exists = useImageExists(src);
  if (!exists) return null;
  return (
    <figure className="flex animate-fade-in flex-col items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="Saraswati veena" loading="lazy" className="max-h-44 w-auto object-contain drop-shadow-lg" />
      <figcaption className="mt-2 text-sm italic text-muted-foreground">
        The veena — the instrument of Goddess Saraswati
      </figcaption>
    </figure>
  );
}
