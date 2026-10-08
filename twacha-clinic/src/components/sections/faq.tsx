'use client';

import { useId, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { Plus } from 'lucide-react';
import { faqs } from '@/content/faqs';
import { clinic, telHref } from '@/content/clinic';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/ui/reveal';
import { cn } from '@/lib/cn';

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  const id = useId();
  return (
    <li className="border-b border-line">
      <h3>
        <button
          type="button"
          id={`${id}-btn`}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={onToggle}
          className="group flex w-full items-center justify-between gap-6 py-6 text-left lg:py-7"
        >
          <span className={cn('font-serif text-[1.45rem] leading-snug transition-colors sm:text-[1.65rem]', open ? 'text-clay' : 'text-ink group-hover:text-clay')}>{q}</span>
          <span className={cn('grid size-9 shrink-0 place-items-center rounded-full border transition-all duration-500', open ? 'rotate-45 border-clay bg-clay text-ivory' : 'border-charcoal/20 text-charcoal')}>
            <Plus aria-hidden className="size-4" />
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open ? (
          <m.div
            id={`${id}-panel`}
            role="region"
            aria-labelledby={`${id}-btn`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="max-w-2xl pb-7 leading-relaxed text-muted">{a}</p>
          </m.div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" aria-labelledby="faq-title" className="py-24 lg:py-36">
      <div className="container-x grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <SectionHeading
              id="faq-title"
              eyebrow="FAQs"
              title={
                <>
                  Questions, <em className="text-clay">answered</em>
                </>
              }
            />
            <Reveal delay={0.1}>
              <p className="mt-6 text-muted">
                Can&apos;t find what you&apos;re looking for? Call us on{' '}
                <a href={telHref(clinic.phone.value)} className="font-medium text-charcoal underline decoration-clay/40 underline-offset-4 hover:text-clay">
                  {clinic.phone.value}
                </a>
                .
              </p>
            </Reveal>
          </div>
        </div>
        <Reveal className="lg:col-span-7 lg:col-start-6">
          <ul className="border-t border-line">
            {faqs.map((f, i) => (
              <FaqItem key={f.q} q={f.q} a={f.a} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
