'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminLogin } from '@/lib/client-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    const r = await adminLogin(username, password);
    setLoading(false);
    if (r.ok && r.body.admin) {
      router.replace('/admin');
    } else {
      setErr(r.body.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl temple-gradient font-serif text-2xl text-white">
              ॐ
            </div>
            <h1 className="font-serif text-2xl font-bold">Vijayavipanchi Admin</h1>
            <p className="text-sm text-muted-foreground">Sign in to manage your portal</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            {err ? <p className="text-sm font-medium text-red-600">{err}</p> : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Spinner className="h-4 w-4 text-current" /> : null}
              Sign in
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-muted-foreground">Default: admin / Admin@12345</p>
          <Link href="/" className="mt-2 block text-center text-xs text-primary hover:underline">
            ← Back to site
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
