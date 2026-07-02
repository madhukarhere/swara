import type { Metadata } from 'next';
import Link from 'next/link';
import { FileCheck2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { MotifDivider } from '@/components/cultural/motif';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description:
    'Terms and conditions for using Vijayavipanchi.org — a non-profit portal for patriotic and devotional Telugu music.',
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

export default function TermsPage() {
  return (
    <div className="container max-w-3xl space-y-8 py-10">
      <header className="space-y-4 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl temple-gradient text-white shadow-sm">
          <FileCheck2 className="h-7 w-7" />
        </span>
        <h1 className="font-serif text-4xl font-bold">Terms &amp; Conditions</h1>
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          .:: Terms and Conditions ::.
        </p>
        <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
          By accessing or using {SITE} (the &ldquo;Site&rdquo;) you agree to these terms. If you do not agree, please do not
          use the Site.
        </p>
      </header>

      <MotifDivider />

      <Card>
        <CardContent className="space-y-7 p-6 text-foreground/90 sm:p-8">
          <Section n={1} title="Purpose of the Site">
            <p className="leading-relaxed">
              {SITE} is a <strong>non-profit, non-commercial</strong> portal maintained for the entertainment and promotion
              of patriotic, devotional and cultural Telugu music, lyrics, articles and related material. The Site does not
              sell, license or monetise any content in any form.
            </p>
          </Section>

          <Section n={2} title="Content Ownership &amp; Copyright">
            <p className="leading-relaxed">
              All songs, lyrics, videos, images, articles, quotes, translations and other material on the Site
              (&ldquo;Content&rdquo;) remain the property of their respective owners, authors, artists, composers, lyricists,
              publishers or record labels. Their appearance on the Site does not transfer any rights.
            </p>
            <p className="leading-relaxed">
              Visitors are encouraged to purchase or obtain such material through the original sources and to promote the
              rightful authors and artists.
            </p>
          </Section>

          <Section n={3} title="User-Contributed Content">
            <p className="leading-relaxed">
              Portions of the Content may be submitted by users, volunteers or third parties. By submitting anything to the
              Site, the contributor represents and warrants that they own the rights to it or have obtained all necessary
              permissions, and grants {SITE} a non-exclusive, non-commercial licence to display it.
            </p>
            <p className="leading-relaxed">
              <strong>{SITE} does not verify, endorse, or claim ownership of user-contributed Content</strong> and is not
              responsible for any inaccuracy, infringement, misuse or misrepresentation contained in it.
            </p>
          </Section>

          <Section n={4} title="Copyright Complaints &amp; Takedown">
            <p className="leading-relaxed">
              Any rights-holder who believes that Content on the Site infringes their copyright, trademark or other rights
              may contact us at{' '}
              <a href={`mailto:${EMAIL}`} className="text-primary underline">
                {EMAIL}
              </a>{' '}
              with sufficient identification of the material and their rights.
            </p>
            <p className="leading-relaxed">
              Verified requests will be addressed within <strong>24 – 48 hours</strong> of receipt, and infringing material
              will be promptly removed. Submitting a takedown request does not create any additional liability on the part
              of the Site.
            </p>
          </Section>

          <Section n={5} title="No Warranty">
            <p className="leading-relaxed">
              The Site and its Content are provided <strong>&ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo;</strong>,
              without warranties of any kind, express or implied, including but not limited to accuracy, completeness,
              fitness for a particular purpose, non-infringement, availability, or freedom from errors, viruses or
              interruptions.
            </p>
          </Section>

          <Section n={6} title="Limitation of Liability">
            <p className="leading-relaxed">
              To the fullest extent permitted by law, {SITE}, its maintainers, contributors, volunteers and affiliates
              shall <strong>not be liable</strong> for any direct, indirect, incidental, consequential, special or
              exemplary damages arising out of:
            </p>
            <ul className="ml-5 list-disc space-y-1 leading-relaxed">
              <li>the use of, or inability to use, the Site or its Content;</li>
              <li>any inaccuracy, error, omission or infringement in Content posted by users or third parties;</li>
              <li>any unauthorised access to or alteration of your submissions;</li>
              <li>any misuse of Content downloaded, streamed or shared from the Site by any visitor;</li>
              <li>any loss of data, revenue, goodwill or opportunity in connection with the Site.</li>
            </ul>
          </Section>

          <Section n={7} title="User Conduct &amp; Permitted Use">
            <p className="leading-relaxed">
              Content on the Site is offered for personal, non-commercial listening, learning and cultural appreciation.
              You agree <strong>not to</strong>:
            </p>
            <ul className="ml-5 list-disc space-y-1 leading-relaxed">
              <li>repackage, re-host, resell or otherwise redistribute Content for commercial gain;</li>
              <li>scrape, mirror or systematically copy the Site;</li>
              <li>upload material you do not have the right to share;</li>
              <li>attempt to disrupt, reverse-engineer or gain unauthorised access to the Site or its systems;</li>
              <li>use the Site to violate any applicable law or the rights of any third party.</li>
            </ul>
            <p className="leading-relaxed">
              {SITE} reserves the right to remove Content or block access without notice.
            </p>
          </Section>

          <Section n={8} title="Third-Party Links &amp; Services">
            <p className="leading-relaxed">
              The Site may link to third-party websites, videos, players or services. {SITE} does not control and is not
              responsible for the availability, accuracy or content of such external resources, and their inclusion does not
              imply any endorsement.
            </p>
          </Section>

          <Section n={9} title="Privacy">
            <p className="leading-relaxed">
              {SITE} collects only the minimum information required to operate the Site (for example, submissions to the
              contact form). Content you voluntarily submit may be displayed publicly. See the{' '}
              <Link href="/disclaimer" className="text-primary underline">
                Disclaimer
              </Link>{' '}
              for additional notices.
            </p>
          </Section>

          <Section n={10} title="Indemnity">
            <p className="leading-relaxed">
              You agree to indemnify and hold harmless {SITE}, its maintainers and contributors from and against any claim,
              liability, damage, loss or expense (including reasonable legal fees) arising out of your use of the Site or
              your breach of these terms.
            </p>
          </Section>

          <Section n={11} title="Changes to These Terms">
            <p className="leading-relaxed">
              These terms may be updated at any time <strong>without prior intimation</strong>. Continued use of the Site
              after any change constitutes acceptance of the revised terms. The current version is always the one published
              on this page.
            </p>
          </Section>

          <Section n={12} title="Governing Law &amp; Jurisdiction">
            <p className="leading-relaxed">
              These terms shall be governed by and construed in accordance with the laws of <strong>India</strong>, without
              regard to conflict-of-laws principles. Any dispute arising out of or in connection with the Site or these
              terms shall be subject to the exclusive jurisdiction of the competent courts, and users outside India remain
              solely responsible for compliance with the laws of their own jurisdiction.
            </p>
          </Section>

          <Section n={13} title="Contact">
            <p className="leading-relaxed">
              For any questions, takedown requests or feedback regarding these terms, please write to{' '}
              <a href={`mailto:${EMAIL}`} className="text-primary underline">
                {EMAIL}
              </a>
              .
            </p>
          </Section>

          <p className="border-t pt-5 text-center text-sm italic text-muted-foreground">
            By continuing to use {SITE}, you acknowledge that you have read, understood and agreed to these Terms &amp; Conditions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
