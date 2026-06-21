'use client';

import { usePathname } from 'next/navigation';
import { SearchBar } from '@/components/search-bar';

/**
 * Site-wide search bar shown under the header on every public page — except the
 * Songs listing (/songs), which has its own search integrated with its filters.
 */
export function GlobalSearchBar() {
  const pathname = usePathname();
  if (pathname === '/songs') return null;
  return (
    <div className="border-b bg-muted/30">
      <div className="container py-2.5">
        <SearchBar />
      </div>
    </div>
  );
}
