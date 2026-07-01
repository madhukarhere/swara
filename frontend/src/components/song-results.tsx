'use client';

import { useEffect, useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'vijayavipanchi:songs-view';

/**
 * Client wrapper for the songs listing that toggles between the grid (cards)
 * and list (rows) views. Both views are server-rendered and passed in as props,
 * so this stays a tiny client component. The choice is remembered in
 * localStorage. Pagination lives outside this component (URL-based) and works
 * the same in either view.
 */
export function SongResults({ grid, list }: { grid: React.ReactNode; list: React.ReactNode }) {
  const [view, setView] = useState<'grid' | 'list'>('list');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'list' || saved === 'grid') setView(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const choose = (v: 'grid' | 'list') => {
    setView(v);
    try {
      localStorage.setItem(STORAGE_KEY, v);
    } catch {
      /* ignore */
    }
  };

  const btn = (v: 'grid' | 'list', Icon: typeof LayoutGrid, label: string) => (
    <button
      type="button"
      onClick={() => choose(v)}
      aria-label={`${label} view`}
      aria-pressed={view === v}
      className={cn(
        'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors',
        view === v ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <div className="inline-flex rounded-lg border p-0.5">
          {btn('grid', LayoutGrid, 'Grid')}
          {btn('list', List, 'List')}
        </div>
      </div>
      {view === 'grid' ? grid : list}
    </div>
  );
}
