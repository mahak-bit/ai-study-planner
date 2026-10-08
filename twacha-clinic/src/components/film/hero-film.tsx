'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { ArrowDown, MapPin } from 'lucide-react';
import { clinic, directionsHref } from '@/content/clinic';
import { ButtonLink } from '@/components/ui/button';
import { gsap, MOTION_OK, MOTION_REDUCED, useGSAP } from '@/lib/gsap';
import { cn } from '@/lib/cn';
import { useSkinRenderer } from './use-skin-renderer';

const HEADLINE = ['Healthy Skin.', 'Expert Care.', 'Confidence That Shows.'];

/** Splits a line into word-wrapped character spans for staggered animation. */
function SplitLine({ text, line, className }: { text: string; line: number; className?: string }) {
  const words = text.split(' ');
  return (
    <span data-line={line} aria-hidden className={cn('block pb-[0.06em]', className)}>
      {words.map((word, wi) => (
        <span key={wi}>
          <span className="inline-block whitespace-nowrap">
            {[...word].map((ch, ci) => (
              <span key={ci} data-char className="inline-block origin-bottom will-change-[transform,opacity]">
                {ch}
              </span>
            ))}
          </span>
          {wi < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </span>
  );
}

/**
 * Pinned, scroll-scrubbed opening "film": a real-time WebGL scene of a serum
 * droplet falling onto a satin, skin-like surface. Lines two and three of the
 * headline fill in as the droplet lands and its ripples spread.
 */
export function HeroFilm() {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const progress = useRef(0);
  const reduced = useReducedMotion();
  const { supported, renderOnce } = useSkinRenderer(canvas, progress, !reduced);
  const md = clinic.doctor.qualifications.value[0];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        gsap.from('[data-line="1"] [data-char]', {
          yPercent: 110,
          rotateX: -75,
          opacity: 0,
          duration: 1.3,
          ease: 'expo.out',
          stagger: 0.03,
          delay: 0.15,
        });
        gsap.from('[data-intro]', { y: 24, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1, delay: 0.45 });
        if (canvas.current) gsap.from(canvas.current, { opacity: 0, scale: 1.06, duration: 2, ease: 'power2.out' });

        const ghost = { opacity: 0.12 };
        gsap.set('[data-line="2"] [data-char], [data-line="3"] [data-char]', ghost);

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 0.8 },
        });
        tl.to(progress, { current: 1, duration: 1 }, 0)
          .to('[data-cue]', { opacity: 0, y: 16, duration: 0.08 }, 0)
          .to('[data-line="2"] [data-char]', { opacity: 1, stagger: 0.008, duration: 0.06, ease: 'power2.out' }, 0.28)
          .to('[data-line="3"] [data-char]', { opacity: 1, stagger: 0.008, duration: 0.06, ease: 'power2.out' }, 0.54)
          .fromTo('[data-card]', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.12, ease: 'power3.out' }, 0.78)
          .to('[data-copy]', { y: -40, duration: 0.2 }, 0.8);
      });

      mm.add(MOTION_REDUCED, () => {
        progress.current = 0.62;
        renderOnce();
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [renderOnce] },
  );

  return (
    <section ref={root} aria-labelledby="hero-title" className="relative h-svh motion-safe:h-[230vh] lg:motion-safe:h-[260vh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* CSS stand-in, also shown if WebGL is unavailable */}
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(120%_80%_at_70%_40%,#f7f1e8_0%,#ecdfcf_45%,#dcc8b2_100%)]" />
        {supported ? <canvas ref={canvas} aria-hidden className="absolute inset-0 h-full w-full" /> : null}

        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-ivory via-ivory/75 to-transparent lg:hidden" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 hidden w-[62%] bg-gradient-to-r from-ivory/90 via-ivory/55 to-transparent lg:block" />

        <div data-copy className="container-x relative flex h-full flex-col justify-end pt-28 pb-24 lg:justify-center lg:pb-0">
          <p data-intro className="eyebrow flex items-center gap-3">
            <span aria-hidden className="h-px w-8 bg-clay" />
            {clinic.tagline}
          </p>

          <h1 id="hero-title" className="display mt-5 text-[2.6rem] [perspective:900px] sm:text-7xl lg:text-[5.4rem] xl:text-[6.2rem]">
            <span className="sr-only">{HEADLINE.join(' ')}</span>
            <SplitLine line={1} text={HEADLINE[0]} />
            <SplitLine line={2} text={HEADLINE[1]} className="text-clay italic" />
            <SplitLine line={3} text={HEADLINE[2]} />
          </h1>

          <p data-intro className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-muted sm:mt-7 sm:text-lg">
            {clinic.name} in Talwandi, {clinic.city} is the dermatology practice of {clinic.doctor.name} — thoughtful, personalised care for
            skin, hair and scalp, alongside aesthetic dermatology.
          </p>

          <div data-intro className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:items-center sm:gap-4">
            <ButtonLink href="/book">Book an Appointment</ButtonLink>
            <ButtonLink
              href="/#treatments"
              variant="outline"
              className="bg-ivory/40 backdrop-blur-sm"
              icon={<ArrowDown aria-hidden className="size-4 transition-transform duration-300 group-hover/btn:translate-y-0.5" />}
            >
              Explore Treatments
            </ButtonLink>
          </div>
        </div>

        <div data-cue aria-hidden className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 lg:flex">
          <span className="text-[0.6rem] font-semibold tracking-[0.3em] text-charcoal/60 uppercase">Scroll</span>
          <span className="relative h-12 w-px overflow-hidden bg-charcoal/15">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[cue_1.8s_var(--ease-luxe)_infinite] bg-charcoal/60" />
          </span>
        </div>

        <div
          data-card
          className="absolute right-10 bottom-10 hidden w-80 border border-line bg-ivory/90 p-6 opacity-0 shadow-[0_30px_60px_-30px_rgba(42,38,35,0.35)] backdrop-blur motion-reduce:opacity-100 lg:block xl:right-14"
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
        </div>
      </div>
    </section>
  );
}
