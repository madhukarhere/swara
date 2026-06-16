'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function SearchBar({ defaultValue = '', big = false }: { defaultValue?: string; big?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(q.trim() ? `/songs?q=${encodeURIComponent(q.trim())}` : '/songs');
      }}
      className="flex w-full gap-2"
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search songs, lyrics, categories…"
          aria-label="Search"
          className={big ? 'h-12 pl-10 text-base' : 'pl-10'}
        />
      </div>
      <Button type="submit" size={big ? 'lg' : 'default'}>
        Search
      </Button>
    </form>
  );
}
