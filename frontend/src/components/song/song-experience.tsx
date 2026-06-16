'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Square, Volume2, ScrollText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn, formatDuration } from '@/lib/utils';
import type { Lyrics } from '@/lib/types';

export function SongExperience({
  audioUrl,
  duration: initialDuration,
  lyrics,
}: {
  songId: string;
  audioUrl: string | null;
  duration: number | null;
  lyrics: Lyrics[];
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [dur, setDur] = useState(initialDuration ?? 0);
  const [volume, setVolume] = useState(1);
  const [autoScroll, setAutoScroll] = useState(false);
  const [mode, setMode] = useState<'tabs' | 'compare'>('tabs');

  const defaultLang = lyrics.find((l) => l.isDefault)?.languageCode ?? lyrics[0]?.languageCode ?? '';
  const [tab, setTab] = useState(defaultLang);
  const [leftLang, setLeftLang] = useState(lyrics[0]?.languageCode ?? '');
  const [rightLang, setRightLang] = useState(lyrics[1]?.languageCode ?? lyrics[0]?.languageCode ?? '');

  useEffect(() => {
    if (!autoScroll || !isPlaying || !dur || !scrollRef.current) return;
    const el = scrollRef.current;
    const ratio = Math.min(1, current / dur);
    el.scrollTo({ top: ratio * (el.scrollHeight - el.clientHeight), behavior: 'smooth' });
  }, [current, autoScroll, isPlaying, dur]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      void a.play();
      setIsPlaying(true);
    } else {
      a.pause();
      setIsPlaying(false);
    }
  };
  const stop = () => {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
    a.currentTime = 0;
    setIsPlaying(false);
    setCurrent(0);
  };
  const seek = (v: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = v;
    setCurrent(v);
  };
  const changeVol = (v: number) => {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const byCode = (code: string) => lyrics.find((l) => l.languageCode === code);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        {audioUrl ? (
          <>
            <audio
              ref={audioRef}
              src={audioUrl}
              preload="metadata"
              onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDur(e.currentTarget.duration || initialDuration || 0)}
              onEnded={() => setIsPlaying(false)}
            />
            <div className="flex items-center gap-3">
              <Button size="icon" onClick={toggle} aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-0.5 fill-current" />}
              </Button>
              <Button size="icon" variant="outline" onClick={stop} aria-label="Stop">
                <Square className="h-4 w-4" />
              </Button>
              <span className="w-11 text-right text-xs tabular-nums text-muted-foreground">{formatDuration(current)}</span>
              <input
                type="range"
                min={0}
                max={dur || 0}
                step={0.1}
                value={current}
                onChange={(e) => seek(parseFloat(e.target.value))}
                className="h-1.5 flex-1 cursor-pointer accent-[hsl(var(--primary))]"
                aria-label="Seek"
              />
              <span className="w-11 text-xs tabular-nums text-muted-foreground">{formatDuration(dur)}</span>
              <div className="hidden items-center gap-1.5 sm:flex">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(e) => changeVol(parseFloat(e.target.value))}
                  className="h-1.5 w-20 cursor-pointer accent-[hsl(var(--primary))]"
                  aria-label="Volume"
                />
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No audio available for this song.</p>
        )}
      </div>

      {lyrics.length > 0 ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-lg bg-muted p-1">
              <button
                onClick={() => setMode('tabs')}
                className={cn('rounded-md px-3 py-1.5 text-sm font-medium', mode === 'tabs' ? 'bg-card shadow-sm' : 'text-muted-foreground')}
              >
                Tabs
              </button>
              <button
                onClick={() => setMode('compare')}
                className={cn('rounded-md px-3 py-1.5 text-sm font-medium', mode === 'compare' ? 'bg-card shadow-sm' : 'text-muted-foreground')}
              >
                Side by side
              </button>
            </div>
            <label className="flex cursor-pointer select-none items-center gap-2 text-sm">
              <input type="checkbox" checked={autoScroll} onChange={(e) => setAutoScroll(e.target.checked)} className="accent-[hsl(var(--primary))]" />
              <ScrollText className="h-4 w-4" /> Auto-scroll
            </label>
          </div>

          <div ref={scrollRef} className="scrollbar-thin max-h-[460px] overflow-y-auto rounded-xl border bg-card p-5">
            {mode === 'tabs' ? (
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="mb-4">
                  {lyrics.map((l) => (
                    <TabsTrigger key={l.id} value={l.languageCode}>
                      {l.language}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {lyrics.map((l) => (
                  <TabsContent key={l.id} value={l.languageCode}>
                    <div className="lyrics-text font-serif">{l.content}</div>
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Select value={leftLang} onChange={(e) => setLeftLang(e.target.value)}>
                    {lyrics.map((l) => (
                      <option key={l.id} value={l.languageCode}>
                        {l.language}
                      </option>
                    ))}
                  </Select>
                  <Select value={rightLang} onChange={(e) => setRightLang(e.target.value)}>
                    {lyrics.map((l) => (
                      <option key={l.id} value={l.languageCode}>
                        {l.language}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <Badge variant="muted" className="mb-2">
                      {byCode(leftLang)?.language}
                    </Badge>
                    <div className="lyrics-text font-serif">{byCode(leftLang)?.content}</div>
                  </div>
                  <div>
                    <Badge variant="muted" className="mb-2">
                      {byCode(rightLang)?.language}
                    </Badge>
                    <div className="lyrics-text font-serif">{byCode(rightLang)?.content}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
