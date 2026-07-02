import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { GlobalSearchBar } from '@/components/global-search-bar';
import { AnnouncementBar } from '@/components/home/announcement-bar';
import { BackToTop } from '@/components/back-to-top';
import { Analytics } from '@/components/analytics';
import { getAnnouncements, getAnalytics } from '@/lib/api';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [announcements, analytics] = await Promise.all([getAnnouncements(), getAnalytics()]);
  return (
    <div className="flex min-h-screen flex-col">
      <Analytics
        enabled={analytics.enabled}
        measurementId={analytics.measurementId}
        anonymizeIp={analytics.anonymizeIp}
      />
      <SiteHeader />
      <AnnouncementBar items={announcements} />
      <GlobalSearchBar />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <BackToTop />
    </div>
  );
}
