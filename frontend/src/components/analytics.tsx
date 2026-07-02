'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

/**
 * Google Analytics 4 injection. Rendered from the (public) layout only — the
 * admin panel stays untracked.
 *
 * When enabled with a valid measurement ID:
 *   - Loads gtag.js and configures GA4
 *   - Suppresses the automatic first-hit page_view, then sends one manually on
 *     every pathname/query change so App Router client transitions get tracked
 */
interface AnalyticsProps {
  enabled: boolean;
  measurementId?: string;
  anonymizeIp?: boolean;
}

const ID_RE = /^(G-[A-Z0-9]{4,20}|GT-[A-Z0-9]{4,20}|UA-\d{4,10}-\d{1,4})$/i;

// useSearchParams() opts the whole subtree out of static prerendering unless
// wrapped in a Suspense boundary — so this hook-using inner component is
// mounted through Suspense below.
function PageviewTracker({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    if (!measurementId) return;
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (typeof w.gtag !== 'function') return;
    const q = search?.toString();
    const page_path = q ? `${pathname}?${q}` : pathname;
    w.gtag('event', 'page_view', {
      page_path,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, search, measurementId]);

  return null;
}

export function Analytics({ enabled, measurementId, anonymizeIp }: AnalyticsProps) {
  if (!enabled) return null;
  if (!measurementId || !ID_RE.test(measurementId)) return null;

  const idJson = JSON.stringify(measurementId);
  const ai = anonymizeIp ? 'true' : 'false';

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', ${idJson}, {
            anonymize_ip: ${ai},
            send_page_view: false
          });
        `}
      </Script>
      <Suspense fallback={null}>
        <PageviewTracker measurementId={measurementId} />
      </Suspense>
    </>
  );
}
