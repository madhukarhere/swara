'use client';

import { useEffect, useState } from 'react';
import { Save, BarChart3, ExternalLink, ShieldCheck, ShieldAlert } from 'lucide-react';
import { apiJson } from '@/lib/client-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

interface AnalyticsData {
  enabled: boolean;
  measurementId: string;
  anonymizeIp: boolean;
  updatedAt: string | null;
  updatedBy: string | null;
}

const ID_RE = /^(G-[A-Z0-9]{4,20}|GT-[A-Z0-9]{4,20}|UA-\d{4,10}-\d{1,4})$/i;

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [enabled, setEnabled] = useState(false);
  const [measurementId, setMeasurementId] = useState('');
  const [anonymizeIp, setAnonymizeIp] = useState(true);

  const load = () => {
    setLoading(true);
    apiJson<{ data: AnalyticsData }>('/api/admin/analytics').then((r) => {
      if (r.ok) {
        setData(r.body.data);
        setEnabled(r.body.data.enabled);
        setMeasurementId(r.body.data.measurementId);
        setAnonymizeIp(r.body.data.anonymizeIp);
      }
      setLoading(false);
    });
  };
  useEffect(load, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (measurementId && !ID_RE.test(measurementId.trim())) {
      setMsg({ type: 'err', text: 'Measurement ID must look like G-XXXXXXXXXX (GA4) or UA-######-# (legacy).' });
      return;
    }
    setSaving(true);
    const r = await apiJson('/api/admin/analytics', 'PUT', {
      enabled,
      measurementId: measurementId.trim(),
      anonymizeIp,
    });
    setSaving(false);
    if (r.ok) {
      setMsg({ type: 'ok', text: 'Analytics settings saved.' });
      load();
    } else {
      setMsg({ type: 'err', text: (r.body as { error?: string }).error || 'Could not save.' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-7 w-7" />
      </div>
    );
  }

  const idValid = !measurementId || ID_RE.test(measurementId.trim());
  const active = enabled && idValid && !!measurementId;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-serif text-3xl font-bold">
          <BarChart3 className="h-7 w-7 text-primary" /> Analytics
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track user behaviour on the public site with Google Analytics 4. The admin panel is not tracked.
        </p>
      </div>

      <Card
        className={
          active
            ? 'border-green-500/40 bg-green-50/60 dark:bg-green-900/10'
            : 'border-amber-500/40 bg-amber-50/60 dark:bg-amber-900/10'
        }
      >
        <CardContent className="flex items-start gap-3 p-4 text-sm">
          {active ? (
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
          ) : (
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          )}
          <div>
            {active ? (
              <p>
                <strong>Active</strong> — the public site loads gtag.js and sends page-view events to{' '}
                <code>{measurementId}</code> on every route change.
              </p>
            ) : !enabled ? (
              <p>
                <strong>Disabled.</strong> No tracking script is loaded. Turn the toggle on below to start tracking.
              </p>
            ) : (
              <p>
                <strong>Enabled but not active.</strong> A valid Measurement ID is required (e.g. <code>G-XXXXXXXXXX</code>).
              </p>
            )}
            {data?.updatedAt ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Last saved {new Date(data.updatedAt).toLocaleString('en-GB')}
                {data.updatedBy ? ` by ${data.updatedBy}` : ''}.
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {msg ? (
        <p className={msg.type === 'ok' ? 'text-sm font-medium text-green-600' : 'text-sm font-medium text-red-600'}>
          {msg.text}
        </p>
      ) : null}

      <form onSubmit={save}>
        <Card>
          <CardContent className="space-y-5 p-5">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              <span>
                <strong>Enable Google Analytics tracking</strong>
              </span>
            </label>

            <div className="space-y-1.5">
              <Label htmlFor="measurementId">Google Analytics Measurement ID</Label>
              <Input
                id="measurementId"
                value={measurementId}
                onChange={(e) => setMeasurementId(e.target.value)}
                placeholder="G-XXXXXXXXXX"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                Find this in your GA4 property under <em>Admin → Data Streams → your web stream</em>. It looks like{' '}
                <code>G-XXXXXXXXXX</code>. UA-###### (legacy Universal Analytics) IDs are also accepted.{' '}
                <a
                  href="https://support.google.com/analytics/answer/9539598"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  Where do I find this? <ExternalLink className="inline h-3 w-3" />
                </a>
              </p>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={anonymizeIp}
                onChange={(e) => setAnonymizeIp(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              <span>Anonymize visitor IP addresses (recommended)</span>
            </label>

            <div className="rounded-md border border-muted-foreground/20 bg-muted/40 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">What gets tracked</p>
              <ul className="mt-1 list-disc pl-5">
                <li>Page views (including client-side navigation between pages)</li>
                <li>Session and user metrics via GA4&apos;s standard measurement</li>
                <li>Custom events raised via <code>trackEvent(name, params)</code> from any client component</li>
              </ul>
              <p className="mt-2">
                <strong>The admin panel is never tracked</strong> — the tracking snippet is only injected into the public
                site layout.
              </p>
            </div>

            <div>
              <Button type="submit" disabled={saving}>
                {saving ? <Spinner className="h-4 w-4 text-current" /> : <Save className="h-4 w-4" />}
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
