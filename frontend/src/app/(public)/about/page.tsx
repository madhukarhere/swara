import type { Metadata } from 'next';
import Link from 'next/link';
import { Users2, Globe2, HeartHandshake, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MotifDivider } from '@/components/cultural/motif';
import { Om } from '@/components/icons/cultural-icons';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Vijayavipanchi is a global community of Telugu-speaking Hindus, inspired by the Sangh Parivar, sharing Telugu Sangh songs, padyalu, shlokas, bhajanalu and ghosh online since April 2011.',
};

export default function AboutPage() {
  return (
    <div className="container max-w-3xl space-y-8 py-10">
      <header className="space-y-4 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl temple-gradient text-white shadow-sm">
          <Users2 className="h-7 w-7" />
        </span>
        <h1 className="font-serif text-4xl font-bold">About Us</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          A global community of Telugu-speaking Hindus, sharing our shared heritage — one song, shloka and padyam at a time.
        </p>
      </header>

      <MotifDivider />

      {/* Who we are */}
      <Card>
        <CardContent className="space-y-4 p-6 text-foreground/90 sm:p-8">
          <h2 className="flex items-center gap-2 font-serif text-2xl font-bold">
            <Sparkles className="h-6 w-6 text-primary" /> Who we are
          </h2>
          <p className="leading-relaxed">
            We are <strong>Swayamsevaks</strong> inspired by the <strong>Sangh Parivar</strong>, and our endeavour is to
            enlighten fellow Hindus in whatever small way we can.
          </p>
          <p className="leading-relaxed">
            We are a <strong>global community</strong> of dedicated Telugu-speaking Hindus with a socio-cultural mission —
            come together to protect and preserve our timeless Hindu heritage, and to work to retain its glory and
            pre-eminence in the culture and society of the ten-crore Telugu-speaking population around the world.
          </p>
        </CardContent>
      </Card>

      {/* Vijayavipanchi */}
      <Card>
        <CardContent className="space-y-4 p-6 text-foreground/90 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 font-serif text-2xl font-bold">
              <Globe2 className="h-6 w-6 text-primary" /> About Vijayavipanchi
            </h2>
            <Badge variant="gold">Since April 2011</Badge>
          </div>
          <p className="leading-relaxed">
            <strong>Vijayavipanchi</strong>, started in <strong>April 2011</strong>, is one effort in this direction. Our
            aim has been to share <strong>Telugu Sangh songs</strong> online — songs that have inspired us throughout our
            own Sangh journey and that continue to light the way for our future steps.
          </p>
          <p className="leading-relaxed">
            Alongside the songs, we are steadily growing the site&rsquo;s collection of <strong>Padyalu</strong>,{' '}
            <strong>Shlokalu</strong>, <strong>Bhajanalu</strong> and <strong>Ghosh</strong> material — so that this rich
            body of culture and devotion remains accessible to Telugu speakers everywhere.
          </p>
        </CardContent>
      </Card>

      {/* Help us grow */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="space-y-4 p-6 text-foreground/90 sm:p-8">
          <h2 className="flex items-center gap-2 font-serif text-2xl font-bold">
            <HeartHandshake className="h-6 w-6 text-primary" /> Help us grow
          </h2>
          <p className="leading-relaxed">
            We warmly welcome your feedback — on the website itself or on the web content — and every suggestion will be
            promptly acted upon.
          </p>
          <p className="leading-relaxed">
            Please help us build this further by contributing web content, lyric editing, and corrections for songs,
            bhajans, padyalu and ghosh. Do also let us know how we can improve the experience and better ourselves in
            taking this mission forward.
          </p>
          <p className="pt-1">
            <Link href="/contribute" className="text-primary underline underline-offset-2 hover:no-underline">
              Learn how to contribute →
            </Link>
          </p>
        </CardContent>
      </Card>

      {/* Closing */}
      <div className="flex flex-col items-center gap-3 pt-2 text-center">
        <Om className="h-8 w-8 text-primary" />
        <p className="font-serif text-3xl font-bold tracking-wide text-primary">Vande Mataram.</p>
      </div>
    </div>
  );
}
