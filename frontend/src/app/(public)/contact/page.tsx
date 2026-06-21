'use client';

import { useCallback, useEffect, useState } from 'react';
import { Mail, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';

const CATEGORIES = [
  { value: 'contribute', label: 'Contribute' },
  { value: 'functionality', label: 'Functionality / feedback' },
  { value: 'donation', label: 'Donation' },
];

const EMPTY = { name: '', email: '', mobile: '', category: 'contribute', message: '' };

export default function ContactPage() {
  const [form, setForm] = useState({ ...EMPTY });
  const [captcha, setCaptcha] = useState<{ token: string; image: string } | null>(null);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  const loadCaptcha = useCallback(async () => {
    try {
      const res = await fetch('/api/captcha');
      const j = await res.json();
      setCaptcha({ token: j.token, image: j.image });
      setAnswer('');
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void loadCaptcha();
  }, [loadCaptcha]);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErr('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          mobile: form.mobile || undefined,
          captchaToken: captcha?.token,
          captchaAnswer: answer,
        }),
      });
      const body = await res.json();
      if (res.ok) {
        setDone(true);
      } else {
        setErr(body.error || 'Could not send your message. Please try again.');
        void loadCaptcha();
      }
    } catch {
      setErr('Network error. Please try again.');
      void loadCaptcha();
    }
    setSubmitting(false);
  };

  if (done) {
    return (
      <div className="container max-w-xl py-16">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <CheckCircle2 className="h-14 w-14 text-green-600" />
            <h1 className="font-serif text-2xl font-bold">Message sent!</h1>
            <p className="text-muted-foreground">We will reach out to you shortly. Thank you for getting in touch.</p>
            <Button
              variant="outline"
              onClick={() => {
                setForm({ ...EMPTY });
                setDone(false);
                void loadCaptcha();
              }}
            >
              Send another message
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-10">
      <header className="mb-6 space-y-3 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl temple-gradient text-white shadow-sm">
          <Mail className="h-7 w-7" />
        </span>
        <h1 className="font-serif text-4xl font-bold">Contact Us</h1>
        <p className="text-muted-foreground">Have a question, suggestion, or want to help? Send us a message.</p>
      </header>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={form.name} onChange={(e) => set('name', e.target.value)} required maxLength={120} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Your email *</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mobile">Your mobile number</Label>
                <Input id="mobile" type="tel" value={form.mobile} onChange={(e) => set('mobile', e.target.value)} placeholder="optional" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category">Category of message *</Label>
                <Select id="category" value={form.category} onChange={(e) => set('category', e.target.value)} className="w-full">
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="message">Message *</Label>
              <Textarea id="message" value={form.message} onChange={(e) => set('message', e.target.value)} required minLength={2} maxLength={5000} className="min-h-[140px]" />
            </div>

            <div className="space-y-1.5">
              <Label>CAPTCHA *</Label>
              <div className="flex items-center gap-3">
                <span className="overflow-hidden rounded-md border bg-white">
                  {captcha ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={captcha.image} alt="CAPTCHA" className="h-[52px]" />
                  ) : (
                    <span className="block h-[52px] w-[170px] animate-pulse bg-muted" />
                  )}
                </span>
                <Button type="button" variant="ghost" size="icon" onClick={() => void loadCaptcha()} aria-label="New CAPTCHA">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Input className="max-w-[160px]" placeholder="Enter the text" value={answer} onChange={(e) => setAnswer(e.target.value)} required />
              </div>
            </div>

            {err ? <p className="text-sm font-medium text-red-600">{err}</p> : null}

            <Button type="submit" disabled={submitting}>
              {submitting ? <Spinner className="h-4 w-4 text-current" /> : <Send className="h-4 w-4" />}
              Send message
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
