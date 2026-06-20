'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Megaphone, ExternalLink } from 'lucide-react';

export function AnnouncementBar({ items }: { items: { id: string; message: string; link?: string | null }[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setI((p) => (p + 1) % items.length), 5000);
    return () => clearInterval(t);
  }, [items.length]);

  if (!items.length) return null;
  const a = items[i % items.length];

  const link = a.link?.trim() || null;
  const isInternal = !!link && link.startsWith('/');
  const href = link ? (isInternal || /^https?:\/\//i.test(link) ? link : `https://${link}`) : null;

  const label = (
    <>
      <span className="line-clamp-1 font-medium">{a.message}</span>
      {href ? <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" /> : null}
    </>
  );

  return (
    <div className="border-b bg-primary/10">
      <div className="container flex items-center gap-2 py-2 text-sm">
        <Megaphone className="h-4 w-4 shrink-0 text-primary" />
        {href ? (
          isInternal ? (
            <Link href={href} className="flex min-w-0 items-center gap-1.5 text-foreground/90 hover:text-primary hover:underline">
              {label}
            </Link>
          ) : (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-w-0 items-center gap-1.5 text-foreground/90 hover:text-primary hover:underline"
            >
              {label}
            </a>
          )
        ) : (
          <span className="line-clamp-1 font-medium text-foreground/90">{a.message}</span>
        )}
      </div>
    </div>
  );
}
