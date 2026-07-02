import type { Metadata } from 'next';
import { getStaticPage } from '@/lib/api';
import { StaticPageView, StaticPageFallback } from '@/components/static-page-view';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contribute',
  description: 'Share songs, lyrics and documents, help proofread, or support Vijayavipanchi.',
};

export default async function ContributePage() {
  const page = await getStaticPage('contribute');
  if (!page) return <StaticPageFallback title="Contribute" />;
  return <StaticPageView slug="contribute" title={page.title} subtitle={page.subtitle} body={page.body} />;
}
