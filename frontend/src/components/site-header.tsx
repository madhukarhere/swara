import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';

const nav = [
  { href: '/', label: 'Home' },
  { href: '/songs', label: 'Songs' },
  { href: '/articles', label: 'Articles' },
  { href: '/quotes', label: 'Quotes' },
  { href: '/admin', label: 'Admin' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg temple-gradient font-serif text-lg text-white shadow-sm">
            ॐ
          </span>
          <span className="font-serif text-xl font-bold tracking-tight">Swara</span>
        </Link>
        <nav className="flex items-center gap-0.5 sm:gap-1">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
