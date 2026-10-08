import { ClipboardList, Leaf, MessagesSquare, Stethoscope } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { Stagger, StaggerItem } from '@/components/ui/reveal';

const pillars = [
  {
    icon: Stethoscope,
    title: 'Personalised Diagnosis',
    body: "Every concern begins with understanding the individual — their skin, hair, history and lifestyle — before anything is recommended.",
  },
  {
    icon: ClipboardList,
    title: 'Evidence-Based Care',
    body: 'Treatment options are guided by a professional dermatological evaluation and discussed clearly, including what is realistic.',
  },
  {
    icon: Leaf,
    title: 'Natural-Looking Results',
    body: 'The aim is healthy, balanced skin and hair — care that respects how you look, rather than changing who you are.',
  },
  {
    icon: MessagesSquare,
    title: 'Patient-Centred Approach',
    body: 'Clear communication, time for your questions, and plans that are reviewed and refined at follow-up.',
  },
];

export function Why() {
  return (
    <section aria-labelledby="why-title" className="bg-cream py-24 lg:py-36">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <SectionHeading
            id="why-title"
            className="lg:col-span-7"
            eyebrow="Why Twacha Clinic"
            title={
              <>
                Considered care, <em className="text-clay">from the first conversation.</em>
              </>
            }
          />
          <p className="text-base leading-relaxed text-muted lg:col-span-4 lg:col-start-9 lg:text-lg">
            Skin and hair concerns are personal. We take the time to understand yours, and to explain every step of your care.
          </p>
        </div>

        <Stagger className="mt-16 grid gap-px bg-line sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
          {pillars.map(({ icon: Icon, title, body }, i) => (
            <StaggerItem key={title} as="article" className="group relative bg-cream p-8 transition-colors duration-500 hover:bg-ivory lg:p-10">
              <span className="font-serif text-sm text-taupe">0{i + 1}</span>
              <Icon aria-hidden strokeWidth={1.3} className="mt-10 size-8 text-clay transition-transform duration-500 ease-[var(--ease-luxe)] group-hover:-translate-y-1" />
              <h3 className="mt-6 font-serif text-[1.7rem] leading-tight text-ink">{title}</h3>
              <p className="mt-4 text-[0.95rem] leading-relaxed text-muted">{body}</p>
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-clay transition-transform duration-700 ease-[var(--ease-luxe)] group-hover:scale-x-100" />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
