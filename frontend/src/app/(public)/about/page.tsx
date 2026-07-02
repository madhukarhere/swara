import type { Metadata } from 'next';
import { getStaticPage } from '@/lib/api';
import { StaticPageView, StaticPageFallback } from '@/components/static-page-view';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Vijayavipanchi is a global community of Telugu-speaking Hindus, inspired by the Sangh Parivar, sharing Telugu Sangh songs, padyalu, shlokas, bhajanalu and ghosh online since April 2011.',
};

export default async function AboutPage() {
  const page = await getStaticPage('about');
  if (!page) return <StaticPageFallback title="About Us" />;
  return <StaticPageView slug="about" title={page.title} subtitle={page.subtitle} body={page.body} />;
}
