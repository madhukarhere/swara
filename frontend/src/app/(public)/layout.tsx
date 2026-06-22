import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { GlobalSearchBar } from '@/components/global-search-bar';
import { AnnouncementBar } from '@/components/home/announcement-bar';
import { getAnnouncements } from '@/lib/api';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const announcements = await getAnnouncements();
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <AnnouncementBar items={announcements} />
      <GlobalSearchBar />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
