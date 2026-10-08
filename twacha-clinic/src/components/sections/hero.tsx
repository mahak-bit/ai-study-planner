'use client';

import Link from 'next/link';
import { m } from 'framer-motion';
import { ArrowDown, MapPin } from 'lucide-react';
import { clinic, directionsHref } from '@/content/clinic';
import { ButtonLink } from '@/components/ui/button';
import { MediaFrame } from '@/components/ui/media-frame';
import { TextReveal } from '@/components/ui/reveal';

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const md = clinic.doctor.qualifications.value[0];

  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-24">
      <div aria-hidden className="pointer-events-none absolute -top-40 right-[-10%] h-[38rem] w-[38rem] rounded-full bg-sand/70 blur-3xl" />

      <div className="container-x relative grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6 xl:col-span-6">
          <m.p
            className="eyebrow flex items-center gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <span aria-hidden className="h-px w-8 bg-clay" />
            {clinic.tagline}
          </m.p>

          <h1 id="hero-title" className="display mt-7 text-[3.1rem] sm:text-7xl lg:text-[5.2rem] xl:text-[6rem]">
            <TextReveal
              lines={['Healthy Skin.', 'Expert Care.', 'Confidence That Shows.']}
              delay={0.1}
              className="[&>span:nth-child(2)]:text-clay [&>span:nth-child(2)]:italic"
            />
          </h1>

          <m.p
            className="mt-8 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.55 }}
          >
            {clinic.name} in Talwandi, {clinic.city} is the dermatology practice of {clinic.doctor.name}, offering
            thoughtful, personalised care for skin, hair and scalp concerns, alongside aesthetic dermatology.
          </m.p>

          <m.div
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.7 }}
          >
            <ButtonLink href="/book">Book an Appointment</ButtonLink>
            <ButtonLink href="/#treatments" variant="outline" icon={<ArrowDown aria-hidden className="size-4 transition-transform duration-300 group-hover/btn:translate-y-0.5" />}>
              Explore Treatments
            </ButtonLink>
          </m.div>
        </div>

        <m.div
          className="relative lg:col-span-6 xl:col-span-5 xl:col-start-8"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: EASE, delay: 0.2 }}
        >
          <m.div
            initial={{ clipPath: 'inset(8% 8% 8% 8%)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            transition={{ duration: 1.4, ease: EASE, delay: 0.2 }}
          >
            <MediaFrame slot="hero" priority sizes="(min-width: 1024px) 45vw, 100vw" className="aspect-[4/5] w-full sm:aspect-[5/5] lg:aspect-[4/5]" hoverZoom={false} />
          </m.div>

          <m.div
            className="relative z-10 -mt-20 ml-4 w-[calc(100%-2rem)] max-w-sm border border-line bg-ivory/95 p-6 shadow-[0_30px_60px_-30px_rgba(42,38,35,0.35)] backdrop-blur sm:ml-auto sm:mr-[-1rem] lg:absolute lg:bottom-10 lg:-left-16 lg:m-0"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.9 }}
          >
            <p className="eyebrow text-[0.6rem]">Your dermatologist</p>
            <p className="mt-3 font-serif text-2xl text-ink">{clinic.doctor.name}</p>
            <p className="mt-1 text-sm text-muted">{md.degree}</p>
            <div className="mt-5 flex items-center justify-between gap-4 border-t border-line pt-4 text-sm">
              <span className="flex items-center gap-2 text-charcoal">
                <MapPin aria-hidden className="size-4 text-clay" /> Talwandi, {clinic.city}
              </span>
              <Link href={directionsHref} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold tracking-wider text-clay uppercase underline-offset-4 hover:underline">
                Directions
              </Link>
            </div>
          </m.div>
        </m.div>
      </div>
    </section>
  );
}
