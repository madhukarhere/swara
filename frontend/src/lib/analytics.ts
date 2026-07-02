/**
 * Client-side helper to send a custom GA4 event. Safe to call whether or not
 * analytics is enabled — no-op when gtag is not present.
 *
 * Usage from any client component:
 *   trackEvent('song_play', { song_id: song.id, title: song.title });
 *   trackEvent('song_download', { song_id: song.id });
 */
export function trackEvent(name: string, params: Record<string, string | number | boolean> = {}): void {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag !== 'function') return;
  try {
    w.gtag('event', name, params);
  } catch {
    /* never break the app because of analytics */
  }
}
