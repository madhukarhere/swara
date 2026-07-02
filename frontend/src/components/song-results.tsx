'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'vijayavipanchi:songs-view';
// Room for ~6 grid rows (tile ≈ 58px + 8px gap → ~66px pitch). On short
// viewports this forces the page to scroll rather than squeezing the list; the
// back-to-top button still gets you back up quickly.
const MIN_LIST_HEIGHT = 400;

/**
 * Client wrapper for the songs listing that toggles between the grid (cards)
 * and list (rows) views. Both views are server-rendered and passed in as props.
 * The choice is remembered in localStorage.
 *
 * The results box sizes itself so the WHOLE page (header, filters, pagers and
 * footer) fits the viewport — songs scroll inside this box, keeping the footer
 * visible at all times. It measures how much the document overflows the window
 * and shrinks/grows by exactly that amount (self-correcting on resize and
 * grid/list switches).
 */
export function SongResults({
  grid,
  list,
  topBar,
}: {
  grid: React.ReactNode;
  list: React.ReactNode;
  /** Rendered on the same row as the grid/list toggle (e.g. the top pager). */
  topBar?: React.ReactNode;
}) {
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [maxH, setMaxH] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'list' || saved === 'grid') setView(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const fit = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const overflow = document.documentElement.scrollHeight - window.innerHeight;
    if (Math.abs(overflow) < 2) return; // already fits
    setMaxH(Math.max(MIN_LIST_HEIGHT, el.clientHeight - overflow));
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(fit);
    window.addEventListener('resize', fit);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', fit);
    };
  }, [fit, view]);

  // Converge: after each maxH render commits, re-measure once (stops when it fits
  // or the MIN clamp makes the target stable).
  useEffect(() => {
    const raf = requestAnimationFrame(fit);
    return () => cancelAnimationFrame(raf);
  }, [fit, maxH]);

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
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0 flex-1">{topBar}</div>
        <div className="inline-flex shrink-0 rounded-lg border p-0.5">
          {btn('grid', LayoutGrid, 'Grid')}
          {btn('list', List, 'List')}
        </div>
      </div>
      <div
        ref={wrapRef}
        style={maxH ? { maxHeight: `${maxH}px` } : undefined}
        className="scrollbar-thin overflow-y-auto overscroll-contain pr-1"
      >
        {view === 'grid' ? grid : list}
      </div>
    </div>
  );
}
