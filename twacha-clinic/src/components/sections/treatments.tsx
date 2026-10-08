'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { treatmentCategories } from '@/content/treatments';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/ui/reveal';
import { cn } from '@/lib/cn';
import { Tilt } from '@/components/ui/tilt';

export function Treatments() {
  const [active, setActive] = useState(treatmentCategories[0].id);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const category = treatmentCategories.find((c) => c.id === active) ?? treatmentCategories[0];

  // Deep links such as /#aesthetics open the matching tab.
  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash.slice(1);
      if (treatmentCategories.some((c) => c.id === hash)) setActive(hash);
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = treatmentCategories.length - 1;
    let next: number | null = null;
    if (e.key === 'ArrowRight') next = index === last ? 0 : index + 1;
    if (e.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = last;
    if (next === null) return;
    e.preventDefault();
    setActive(treatmentCategories[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <section id="treatments" aria-labelledby="treatments-title" className="relative bg-sand/50 py-24 lg:py-36">
      {/* Anchor targets for category deep links (e.g. the "Aesthetics" nav item). */}
      {treatmentCategories.map((c) => (
        <span key={c.id} id={c.id} aria-hidden className="absolute top-0" />
      ))}
      <div className="container-x">
        <SectionHeading
          id="treatments-title"
          eyebrow="Treatments"
          title={
            <>
              Care, tailored <em className="text-clay">to you</em>
            </>
          }
          intro="Treatment is always planned after a consultation. Explore the areas of care available at the clinic."
        />

        <Reveal className="mt-14 lg:mt-20">
          <div role="tablist" aria-label="Treatment categories" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:px-0">
            {treatmentCategories.map((c, i) => {
              const selected = c.id === active;
              return (
                <button
                  key={c.id}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  role="tab"
                  id={`tab-${c.id}`}
                  aria-selected={selected}
                  aria-controls={`panel-${c.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(c.id)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  className={cn(
                    'relative shrink-0 rounded-full border px-5 py-2.5 text-[0.8rem] font-medium tracking-wide transition-colors duration-300',
                    selected ? 'border-charcoal bg-charcoal text-ivory' : 'border-charcoal/15 text-charcoal hover:border-charcoal/50',
                  )}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </Reveal>

        <AnimatePresence mode="wait">
          <m.div
            key={category.id}
            role="tabpanel"
            id={`panel-${category.id}`}
            aria-labelledby={`tab-${category.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10"
          >
            <p className="max-w-2xl font-serif text-2xl leading-snug text-charcoal">{category.intro}</p>
            <ul className="mt-10 grid border-t border-l border-line md:grid-cols-2">
              {category.treatments.map((t, i) => (
                <m.li
                  key={t.name}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.06 * i, ease: [0.22, 1, 0.36, 1] }}
                  className="border-r border-b border-line hover:z-10"
                >
                  <Tilt max={4} className="group flex flex-col bg-ivory p-8 transition-[background-color,transform] duration-500 hover:bg-white lg:p-10">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-serif text-[1.75rem] leading-tight text-ink">{t.name}</h3>
                    <span className="font-serif text-sm text-taupe">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <p className="mt-4 leading-relaxed text-muted">{t.summary}</p>
                  <p className="mt-5 text-sm text-charcoal">
                    <span className="eyebrow mr-2 text-[0.6rem]">Concerns</span>
                    {t.concerns}
                  </p>
                  <Link
                    href={`/book?concern=${encodeURIComponent(t.name)}`}
                    className="mt-8 inline-flex items-center gap-2 self-start text-xs font-semibold tracking-[0.14em] text-charcoal uppercase transition-colors hover:text-clay"
                  >
                    Ask about this treatment
                    <ArrowUpRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                  </Tilt>
                </m.li>
              ))}
            </ul>
          </m.div>
        </AnimatePresence>

        <p className="mt-8 text-xs text-muted">Suitability for any treatment is decided after consultation. Individual results vary.</p>
      </div>
    </section>
  );
}
