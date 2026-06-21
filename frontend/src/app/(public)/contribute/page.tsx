import type { Metadata } from 'next';
import { Mail, Music2, ScrollText, Music, FileText, Presentation, Drum, Heart, Languages, CheckCircle2, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { MotifDivider } from '@/components/cultural/motif';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Contribute',
  description: 'Share songs, lyrics and documents, help proofread, or support Vijayavipanchi.',
};

const EMAIL = 'contact@vijayavipanchi.org';

const MATERIALS = [
  { icon: Music2, label: 'Telugu Sangh songs' },
  { icon: ScrollText, label: 'Padyalu' },
  { icon: Music, label: 'Bhajanalu' },
  { icon: FileText, label: 'Sangh Documents / PDFs' },
  { icon: Presentation, label: 'Sangh / National / Patriotic / Devotional presentations' },
  { icon: Drum, label: 'Ghosh Rachans — Rachan Audio, Maukik Audio, Rachana Lipi images' },
];

const DONORS = [
  { en: 'Sampath Namburi', te: 'సంపత్ నంబూరి', phone: '(904) 533-5055', tel: '+19045335055' },
  { en: 'Vyaghreswarudu Kotturi', te: 'వ్యాఘ్రేశ్వరుడు కొత్తూరి', phone: '(210) 510-8691', tel: '+12105108691' },
];

export default function ContributePage() {
  return (
    <div className="container max-w-4xl space-y-10 py-10">
      <header className="space-y-4 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl temple-gradient text-white shadow-sm">
          <Heart className="h-7 w-7" />
        </span>
        <h1 className="font-serif text-4xl font-bold">Contribute</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Help grow Vijayavipanchi — share your collection, contribute lyrics, help proofread, or support us financially.
        </p>
        <a href={`mailto:${EMAIL}`} className={cn(buttonVariants({ size: 'lg' }))}>
          <Mail className="h-4 w-4" /> {EMAIL}
        </a>
      </header>

      <MotifDivider />

      {/* Share your collection */}
      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="font-serif text-2xl font-bold">Share your collection</h2>
          <p className="text-muted-foreground">Please mail us if you have any of the following:</p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {MATERIALS.map((m) => {
              const Icon = m.icon;
              return (
                <li key={m.label} className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium">{m.label}</span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      {/* Lyrics + proofreading */}
      <Card>
        <CardContent className="space-y-3 p-6">
          <h2 className="flex items-center gap-2 font-serif text-2xl font-bold">
            <Languages className="h-6 w-6 text-primary" /> Lyrics &amp; proofreading
          </h2>
          <p className="flex items-start gap-2 text-foreground/90">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <span>
              Contribute lyrics for <strong>Songs / Padyalu / Bhajanalu</strong> in Telugu Unicode using{' '}
              <a href="https://www.google.com/intl/te/inputtools/try/" target="_blank" rel="noreferrer" className="text-primary underline">
                Google Transliterate
              </a>
              .
            </span>
          </p>
          <p className="flex items-start gap-2 text-foreground/90">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <span>You can also help with proof-reading and mail us the corrections.</span>
          </p>
        </CardContent>
      </Card>

      {/* Donations */}
      <Card className="border-gold/40">
        <CardContent className="space-y-5 p-6">
          <h2 className="flex items-center gap-2 font-serif text-2xl font-bold">
            <Heart className="h-6 w-6 text-accent" /> Special appeal — support us
          </h2>
          <p className="text-foreground/90">
            Support <strong>Vijayavipanchi</strong> financially to pay for hosting and development costs. For US donations, you
            can Zelle to the numbers below. Thank you for all your contributions.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            విజయవిపంచి Hosting మరియు అభివృద్ధి ఖర్చులను చెల్లించడానికి ఆర్థికంగా మద్దతు ఇవ్వగలరు. అమెరికా నుండి, మీరు కింద ఇచ్చిన US
            నంబర్లకు Zelle చేయవచ్చు.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {DONORS.map((d) => (
              <div key={d.tel} className="rounded-xl border bg-muted/30 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-serif font-semibold">{d.en}</p>
                  <Badge variant="gold">Zelle</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{d.te}</p>
                <a href={`tel:${d.tel}`} className="mt-3 inline-flex items-center gap-2 font-medium text-primary hover:underline">
                  <Phone className="h-4 w-4" /> {d.phone}
                </a>
              </div>
            ))}
          </div>

          <p className="text-center font-serif text-lg font-medium">మీ సహాయ సహకారాలకు ధన్యవాదాలు.</p>
        </CardContent>
      </Card>

      {/* Mail CTA */}
      <div className="rounded-2xl border bg-card p-6 text-center shadow-sm">
        <p className="mb-3 text-muted-foreground">For any of the above, please mail us:</p>
        <a href={`mailto:${EMAIL}`} className={cn(buttonVariants({ variant: 'accent', size: 'lg' }))}>
          <Mail className="h-4 w-4" /> {EMAIL}
        </a>
      </div>
    </div>
  );
}
