'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LayoutDashboard, Music, FolderTree, MessageSquare, CalendarDays, LogOut } from 'lucide-react';
import { adminMe, adminLogout } from '@/lib/client-api';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/songs', label: 'Songs', icon: Music },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/events', label: 'Events', icon: CalendarDays },
  { href: '/admin/comments', label: 'Comments', icon: MessageSquare },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === '/admin/login';
  const [status, setStatus] = useState<'loading' | 'authed' | 'anon'>(isLogin ? 'anon' : 'loading');
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (isLogin) return;
    let active = true;
    adminMe().then((r) => {
      if (!active) return;
      if (r.ok && r.body.admin) {
        setUsername(r.body.admin.username);
        setStatus('authed');
      } else {
        router.replace('/admin/login');
      }
    });
    return () => {
      active = false;
    };
  }, [isLogin, pathname, router]);

  if (isLogin) return <>{children}</>;
  if (status !== 'authed')
    return (
      <div className="grid min-h-screen place-items-center">
        <Spinner className="h-8 w-8" />
      </div>
    );

  const logout = async () => {
    await adminLogout();
    router.replace('/admin/login');
  };

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {NAV.map((n) => {
        const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
        const Icon = n.icon;
        return (
          <Link
            key={n.href}
            href={n.href}
            onClick={onClick}
            className={cn(
              'flex items-center gap-3 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
              active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
            {n.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 flex-col border-r bg-card p-4 sm:flex">
        <Link href="/admin" className="mb-6 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg temple-gradient font-serif text-white">ॐ</span>
          <span className="font-serif text-lg font-bold">Swara Admin</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          <NavLinks />
        </nav>
        <Button variant="outline" onClick={logout}>
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between gap-3 border-b bg-card px-4 sm:px-6">
          <span className="font-serif font-bold sm:hidden">Swara Admin</span>
          <div className="ml-auto flex items-center gap-3 text-sm text-muted-foreground">
            <span className="hidden sm:inline">
              Signed in as <b className="text-foreground">{username}</b>
            </span>
            <ThemeToggle />
            <Link href="/" className="hover:text-foreground">
              View site →
            </Link>
            <Button variant="ghost" size="icon" onClick={logout} className="sm:hidden" aria-label="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b bg-card px-2 py-2 sm:hidden">
          <NavLinks />
        </nav>
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
