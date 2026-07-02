import type { Metadata } from 'next';
import { getStaticPage } from '@/lib/api';
import { StaticPageView, StaticPageFallback } from '@/components/static-page-view';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description:
    'Terms and conditions for using Vijayavipanchi.org — a non-profit portal for patriotic and devotional Telugu music.',
};

export default async function TermsPage() {
  const page = await getStaticPage('terms');
  if (!page) return <StaticPageFallback title="Terms & Conditions" />;
  return <StaticPageView slug="terms" title={page.title} subtitle={page.subtitle} body={page.body} />;
}
