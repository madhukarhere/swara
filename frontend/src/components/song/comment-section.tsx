'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { StarRating } from '@/components/star-rating';
import { apiJson } from '@/lib/client-api';
import type { Comment } from '@/lib/types';

interface Summary {
  averageRating: number | null;
  ratingCount: number;
  total: number;
}
interface CommentsResp {
  data: Comment[];
  summary: Summary;
}

export function CommentSection({ songId }: { songId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [captcha, setCaptcha] = useState<{ token: string; image: string } | null>(null);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const loadComments = useCallback(async () => {
    setLoading(true);
    const r = await apiJson<CommentsResp>(`/api/songs/${songId}/comments`);
    if (r.ok) {
      setComments(r.body.data);
      setSummary(r.body.summary);
    }
    setLoading(false);
  }, [songId]);

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
    void loadComments();
    void loadCaptcha();
  }, [loadComments, loadCaptcha]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    const r = await apiJson<{ message?: string; error?: string }>(`/api/songs/${songId}/comments`, 'POST', {
      name,
      email: email || undefined,
      rating: rating || undefined,
      comment,
      captchaToken: captcha?.token,
      captchaAnswer: answer,
    });
    setSubmitting(false);
    if (r.ok) {
      setMsg({ type: 'ok', text: r.body.message || 'Submitted for moderation.' });
      setName('');
      setEmail('');
      setRating(0);
      setComment('');
    } else {
      setMsg({ type: 'err', text: r.body.error || 'Could not submit your comment.' });
    }
    void loadCaptcha();
  };

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <h2 className="flex items-center gap-2 font-serif text-2xl font-bold">
          <MessageSquare className="h-5 w-5 text-primary" /> Comments
        </h2>
        {summary?.averageRating ? (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <StarRating value={Math.round(summary.averageRating)} readOnly size={15} />
            {summary.averageRating} ({summary.ratingCount})
          </span>
        ) : null}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{c.name}</span>
                  {c.rating ? <StarRating value={c.rating} readOnly size={14} /> : null}
                </div>
                <p className="mt-1.5 whitespace-pre-wrap text-sm text-foreground/90">{c.comment}</p>
                {c.createdAt ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardContent className="p-5">
          <h3 className="mb-4 font-serif text-lg font-semibold">Leave a comment</h3>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="c-name">Name *</Label>
                <Input id="c-name" required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-email">Email (optional)</Label>
                <Input id="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Rating</Label>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-comment">Comment *</Label>
              <Textarea id="c-comment" required minLength={2} maxLength={2000} value={comment} onChange={(e) => setComment(e.target.value)} />
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
                <Input
                  className="max-w-[160px]"
                  placeholder="Enter the text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  required
                />
              </div>
            </div>
            {msg ? (
              <p className={msg.type === 'ok' ? 'text-sm font-medium text-green-600' : 'text-sm font-medium text-red-600'}>{msg.text}</p>
            ) : null}
            <Button type="submit" disabled={submitting}>
              {submitting ? <Spinner className="h-4 w-4 text-current" /> : null}
              Submit comment
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
