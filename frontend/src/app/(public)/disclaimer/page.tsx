import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { MotifDivider } from '@/components/cultural/motif';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description:
    'Vijayavipanchi is a non-profit portal sharing devotional and cultural Telugu music. Copyright owners may request removal of any material.',
};

const SITE = 'VijayaVipanchi.org';
const EMAIL = 'vijayavipanchi@gmail.com';

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="font-serif text-xl font-bold">
        <span className="mr-2 text-primary">{n}.</span>
        {title}
      </h2>
      <div className="space-y-3 text-foreground/90">{children}</div>
    </section>
  );
}

export default function DisclaimerPage() {
  return (
    <div className="container max-w-3xl space-y-8 py-10">
      <header className="space-y-4 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl temple-gradient text-white shadow-sm">
          <ShieldAlert className="h-7 w-7" />
        </span>
        <h1 className="font-serif text-4xl font-bold">Disclaimer</h1>
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          .:: Notice ::.
        </p>
      </header>

      <MotifDivider />

      {/* Original site-owner notice — kept prominent, then followed by structured legal disclaimers. */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="space-y-4 p-6 text-foreground/90 sm:p-8">
          <p className="leading-relaxed">
            This site is maintained strictly on a <strong>non-profit basis</strong>, to share the beauty we sensed in some
            music and discourses, with the Internet public — and to increase the availability of some rare and precious
            material for appreciation by a wider audience.
          </p>
          <p className="leading-relaxed">
            Visitors are encouraged to purchase these works from their original sources and to promote the authors and
            artists.
          </p>
          <p className="leading-relaxed">
            Requests for removal of any copyrighted material by the owner will be <strong>promptly complied with</strong>.
            Material appearing on this site is for non-commercial use only and may not be repackaged or redistributed for
            gain.
          </p>
          <p className="text-center font-serif text-lg italic text-primary">
            PLEASE COMPLY with this so that many people can continue to enjoy it.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-7 p-6 text-foreground/90 sm:p-8">
          <Section n={1} title="General Information Only">
            <p className="leading-relaxed">
              The information, music, lyrics, articles, translations, quotes and other material published on {SITE}
              (&ldquo;Content&rdquo;) is provided <strong>for general informational, educational, cultural and devotional
              purposes only</strong>. Nothing on this site constitutes professional advice of any kind — legal, medical,
              financial, religious, spiritual or otherwise.
            </p>
          </Section>

          <Section n={2} title="No Warranty of Accuracy or Completeness">
            <p className="leading-relaxed">
              While every reasonable effort is made to ensure that Content is accurate and up to date, {SITE} makes{' '}
              <strong>no representations or warranties</strong>, express or implied, about the accuracy, completeness,
              reliability, suitability or availability of the Content. Any reliance you place on such material is strictly
              at your own risk.
            </p>
          </Section>

          <Section n={3} title="Copyright &amp; Intellectual Property">
            <p className="leading-relaxed">
              All songs, lyrics, videos, images, articles, quotes and other Content remain the property of their
              respective owners — authors, composers, lyricists, singers, artists, publishers or record labels. Their
              inclusion on {SITE} is intended solely for non-commercial appreciation and cultural preservation and
              <strong> does not transfer or waive any rights</strong>.
            </p>
            <p className="leading-relaxed">
              {SITE} does not claim ownership of third-party Content and asserts no exclusive rights over it. Where an
              owner requests removal of copyrighted material, we will act within <strong>24 – 48 hours</strong> of receiving
              a valid notice at{' '}
              <a href={`mailto:${EMAIL}`} className="text-primary underline">
                {EMAIL}
              </a>
              .
            </p>
          </Section>

          <Section n={4} title="Fair Use &amp; Non-Commercial Purpose">
            <p className="leading-relaxed">
              {SITE} operates on a strictly <strong>non-profit, non-commercial</strong> basis. Content is shared for
              educational, cultural and devotional appreciation, and no revenue is derived from the sale, licensing or
              monetisation of any material.
            </p>
          </Section>

          <Section n={5} title="User-Submitted Content">
            <p className="leading-relaxed">
              Portions of the Content may have been contributed by users, volunteers or third parties. {SITE} does{' '}
              <strong>not independently verify, endorse or claim responsibility</strong> for any such contributions and
              is not liable for their accuracy, completeness or lawfulness. Contributors are solely responsible for
              ensuring that they have the right to share the material they submit.
            </p>
          </Section>

          <Section n={6} title="Views &amp; Opinions">
            <p className="leading-relaxed">
              Any views, interpretations, translations or opinions expressed in articles, quotes, notes or discourses are
              those of the respective authors, speakers or contributors and <strong>do not necessarily reflect</strong>
              those of {SITE}, its maintainers or its volunteers.
            </p>
          </Section>

          <Section n={7} title="Religious, Cultural &amp; Devotional Content">
            <p className="leading-relaxed">
              Content of a devotional, religious, philosophical or spiritual nature is presented for cultural
              appreciation and personal reflection. It is <strong>not a substitute</strong> for guidance from qualified
              teachers, priests, scholars or institutions and should not be construed as endorsing any specific tradition,
              sect, ideology or belief.
            </p>
          </Section>

          <Section n={8} title="External Links &amp; Third-Party Services">
            <p className="leading-relaxed">
              {SITE} may contain links to external websites, video players, streaming services or other third-party
              resources. These are provided for convenience only. {SITE} has no control over the availability, accuracy
              or content of external sites and <strong>accepts no responsibility</strong> for them, and their inclusion
              does not imply endorsement.
            </p>
          </Section>

          <Section n={9} title="Trademarks &amp; Names">
            <p className="leading-relaxed">
              Any trademarks, service marks, trade names, artist names, movie titles, film-studio logos, publisher names
              or record-label marks appearing on {SITE} are the property of their respective owners. Their appearance is
              solely for identification and reference and <strong>does not imply any affiliation, sponsorship or
              endorsement</strong>.
            </p>
          </Section>

          <Section n={10} title="Availability &amp; Errors">
            <p className="leading-relaxed">
              {SITE} is offered on an <strong>&ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo;</strong> basis. We do not
              warrant that the site will be uninterrupted, secure, error-free or free of viruses, and we shall not be
              liable for any loss or damage arising from downtime, technical errors or omissions.
            </p>
          </Section>

          <Section n={11} title="Limitation of Liability">
            <p className="leading-relaxed">
              To the fullest extent permitted by law, {SITE}, its maintainers, contributors, volunteers and affiliates
              shall <strong>not be liable</strong> for any direct, indirect, incidental, consequential or exemplary
              damages arising out of the use of, reliance on, or inability to use the site or its Content — including,
              without limitation, damages for loss of data, revenue, goodwill or opportunity.
            </p>
          </Section>

          <Section n={12} title="Right to Remove or Modify Content">
            <p className="leading-relaxed">
              {SITE} reserves the right, at its sole discretion and without notice, to modify, suspend or remove any
              Content — including material that is reported as infringing, inaccurate, offensive or contrary to the
              spirit of the site.
            </p>
          </Section>

          <Section n={13} title="Changes to This Disclaimer">
            <p className="leading-relaxed">
              This disclaimer may be updated at any time without prior notice. The version published on this page is the
              current one and takes effect immediately upon posting. Continued use of {SITE} constitutes acceptance of
              the revised disclaimer.
            </p>
          </Section>

          <Section n={14} title="Contact">
            <p className="leading-relaxed">
              For takedown requests, copyright concerns, corrections or any other questions relating to this disclaimer,
              please write to{' '}
              <a href={`mailto:${EMAIL}`} className="text-primary underline">
                {EMAIL}
              </a>
              . See also our{' '}
              <Link href="/terms" className="text-primary underline">
                Terms &amp; Conditions
              </Link>{' '}
              for the full rules of use.
            </p>
          </Section>

          <p className="border-t pt-5 text-center text-sm italic text-muted-foreground">
            By using {SITE} you acknowledge that you have read, understood and accepted this Disclaimer.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
