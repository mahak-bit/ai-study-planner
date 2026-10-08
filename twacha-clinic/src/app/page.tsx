import { Hero } from '@/components/sections/hero';
import { TrustStrip } from '@/components/sections/trust-strip';
import { About } from '@/components/sections/about';
import { Why } from '@/components/sections/why';
import { Conditions } from '@/components/sections/conditions';
import { Treatments } from '@/components/sections/treatments';
import { Featured } from '@/components/sections/featured';
import { BeforeAfter } from '@/components/sections/before-after';
import { Journey } from '@/components/sections/journey';
import { Gallery } from '@/components/sections/gallery';
import { Reviews } from '@/components/sections/reviews';
import { Faq } from '@/components/sections/faq';
import { Contact } from '@/components/sections/contact';
import { CtaBand } from '@/components/sections/cta-band';
import { faqs } from '@/content/faqs';
import { serializeJsonLd } from '@/lib/structured-data';

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }} />
      <Hero />
      <TrustStrip />
      <About />
      <Why />
      <Conditions />
      <Treatments />
      <Featured />
      <BeforeAfter />
      <Journey />
      <Gallery />
      <Reviews />
      <Faq />
      <Contact />
      <CtaBand />
    </>
  );
}
