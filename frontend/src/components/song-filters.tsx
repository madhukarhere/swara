'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Select } from '@/components/ui/select';
import { SearchBar } from '@/components/search-bar';
import type { Category } from '@/lib/types';

const LANGUAGES = ['Telugu', 'Sanskrit', 'Hindi', 'English', 'Roman Transliteration', 'Tamil', 'Kannada', 'Malayalam'];

export function SongFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const sp = useSearchParams();

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    router.push(`/songs?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="flex-1">
        <SearchBar defaultValue={sp.get('q') ?? ''} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Select value={sp.get('category') ?? ''} onChange={(e) => update('category', e.target.value)} aria-label="Filter by category">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select value={sp.get('language') ?? ''} onChange={(e) => update('language', e.target.value)} aria-label="Filter by language">
          <option value="">All languages</option>
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </Select>
        <Select value={sp.get('sort') ?? 'latest'} onChange={(e) => update('sort', e.target.value)} aria-label="Sort">
          <option value="latest">Latest</option>
          <option value="most_played">Most played</option>
        </Select>
      </div>
    </div>
  );
}
