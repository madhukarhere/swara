'use client';

import { useEffect, useState } from 'react';
import { Save, Send, ShieldCheck, ShieldAlert, Mail } from 'lucide-react';
import { apiJson } from '@/lib/client-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

interface MailData {
  smtp: {
    enabled: boolean;
    host: string;
    port: number;
    secure: boolean;
    user: string;
    hasPassword: boolean;
    fromName: string;
    fromEmail: string;
    replyTo: string;
  };
  imap: {
    enabled: boolean;
    host: string;
    port: number;
    secure: boolean;
    user: string;
    hasPassword: boolean;
  };
  updatedAt: string | null;
  updatedBy: string | null;
}

interface EffectiveInfo {
  configured: boolean;
  source: 'db' | 'env' | 'none';
  host: string;
  port: number;
  secure: boolean;
  from: string;
}

export default function AdminMailPage() {
  const [data, setData] = useState<MailData | null>(null);
  const [effective, setEffective] = useState<EffectiveInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Editable state (never binds to hasPassword)
  const [smtpEnabled, setSmtpEnabled] = useState(false);
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [fromName, setFromName] = useState('Vijayavipanchi');
  const [fromEmail, setFromEmail] = useState('');
  const [replyTo, setReplyTo] = useState('');

  const [imapEnabled, setImapEnabled] = useState(false);
  const [imapHost, setImapHost] = useState('');
  const [imapPort, setImapPort] = useState('993');
  const [imapSecure, setImapSecure] = useState(true);
  const [imapUser, setImapUser] = useState('');
  const [imapPassword, setImapPassword] = useState('');

  const [testTo, setTestTo] = useState('');
  const [testing, setTesting] = useState(false);

  const load = () => {
    setLoading(true);
    apiJson<{ data: MailData; effective: EffectiveInfo }>('/api/admin/mail').then((r) => {
      if (r.ok) {
        setData(r.body.data);
        setEffective(r.body.effective);
        const d = r.body.data;
        setSmtpEnabled(d.smtp.enabled);
        setSmtpHost(d.smtp.host);
        setSmtpPort(String(d.smtp.port));
        setSmtpSecure(d.smtp.secure);
        setSmtpUser(d.smtp.user);
        setFromName(d.smtp.fromName);
        setFromEmail(d.smtp.fromEmail);
        setReplyTo(d.smtp.replyTo);
        setImapEnabled(d.imap.enabled);
        setImapHost(d.imap.host);
        setImapPort(String(d.imap.port));
        setImapSecure(d.imap.secure);
        setImapUser(d.imap.user);
      }
      setLoading(false);
    });
  };
  useEffect(load, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const r = await apiJson('/api/admin/mail', 'PUT', {
      smtp: {
        enabled: smtpEnabled,
        host: smtpHost,
        port: Number(smtpPort),
        secure: smtpSecure,
        user: smtpUser,
        password: smtpPassword,
        fromName,
        fromEmail,
        replyTo,
      },
      imap: {
        enabled: imapEnabled,
        host: imapHost,
        port: Number(imapPort),
        secure: imapSecure,
        user: imapUser,
        password: imapPassword,
      },
    });
    setSaving(false);
    if (r.ok) {
      setMsg({ type: 'ok', text: 'Saved.' });
      setSmtpPassword('');
      setImapPassword('');
      load();
    } else {
      setMsg({ type: 'err', text: (r.body as { error?: string }).error || 'Could not save.' });
    }
  };

  const sendTest = async () => {
    if (!testTo) {
      setMsg({ type: 'err', text: 'Enter a recipient address for the test email.' });
      return;
    }
    setTesting(true);
    setMsg(null);
    const r = await apiJson<{ ok: boolean; sent: boolean; source: string }>('/api/admin/mail/test', 'POST', { to: testTo });
    setTesting(false);
    if (r.ok && r.body.sent) {
      setMsg({ type: 'ok', text: `Test email sent to ${testTo} (source: ${r.body.source}).` });
    } else {
      setMsg({ type: 'err', text: (r.body as { error?: string }).error || 'Test email failed.' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-7 w-7" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Mail Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure the SMTP server the application uses to send emails (contact-form replies, notifications).
          IMAP fields are stored for future use.
        </p>
      </div>

      {effective ? (
        <Card
          className={
            effective.configured
              ? 'border-green-500/40 bg-green-50/60 dark:bg-green-900/10'
              : 'border-amber-500/40 bg-amber-50/60 dark:bg-amber-900/10'
          }
        >
          <CardContent className="flex items-start gap-3 p-4 text-sm">
            {effective.configured ? (
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
            ) : (
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            )}
            <div>
              {effective.configured ? (
                <p>
                  <strong>Active</strong> — mail sends via {effective.host}:{effective.port}
                  {effective.secure ? ' (TLS)' : ''} from “{effective.from}” · source:{' '}
                  <code>{effective.source}</code>
                </p>
              ) : (
                <p>
                  <strong>Not configured.</strong> The app is running with nodemailer&rsquo;s JSON transport —
                  outbound mail is logged but not delivered. Fill in the SMTP fields below and enable it.
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
      ) : null}

      {msg ? (
        <p className={msg.type === 'ok' ? 'text-sm font-medium text-green-600' : 'text-sm font-medium text-red-600'}>
          {msg.text}
        </p>
      ) : null}

      <form onSubmit={save} className="space-y-6">
        {/* SMTP */}
        <Card>
          <CardContent className="space-y-4 p-5">
            <h2 className="flex items-center gap-2 font-serif text-xl font-semibold">
              <Mail className="h-5 w-5 text-primary" /> Outbound — SMTP
            </h2>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={smtpEnabled}
                onChange={(e) => setSmtpEnabled(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              <span>Enable SMTP for outbound mail</span>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="smtpHost">SMTP host *</Label>
                <Input
                  id="smtpHost"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="e.g. smtp.gmail.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="smtpPort">Port</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  min={1}
                  max={65535}
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">465 for implicit TLS, 587 for STARTTLS.</p>
              </div>
              <div className="space-y-1.5">
                <Label>Connection</Label>
                <div className="flex items-center gap-4 pt-2 text-sm">
                  <label className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      checked={smtpSecure}
                      onChange={() => setSmtpSecure(true)}
                      className="accent-primary"
                    />
                    Implicit TLS (SSL)
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      checked={!smtpSecure}
                      onChange={() => setSmtpSecure(false)}
                      className="accent-primary"
                    />
                    STARTTLS / plain
                  </label>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="smtpUser">Username</Label>
                <Input
                  id="smtpUser"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="smtpPassword">
                  Password {data?.smtp.hasPassword ? <span className="text-xs text-muted-foreground">(stored — leave blank to keep)</span> : null}
                </Label>
                <Input
                  id="smtpPassword"
                  type="password"
                  value={smtpPassword}
                  onChange={(e) => setSmtpPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder={data?.smtp.hasPassword ? '••••••••' : ''}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fromName">From name</Label>
                <Input id="fromName" value={fromName} onChange={(e) => setFromName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fromEmail">From address</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  placeholder="no-reply@example.com"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="replyTo">Reply-to (optional)</Label>
                <Input id="replyTo" type="email" value={replyTo} onChange={(e) => setReplyTo(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* IMAP */}
        <Card>
          <CardContent className="space-y-4 p-5">
            <h2 className="flex items-center gap-2 font-serif text-xl font-semibold">
              <Mail className="h-5 w-5 text-primary" /> Inbound — IMAP
            </h2>
            <p className="text-xs text-muted-foreground">
              Optional. Stored for future use — the app currently only sends mail.
            </p>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={imapEnabled}
                onChange={(e) => setImapEnabled(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              <span>Enable IMAP</span>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="imapHost">IMAP host</Label>
                <Input
                  id="imapHost"
                  value={imapHost}
                  onChange={(e) => setImapHost(e.target.value)}
                  placeholder="e.g. imap.gmail.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="imapPort">Port</Label>
                <Input
                  id="imapPort"
                  type="number"
                  min={1}
                  max={65535}
                  value={imapPort}
                  onChange={(e) => setImapPort(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Connection</Label>
                <label className="flex items-center gap-1.5 pt-2 text-sm">
                  <input
                    type="checkbox"
                    checked={imapSecure}
                    onChange={(e) => setImapSecure(e.target.checked)}
                    className="accent-primary"
                  />
                  Use TLS (usually port 993)
                </label>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="imapUser">Username</Label>
                <Input id="imapUser" value={imapUser} onChange={(e) => setImapUser(e.target.value)} autoComplete="off" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="imapPassword">
                  Password {data?.imap.hasPassword ? <span className="text-xs text-muted-foreground">(stored — leave blank to keep)</span> : null}
                </Label>
                <Input
                  id="imapPassword"
                  type="password"
                  value={imapPassword}
                  onChange={(e) => setImapPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? <Spinner className="h-4 w-4 text-current" /> : <Save className="h-4 w-4" />}
            Save settings
          </Button>
        </div>
      </form>

      {/* Send a test email */}
      <Card>
        <CardContent className="space-y-3 p-5">
          <h2 className="flex items-center gap-2 font-serif text-lg font-semibold">
            <Send className="h-5 w-5 text-primary" /> Send a test email
          </h2>
          <p className="text-sm text-muted-foreground">
            Verifies the SMTP connection and delivers a short test message using the currently-saved settings.
          </p>
          <div className="flex gap-2">
            <Input
              value={testTo}
              onChange={(e) => setTestTo(e.target.value)}
              placeholder="recipient@example.com"
              type="email"
              className="max-w-xs"
            />
            <Button type="button" variant="outline" onClick={sendTest} disabled={testing}>
              {testing ? <Spinner className="h-4 w-4 text-current" /> : <Send className="h-4 w-4" />}
              Send test
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
