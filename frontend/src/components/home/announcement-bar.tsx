'use client';

import { useEffect, useState } from 'react';
import { Megaphone } from 'lucide-react';

export function AnnouncementBar({ items }: { items: { id: string; message: string; link?: string | null }[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setI((p) => (p + 1) % items.length), 5000);
    return () => clearInterval(t);
  }, [items.length]);

  if (!items.length) return null;
  const a = items[i % items.length];
  return (
    <div className="border-b bg-primary/10">
      <div className="container flex items-center gap-2 py-2 text-sm">
        <Megaphone className="h-4 w-4 shrink-0 text-primary" />
        <span className="line-clamp-1 font-medium text-foreground/90">{a.message}</span>
      </div>
    </div>
  );
}
