'use client';

import { useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight, Star } from 'lucide-react';
import { reviewsHref } from '@/content/clinic';
import { reviews, type Review } from '@/content/reviews';
import { Placeholder } from '@/components/ui/placeholder';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/ui/reveal';
import { cn } from '@/lib/cn';

const PLACEHOLDER_SLOTS = 3;

export function Reviews() {
  const hasReviews = reviews.length > 0;
  const count = hasReviews ? reviews.length : PLACEHOLDER_SLOTS;
  const [index, setIndex] = useState(0);
  const review: Review | undefined = reviews[index];

  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + count) % count);

  return (
    <section aria-labelledby="reviews-title" className="bg-cream py-24 lg:py-36">
      <div className="container-x grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading
            id="reviews-title"
            eyebrow="Patient voices"
            title={
              <>
                In their <em className="text-clay">words</em>
              </>
            }
          />
          <Reveal delay={0.1} className="mt-8">
            <a
              href={reviewsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-charcoal uppercase hover:text-clay"
            >
              Read reviews on Google <ArrowUpRight aria-hidden className="size-4" />
            </a>
          </Reveal>
        </div>

        <Reveal className="lg:col-span-8" delay={0.1}>
          <div role="region" aria-roledescription="carousel" aria-label="Patient reviews" className="relative">
            <span aria-hidden className="absolute -top-10 -left-2 font-serif text-[9rem] leading-none text-clay/15 select-none">
              “
            </span>
            <div className="min-h-[18rem] sm:min-h-[16rem]" aria-live="polite">
              <AnimatePresence mode="wait">
                <m.figure
                  key={index}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${count}`}
                  className="relative"
                >
                  {review ? (
                    <>
                      {review.rating ? (
                        <div className="mb-6 flex gap-1" aria-label={`Rated ${review.rating} out of 5`}>
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star key={i} aria-hidden className={cn('size-4', i < review.rating! ? 'fill-clay text-clay' : 'text-beige')} />
                          ))}
                        </div>
                      ) : null}
                      <blockquote className="font-serif text-3xl leading-[1.25] text-ink sm:text-4xl lg:text-[2.75rem]">{review.quote}</blockquote>
                      <figcaption className="mt-8 text-sm text-muted">
                        <span className="font-semibold text-charcoal">{review.author}</span>
                        {review.context ? ` · ${review.context}` : null}
                      </figcaption>
                    </>
                  ) : (
                    <>
                      <blockquote className="font-serif text-3xl leading-[1.25] text-ink/40 sm:text-4xl">
                        <Placeholder className="font-serif text-[0.7em]">Add verified patient review</Placeholder>
                      </blockquote>
                      <figcaption className="mt-8 text-sm text-muted">
                        <Placeholder>Patient name or initials, with permission</Placeholder>
                      </figcaption>
                    </>
                  )}
                </m.figure>
              </AnimatePresence>
            </div>

            <div className="mt-10 flex items-center justify-between border-t border-line pt-6">
              <div className="flex gap-2">
                {Array.from({ length: count }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Show review ${i + 1}`}
                    aria-current={i === index}
                    className="group grid h-6 place-items-center"
                  >
                    <span className={cn('block h-px transition-all duration-500', i === index ? 'w-10 bg-charcoal' : 'w-5 bg-charcoal/25 group-hover:bg-charcoal/60')} />
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => go(-1)} aria-label="Previous review" className="grid size-11 place-items-center rounded-full border border-charcoal/20 transition-colors hover:bg-charcoal hover:text-ivory">
                  <ArrowLeft aria-hidden className="size-4" />
                </button>
                <button type="button" onClick={() => go(1)} aria-label="Next review" className="grid size-11 place-items-center rounded-full border border-charcoal/20 transition-colors hover:bg-charcoal hover:text-ivory">
                  <ArrowRight aria-hidden className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
