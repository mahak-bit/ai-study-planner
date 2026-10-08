import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/reveal';
import { ButtonLink } from '@/components/ui/button';

const steps = [
  { title: 'Consultation', body: 'We listen to your concerns, history and goals.' },
  { title: 'Assessment', body: 'A professional evaluation of your skin, hair or scalp concern.' },
  { title: 'Personalised Plan', body: 'Suitable treatment options are explained and discussed with you.' },
  { title: 'Follow-Up', body: 'Progress is reviewed and care refined where appropriate.' },
];

export function Journey() {
  return (
    <section aria-labelledby="journey-title" className="bg-ink py-24 text-ivory lg:py-36">
      <div className="container-x">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="journey-title"
            tone="dark"
            eyebrow="Your visit"
            title={
              <>
                What to expect, <em className="text-clay-soft">step by step</em>
              </>
            }
          />
          <Reveal>
            <ButtonLink href="/book" variant="light">
              Book a Consultation
            </ButtonLink>
          </Reveal>
        </div>

        <Stagger as="ol" className="relative mt-16 grid gap-12 sm:grid-cols-2 lg:mt-24 lg:grid-cols-4 lg:gap-8">
          {steps.map((s, i) => (
            <StaggerItem as="li" key={s.title} className="relative border-t border-ivory/15 pt-8">
              <span aria-hidden className="absolute -top-px left-0 h-px w-16 bg-clay-soft" />
              <span className="font-serif text-6xl text-ivory/25 lg:text-7xl">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-6 font-serif text-[1.8rem] text-ivory">{s.title}</h3>
              <p className="mt-3 max-w-xs leading-relaxed text-ivory/65">{s.body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
