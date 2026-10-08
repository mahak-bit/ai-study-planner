import { GraduationCap } from 'lucide-react';
import { clinic } from '@/content/clinic';
import { ButtonLink } from '@/components/ui/button';
import { MediaFrame } from '@/components/ui/media-frame';
import { Placeholder } from '@/components/ui/placeholder';
import { Reveal } from '@/components/ui/reveal';

export function About() {
  const { doctor } = clinic;

  return (
    <section id="about" aria-labelledby="about-title" className="py-24 lg:py-36">
      <div className="container-x grid gap-14 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-5">
          <div className="group lg:sticky lg:top-28">
            <MediaFrame slot="doctor" sizes="(min-width: 1024px) 40vw, 100vw" className="aspect-[4/5] w-full" />
            <div className="mt-5 flex items-end justify-between gap-4">
              <div>
                <p className="font-serif text-2xl text-ink">{doctor.name}</p>
                <p className="mt-1 text-sm text-muted">
                  {doctor.title}, {clinic.name}
                </p>
              </div>
              <p aria-hidden className="font-serif text-3xl text-clay/70 italic">
                Vivek Singhvi
              </p>
            </div>
          </div>
        </Reveal>

        <div className="lg:col-span-7 lg:pt-6">
          <Reveal>
            <p className="eyebrow">About the doctor</p>
            <h2 id="about-title" className="display mt-5 text-[2.6rem] sm:text-5xl lg:text-[4rem]">
              Meet <em className="text-clay">Dr. Vivek Singhvi</em>
            </h2>
          </Reveal>

          <Reveal delay={0.1} className="mt-10 space-y-6 text-base leading-[1.8] text-muted sm:text-lg">
            <p className="font-serif text-2xl leading-snug text-charcoal sm:text-[1.7rem]">
              {doctor.name} is a dermatologist practising at {clinic.name} in Talwandi, {clinic.city}, caring for patients
              with skin, hair, scalp and aesthetic concerns.
            </p>
            <p>
              The practice covers clinical dermatology — from acne, pigmentation and infections to long-term conditions such as
              psoriasis, eczema and vitiligo — together with hair and scalp care and selected aesthetic procedures.
            </p>
            <p>
              The approach at {clinic.name} is simple: listen carefully, examine thoroughly, and explain clearly. Every plan is
              built around a professional diagnosis and discussed openly, so you understand your options, what is realistic,
              and how progress will be reviewed.
            </p>
          </Reveal>

          <Reveal delay={0.15} className="mt-12 grid gap-px border border-line bg-line sm:grid-cols-2">
            <div className="bg-ivory p-6 sm:col-span-2">
              <p className="eyebrow flex items-center gap-2">
                <GraduationCap aria-hidden className="size-4" /> Qualifications
              </p>
              <ul className="mt-4 space-y-3">
                {doctor.qualifications.value.map((q) => (
                  <li key={q.degree} className="grid gap-0.5 sm:grid-cols-2 sm:items-baseline sm:gap-6">
                    <span className="font-medium text-charcoal">{q.degree}</span>
                    <span className="text-sm text-muted">{q.institution}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-ivory p-6">
              <p className="eyebrow">Experience</p>
              <p className="mt-3 text-charcoal">
                {doctor.experience ? doctor.experience.value : <Placeholder>Add years of experience</Placeholder>}
              </p>
            </div>
            <div className="bg-ivory p-6">
              <p className="eyebrow">Memberships</p>
              <p className="mt-3 text-charcoal">
                {doctor.memberships ? doctor.memberships.value.join(', ') : <Placeholder>Add professional memberships</Placeholder>}
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.2} className="mt-12 flex flex-wrap items-center gap-6">
            <ButtonLink href="/book">Book a Consultation</ButtonLink>
            <p className="text-sm text-muted">Consultations at {clinic.name}, Talwandi.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
