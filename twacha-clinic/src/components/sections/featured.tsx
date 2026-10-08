'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { m } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { featuredTreatments } from '@/content/treatments';
import { MediaFrame } from '@/components/ui/media-frame';
import { SectionHeading } from '@/components/ui/section-heading';
import { cn } from '@/lib/cn';

export function Featured() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const total = featuredTreatments.length;

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const p = max > 0 ? el.scrollLeft / max : 0;
    setProgress(p);
    setIndex(Math.round(p * (total - 1)));
  }, [total]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  const go = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const target = Math.min(total - 1, Math.max(0, index + dir));
    const slide = el.children[target] as HTMLElement | undefined;
    if (slide) el.scrollTo({ left: slide.offsetLeft - el.offsetLeft, behavior: 'smooth' });
  };

  return (
    <section aria-labelledby="featured-title" className="overflow-hidden py-24 lg:py-36">
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
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={index === 0}
              aria-label="Previous treatment"
              className="grid size-12 place-items-center rounded-full border border-charcoal/20 text-charcoal transition-colors hover:bg-charcoal hover:text-ivory disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-charcoal"
            >
              <ArrowLeft aria-hidden className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={index === total - 1}
              aria-label="Next treatment"
              className="grid size-12 place-items-center rounded-full border border-charcoal/20 text-charcoal transition-colors hover:bg-charcoal hover:text-ivory disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-charcoal"
            >
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
        className="no-scrollbar mt-14 flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-5 overflow-x-auto scroll-smooth px-[var(--gutter)] [--gutter:1.25rem] md:gap-8 md:[--gutter:2.5rem] xl:[--gutter:max(3.5rem,calc((100vw-82rem)/2+3.5rem))]"
      >
        {featuredTreatments.map((t, i) => (
          <m.article
            key={t.name}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${total}: ${t.name}`}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.9, delay: Math.min(i, 2) * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="group grid w-[86vw] shrink-0 snap-start border border-line bg-cream md:w-[44rem] md:grid-cols-2 lg:w-[58rem]"
          >
            <MediaFrame slot={t.media} sizes="(min-width: 1024px) 29rem, (min-width: 768px) 22rem, 86vw" className="aspect-[4/3] md:aspect-auto md:min-h-[26rem] lg:min-h-[32rem]" />
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
          </m.article>
        ))}
        <div aria-hidden className="w-px shrink-0" />
      </div>

      <div className="container-x mt-10">
        <div className="h-px w-full bg-line">
          <div className={cn('h-px origin-left bg-charcoal transition-transform duration-300')} style={{ transform: `scaleX(${Math.max(0.08, progress)})` }} />
        </div>
      </div>
    </section>
  );
}
