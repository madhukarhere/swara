import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { Om } from '@/components/icons/cultural-icons';

const nav = [
  { href: '/', label: 'Home' },
  { href: '/songs', label: 'Songs' },
  { href: '/articles', label: 'Articles' },
  { href: '/quotes', label: 'Quotes' },
  { href: '/contribute', label: 'Contribute' },
  { href: '/contact', label: 'Contact' },
  { href: '/admin', label: 'Admin' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center gap-2">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg temple-gradient text-white shadow-sm">
            <Om className="h-5 w-5" />
          </span>
          <span className="font-serif text-xl font-bold tracking-tight">Vijayavipanchi</span>
        </Link>
        <nav className="scrollbar-thin flex flex-1 items-center gap-0.5 overflow-x-auto py-1 sm:justify-end sm:gap-1">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="shrink-0 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
