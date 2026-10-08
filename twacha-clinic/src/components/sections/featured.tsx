'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { featuredTreatments } from '@/content/treatments';
import { MediaFrame } from '@/components/ui/media-frame';
import { SectionHeading } from '@/components/ui/section-heading';
import { getLenis } from '@/components/ui/smooth-scroll';
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from '@/lib/gsap';

const total = featuredTreatments.length;

/**
 * Featured treatments. On large screens (with motion allowed) the section pins
 * and vertical scroll drives the track sideways, with each slide swinging in
 * slightly in 3D. Elsewhere it is a native, swipeable snap carousel.
 */
export function Featured() {
  const root = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<ScrollTrigger | null>(null);
  const [index, setIndex] = useState(0);

  const report = useCallback((p: number) => {
    if (barRef.current) barRef.current.style.transform = `scaleX(${Math.max(0.08, p)})`;
    setIndex(Math.round(p * (total - 1)));
  }, []);

  // native carousel progress
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      if (pinRef.current) return;
      const max = el.scrollWidth - el.clientWidth;
      report(max > 0 ? el.scrollLeft / max : 0);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [report]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${MOTION_OK} and (min-width: 1024px)`, () => {
        const section = root.current!;
        const track = trackRef.current!;
        section.dataset.pinned = 'on';
        const distance = () => track.scrollWidth - window.innerWidth;

        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => report(self.progress),
          },
        });
        pinRef.current = tween.scrollTrigger ?? null;

        gsap.utils.toArray<HTMLElement>('[data-slide]', track).forEach((slide) => {
          gsap.fromTo(
            slide,
            { rotateY: -14, opacity: 0.55, transformOrigin: 'left center' },
            { rotateY: 0, opacity: 1, ease: 'none', scrollTrigger: { containerAnimation: tween, trigger: slide, start: 'left right', end: 'left 35%', scrub: true } },
          );
          const img = slide.querySelector('[data-parallax]');
          if (img) {
            gsap.fromTo(
              img,
              { xPercent: -6 },
              { xPercent: 6, ease: 'none', scrollTrigger: { containerAnimation: tween, trigger: slide, start: 'left right', end: 'right left', scrub: true } },
            );
          }
        });

        return () => {
          delete section.dataset.pinned;
          pinRef.current = null;
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const go = (dir: 1 | -1) => {
    const target = Math.min(total - 1, Math.max(0, index + dir));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const st = pinRef.current;
    if (st) {
      const y = st.start + ((st.end - st.start) * target) / (total - 1);
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(y);
      else window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
      return;
    }
    const el = trackRef.current;
    const slide = el?.children[target] as HTMLElement | undefined;
    if (el && slide) el.scrollTo({ left: slide.offsetLeft - el.offsetLeft, behavior: reduced ? 'auto' : 'smooth' });
  };

  const navButton =
    'grid size-12 place-items-center rounded-full border border-charcoal/20 text-charcoal transition-colors hover:bg-charcoal hover:text-ivory disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-charcoal';

  return (
    <section
      ref={root}
      aria-labelledby="featured-title"
      className="overflow-hidden py-24 lg:py-28 [&[data-pinned=on]]:flex [&[data-pinned=on]]:h-svh [&[data-pinned=on]]:flex-col [&[data-pinned=on]]:justify-center"
    >
      <div className="container-x flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          id="featured-title"
          eyebrow="Featured care"
          title={
            <>
              Areas of <em className="text-clay">focus</em>
            </>
          }
        />
        <div className="flex items-center gap-6">
          <p className="font-serif text-lg text-charcoal tabular-nums" aria-live="polite">
            {String(index + 1).padStart(2, '0')} <span className="text-taupe">/ {String(total).padStart(2, '0')}</span>
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => go(-1)} disabled={index === 0} aria-label="Previous treatment" className={navButton}>
              <ArrowLeft aria-hidden className="size-4" />
            </button>
            <button type="button" onClick={() => go(1)} disabled={index === total - 1} aria-label="Next treatment" className={navButton}>
              <ArrowRight aria-hidden className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={trackRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured treatments"
        tabIndex={0}
        className="no-scrollbar mt-12 flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-5 overflow-x-auto px-[var(--gutter)] [--gutter:1.25rem] [perspective:1800px] md:gap-8 md:[--gutter:2.5rem] lg:mt-14 xl:[--gutter:max(3.5rem,calc((100vw-82rem)/2+3.5rem))] [[data-pinned=on]_&]:snap-none [[data-pinned=on]_&]:overflow-visible"
      >
        {featuredTreatments.map((t, i) => (
          <article
            key={t.name}
            data-slide
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${total}: ${t.name}`}
            className="group grid w-[86vw] shrink-0 snap-start border border-line bg-cream will-change-transform md:w-[44rem] md:grid-cols-2 lg:w-[56rem]"
          >
            <div className="relative overflow-hidden">
              <div data-parallax className="h-full w-full scale-[1.14]">
                <MediaFrame slot={t.media} sizes="(min-width: 1024px) 28rem, (min-width: 768px) 22rem, 86vw" className="aspect-[4/3] h-full md:aspect-auto md:min-h-[26rem] lg:min-h-[30rem]" />
              </div>
            </div>
            <div className="flex flex-col p-7 sm:p-10">
              <span className="font-serif text-sm text-taupe">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-4 font-serif text-[2rem] leading-[1.05] text-ink lg:text-[2.6rem]">{t.name}</h3>
              <dl className="mt-8 space-y-6 text-[0.95rem] leading-relaxed">
                <div>
                  <dt className="eyebrow text-[0.6rem]">What it helps with</dt>
                  <dd className="mt-2 text-muted">{t.helps}</dd>
                </div>
                <div>
                  <dt className="eyebrow text-[0.6rem]">Who it may suit</dt>
                  <dd className="mt-2 text-muted">{t.suitable}</dd>
                </div>
              </dl>
              <Link
                href={`/book?concern=${encodeURIComponent(t.name)}`}
                className="mt-auto inline-flex items-center gap-2 self-start pt-10 text-xs font-semibold tracking-[0.14em] text-charcoal uppercase transition-colors hover:text-clay"
              >
                Book a consultation
                <ArrowUpRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </article>
        ))}
        <div aria-hidden className="w-px shrink-0" />
      </div>

      <div className="container-x mt-10">
        <div className="h-px w-full bg-line">
          <div ref={barRef} className="h-px origin-left bg-charcoal transition-transform duration-300" style={{ transform: 'scaleX(0.08)' }} />
        </div>
      </div>
    </section>
  );
}
