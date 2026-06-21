'use client';

import { useEffect, useState } from 'react';
import { UserPlus, Pencil, KeyRound, Trash2, Save, X, ShieldCheck } from 'lucide-react';
import { apiJson, adminMe } from '@/lib/client-api';
import { useAdminList } from '@/lib/use-admin-list';
import { AdminSearch, AdminPager } from '@/components/admin/list-controls';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  lastLoginAt?: string | null;
  createdAt?: string | null;
}

type Msg = { type: 'ok' | 'err'; text: string } | null;

function errMsg(body: unknown): string {
  const b = body as { error?: string; details?: { fieldErrors?: Record<string, string[]> } } | undefined;
  const fe = b?.details?.fieldErrors;
  if (fe) {
    const first = Object.values(fe).flat()[0];
    if (first) return first;
  }
  return b?.error || 'Something went wrong';
}

const fmt = (iso?: string | null) => (iso ? new Date(iso).toLocaleString('en-GB') : '—');

export default function AdminUsersPage() {
  const { items, meta, loading, search, setPage, reload } = useAdminList<AdminUser>('/api/admin/users', 20);
  const [meId, setMeId] = useState<string | null>(null);
  const [msg, setMsg] = useState<Msg>(null);
  const [busy, setBusy] = useState(false);

  // create form
  const [showCreate, setShowCreate] = useState(false);
  const [cUsername, setCUsername] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cPassword, setCPassword] = useState('');

  // per-row panels
  const [editId, setEditId] = useState<string | null>(null);
  const [eUsername, setEUsername] = useState('');
  const [eEmail, setEEmail] = useState('');
  const [pwId, setPwId] = useState<string | null>(null);
  const [pw, setPw] = useState('');

  useEffect(() => {
    adminMe().then((r) => {
      if (r.ok && r.body.admin) setMeId(r.body.admin.id);
    });
  }, []);

  const closePanels = () => {
    setEditId(null);
    setPwId(null);
  };

  const createUser = async () => {
    setBusy(true);
    setMsg(null);
    const r = await apiJson('/api/admin/users', 'POST', { username: cUsername, email: cEmail, password: cPassword });
    setBusy(false);
    if (r.ok) {
      setMsg({ type: 'ok', text: `User “${cUsername.toLowerCase()}” created.` });
      setCUsername('');
      setCEmail('');
      setCPassword('');
      setShowCreate(false);
      void reload();
    } else {
      setMsg({ type: 'err', text: errMsg(r.body) });
    }
  };

  const startEdit = (u: AdminUser) => {
    closePanels();
    setEditId(u.id);
    setEUsername(u.username);
    setEEmail(u.email);
    setMsg(null);
  };
  const saveEdit = async (id: string) => {
    setBusy(true);
    setMsg(null);
    const r = await apiJson(`/api/admin/users/${id}`, 'PUT', { username: eUsername, email: eEmail });
    setBusy(false);
    if (r.ok) {
      setMsg({ type: 'ok', text: 'User information updated.' });
      setEditId(null);
      void reload();
    } else {
      setMsg({ type: 'err', text: errMsg(r.body) });
    }
  };

  const startPw = (u: AdminUser) => {
    closePanels();
    setPwId(u.id);
    setPw('');
    setMsg(null);
  };
  const savePw = async (id: string) => {
    setBusy(true);
    setMsg(null);
    const r = await apiJson(`/api/admin/users/${id}/password`, 'POST', { password: pw });
    setBusy(false);
    if (r.ok) {
      setMsg({ type: 'ok', text: 'Password updated.' });
      setPwId(null);
      setPw('');
    } else {
      setMsg({ type: 'err', text: errMsg(r.body) });
    }
  };

  const remove = async (u: AdminUser) => {
    if (!confirm(`Delete user “${u.username}”? This cannot be undone.`)) return;
    setMsg(null);
    const r = await apiJson(`/api/admin/users/${u.id}`, 'DELETE');
    if (r.ok) {
      setMsg({ type: 'ok', text: `User “${u.username}” deleted.` });
      void reload();
    } else {
      setMsg({ type: 'err', text: errMsg(r.body) });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Admin accounts that can sign in to this panel. Everyone listed here has full admin access.</p>
        </div>
        <Button
          onClick={() => {
            setShowCreate((s) => !s);
            setMsg(null);
          }}
        >
          <UserPlus className="h-4 w-4" /> New user
        </Button>
      </div>

      {msg ? <p className={cn('text-sm font-medium', msg.type === 'ok' ? 'text-green-600' : 'text-red-600')}>{msg.text}</p> : null}

      {showCreate ? (
        <Card>
          <CardContent className="space-y-3 p-4">
            <h2 className="font-medium">Create a new admin user</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Username</label>
                <Input value={cUsername} onChange={(e) => setCUsername(e.target.value)} placeholder="e.g. priya" autoComplete="off" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <Input type="email" value={cEmail} onChange={(e) => setCEmail(e.target.value)} placeholder="priya@example.com" autoComplete="off" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Password</label>
                <Input type="password" value={cPassword} onChange={(e) => setCPassword(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={createUser} disabled={busy || !cUsername || !cEmail || cPassword.length < 8}>
                {busy ? <Spinner className="h-4 w-4 text-current" /> : <UserPlus className="h-4 w-4" />} Create user
              </Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)}>
                <X className="h-4 w-4" /> Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <AdminSearch onSearch={search} placeholder="Search username or email…" />

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-7 w-7" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No users found.</p>
      ) : (
        <>
          <Card>
            <CardContent className="divide-y p-2">
              {items.map((u) => {
                const isSelf = u.id === meId;
                return (
                  <div key={u.id} className="p-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full temple-gradient font-serif text-lg font-bold uppercase text-white">
                        {u.username.charAt(0)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{u.username}</span>
                          {isSelf ? <Badge variant="muted">you</Badge> : null}
                          <Badge variant="gold" className="inline-flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" /> {u.role}
                          </Badge>
                        </div>
                        <p className="truncate text-sm text-muted-foreground">{u.email}</p>
                      </div>
                      <div className="hidden text-right text-xs text-muted-foreground md:block">
                        <p>Last login: {fmt(u.lastLoginAt)}</p>
                        <p>Added: {fmt(u.createdAt)}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Button size="sm" variant="outline" onClick={() => startEdit(u)}>
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => startPw(u)}>
                          <KeyRound className="h-3.5 w-3.5" /> Password
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => remove(u)}
                          disabled={isSelf}
                          aria-label="Delete user"
                          title={isSelf ? 'You cannot delete your own account' : 'Delete user'}
                        >
                          <Trash2 className={cn('h-4 w-4', !isSelf && 'text-red-600')} />
                        </Button>
                      </div>
                    </div>

                    {editId === u.id ? (
                      <div className="mt-3 grid gap-3 rounded-lg border bg-muted/30 p-3 sm:grid-cols-[1fr_1fr_auto]">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">Username</label>
                          <Input value={eUsername} onChange={(e) => setEUsername(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">Email</label>
                          <Input type="email" value={eEmail} onChange={(e) => setEEmail(e.target.value)} />
                        </div>
                        <div className="flex items-end gap-2">
                          <Button size="sm" onClick={() => saveEdit(u.id)} disabled={busy || !eUsername || !eEmail}>
                            {busy ? <Spinner className="h-4 w-4 text-current" /> : <Save className="h-3.5 w-3.5" />} Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditId(null)} aria-label="Cancel edit">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : null}

                    {pwId === u.id ? (
                      <div className="mt-3 flex flex-wrap items-end gap-2 rounded-lg border bg-muted/30 p-3">
                        <div className="min-w-[12rem] flex-1 space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">New password for “{u.username}”</label>
                          <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" autoFocus />
                        </div>
                        <Button size="sm" onClick={() => savePw(u.id)} disabled={busy || pw.length < 8}>
                          {busy ? <Spinner className="h-4 w-4 text-current" /> : <KeyRound className="h-3.5 w-3.5" />} Update password
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setPwId(null)} aria-label="Cancel password change">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </CardContent>
          </Card>
          <AdminPager page={meta.page} pages={meta.pages} total={meta.total} onPage={setPage} />
        </>
      )}
    </div>
  );
}
