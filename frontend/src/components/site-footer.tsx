import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-muted/30">
      <div className="container flex flex-col items-center justify-between gap-3 py-8 text-sm text-muted-foreground sm:flex-row">
        <p className="flex items-center gap-2">
          <span className="font-serif text-base text-foreground">ॐ Swara</span>
          <span>· Cultural Music &amp; Lyrics Portal</span>
        </p>
        <nav className="flex gap-4">
          <Link href="/songs" className="hover:text-foreground">Songs</Link>
          <Link href="/admin" className="hover:text-foreground">Admin</Link>
        </nav>
      </div>
    </footer>
  );
}
