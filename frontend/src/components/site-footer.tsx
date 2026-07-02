import Link from 'next/link';
import { MotifDivider } from '@/components/cultural/motif';
import { Om, Lotus, Diya, Bell, Conch, Kalasha, PeacockFeather } from '@/components/icons/cultural-icons';

const SYMBOLS = [Lotus, Diya, Bell, Conch, Kalasha, PeacockFeather];

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t bg-muted/30">
      <div className="container py-6">
        <MotifDivider className="mb-4" />
        <div className="mb-4 flex items-center justify-center gap-5 text-muted-foreground/70 sm:gap-8">
          {SYMBOLS.map((Symbol, i) => (
            <Symbol key={i} className="h-5 w-5 transition-colors hover:text-primary sm:h-6 sm:w-6" />
          ))}
        </div>
        <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
          <p className="flex items-center gap-2">
            <Om className="h-5 w-5 text-primary" />
            <span className="font-serif text-base text-foreground">Vijayavipanchi</span>
            <span>· Cultural Music &amp; Lyrics Portal</span>
          </p>
          <nav className="flex flex-wrap justify-center gap-4">
            <Link href="/songs" className="hover:text-foreground">
              Songs
            </Link>
            <Link href="/articles" className="hover:text-foreground">
              Articles
            </Link>
            <Link href="/quotes" className="hover:text-foreground">
              Quotes
            </Link>
            <Link href="/contribute" className="hover:text-foreground">
              Contribute
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              Contact
            </Link>
            <Link href="/admin" className="hover:text-foreground">
              Admin
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
