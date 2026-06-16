'use client';

import { useEffect, useState } from 'react';
import { Music, Video, FileText, CalendarDays, MessageSquare, Clock, HardDrive, Play } from 'lucide-react';
import { apiJson } from '@/lib/client-api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { formatNumber } from '@/lib/utils';

interface Stats {
  totals: { songs: number; videos: number; articles: number; events: number; comments: number; pendingComments: number };
  plays: { daily: number; monthly: number };
  storage: { totalBytes: number; totalFiles: number; perFolder: Record<string, { bytes: number; files: number }> };
  topSongs: { id: string; title: string; slug: string; playCount: number }[];
  recentActivity: { action: string; entity: string; admin: string | null; at: string }[];
}

function formatBytes(n: number): string {
  if (!n) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(1)} ${units[i]}`;
}

const ICONS = { songs: Music, videos: Video, articles: FileText, events: CalendarDays, comments: MessageSquare };

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiJson<Stats>('/api/admin/dashboard/stats').then((r) => {
      if (r.ok) setStats(r.body);
      setLoading(false);
    });
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  if (!stats) return <p className="text-muted-foreground">Could not load dashboard stats.</p>;

  const cards = [
    { key: 'songs', label: 'Songs', value: stats.totals.songs },
    { key: 'videos', label: 'Videos', value: stats.totals.videos },
    { key: 'articles', label: 'Articles', value: stats.totals.articles },
    { key: 'events', label: 'Events', value: stats.totals.events },
    { key: 'comments', label: 'Comments', value: stats.totals.comments },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your portal</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => {
          const Icon = ICONS[c.key];
          return (
            <Card key={c.key}>
              <CardContent className="flex items-center gap-3 p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-2xl font-bold">{c.value}</p>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" /> Pending comments
            </p>
            <p className="mt-1 text-3xl font-bold">{stats.totals.pendingComments}</p>
            {stats.totals.pendingComments > 0 ? <Badge variant="warning" className="mt-2">Needs moderation</Badge> : null}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Play className="h-4 w-4" /> Plays today
            </p>
            <p className="mt-1 text-3xl font-bold">{formatNumber(stats.plays.daily)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" /> Plays this month
            </p>
            <p className="mt-1 text-3xl font-bold">{formatNumber(stats.plays.monthly)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <HardDrive className="h-4 w-4" /> Storage used
            </p>
            <p className="mt-1 text-3xl font-bold">{formatBytes(stats.storage.totalBytes)}</p>
            <p className="text-xs text-muted-foreground">{stats.storage.totalFiles} files</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-3 font-serif text-lg font-semibold">Most Played</h2>
            <ul className="space-y-2">
              {stats.topSongs.map((s, i) => (
                <li key={s.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">
                    <span className="mr-2 font-semibold text-primary/70">{i + 1}.</span>
                    {s.title}
                  </span>
                  <span className="shrink-0 text-muted-foreground">{formatNumber(s.playCount)} plays</span>
                </li>
              ))}
              {stats.topSongs.length === 0 ? <li className="text-sm text-muted-foreground">No data yet.</li> : null}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-3 font-serif text-lg font-semibold">Recent Activity</h2>
            <ul className="space-y-2">
              {stats.recentActivity.map((a, i) => (
                <li key={i} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">
                    <Badge variant="muted" className="mr-2">
                      {a.action}
                    </Badge>
                    {a.entity}
                    {a.admin ? <span className="text-muted-foreground"> · {a.admin}</span> : null}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(a.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                </li>
              ))}
              {stats.recentActivity.length === 0 ? <li className="text-sm text-muted-foreground">No activity yet.</li> : null}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
