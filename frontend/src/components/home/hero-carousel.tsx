'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Slide {
  title: string;
  subtitle?: string | null;
  image: string;
  link?: string | null;
}

export function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  if (!slides.length) return null;
  const s = slides[i % slides.length];

  return (
    <div className="relative overflow-hidden rounded-2xl border shadow-sm">
      <div className="relative aspect-[16/7] min-h-[220px] w-full bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={s.image} alt={s.title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />
        <div className="absolute inset-0 flex max-w-xl flex-col justify-center gap-3 p-6 text-white sm:p-10">
          <h2 className="font-serif text-2xl font-bold sm:text-4xl">{s.title}</h2>
          {s.subtitle ? <p className="text-sm text-white/85 sm:text-lg">{s.subtitle}</p> : null}
          {s.link ? (
            <Link href={s.link}>
              <Button variant="accent" className="w-fit">
                Explore
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
      {slides.length > 1 ? (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {slides.map((_, n) => (
            <button
              key={n}
              aria-label={`Slide ${n + 1}`}
              onClick={() => setI(n)}
              className={`h-2 rounded-full transition-all ${n === i ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
