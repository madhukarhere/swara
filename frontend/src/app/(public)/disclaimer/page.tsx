import type { Metadata } from 'next';
import { getStaticPage } from '@/lib/api';
import { StaticPageView, StaticPageFallback } from '@/components/static-page-view';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description:
    'Vijayavipanchi is a non-profit portal sharing devotional and cultural Telugu music. Copyright owners may request removal of any material.',
};

export default async function DisclaimerPage() {
  const page = await getStaticPage('disclaimer');
  if (!page) return <StaticPageFallback title="Disclaimer" />;
  return <StaticPageView slug="disclaimer" title={page.title} subtitle={page.subtitle} body={page.body} />;
}
