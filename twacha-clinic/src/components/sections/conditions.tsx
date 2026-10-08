'use client';

import Link from 'next/link';
import { useId, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { ArrowUpRight, Plus } from 'lucide-react';
import { hairConditions, skinConditions, type Condition } from '@/content/conditions';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/reveal';
import { cn } from '@/lib/cn';

function ConditionCard({ condition }: { condition: Condition }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const Icon = condition.icon;

  return (
    <StaggerItem
      as="article"
      className="group relative flex h-full flex-col border-r border-b border-line bg-ivory p-7 transition-[background-color,box-shadow] duration-500 ease-[var(--ease-luxe)] hover:z-10 hover:bg-white hover:shadow-[0_24px_50px_-28px_rgba(42,38,35,0.3)]"
    >
      <div className="flex items-start justify-between">
        <span className="grid size-12 place-items-center rounded-full bg-sand/70 text-clay transition-colors duration-500 group-hover:bg-clay group-hover:text-ivory">
          <Icon aria-hidden className="size-5" strokeWidth={1.4} />
        </span>
      </div>
      <h4 className="mt-7 font-serif text-[1.6rem] leading-tight text-ink">{condition.name}</h4>
      <p className="mt-3 text-[0.92rem] leading-relaxed text-muted">{condition.summary}</p>

      <AnimatePresence initial={false}>
        {open ? (
          <m.div
            id={panelId}
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="mt-4 border-l border-clay/40 pl-4 text-[0.9rem] leading-relaxed text-charcoal/80">{condition.detail}</p>
            <Link
              href={`/book?concern=${condition.slug}`}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.12em] text-clay uppercase hover:underline"
            >
              Ask about this concern <ArrowUpRight aria-hidden className="size-3.5" />
            </Link>
          </m.div>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="mt-auto flex items-center gap-2 pt-6 text-xs font-semibold tracking-[0.14em] text-charcoal uppercase transition-colors hover:text-clay"
      >
        {open ? 'Show less' : 'Learn more'}
        <Plus aria-hidden className={cn('size-3.5 transition-transform duration-300', open && 'rotate-45')} />
        <span className="sr-only"> about {condition.name}</span>
      </button>
    </StaggerItem>
  );
}

function ConditionGroup({ id, title, intro, items }: { id: string; title: string; intro: string; items: Condition[] }) {
  return (
    <div id={id} className="scroll-mt-28">
      <Reveal className="flex flex-col gap-3 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <h3 className="font-serif text-3xl text-ink sm:text-4xl">{title}</h3>
        <p className="max-w-md text-sm text-muted">{intro}</p>
      </Reveal>
      <Stagger className="grid border-l border-line sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((c) => (
          <ConditionCard key={c.slug} condition={c} />
        ))}
      </Stagger>
    </div>
  );
}

export function Conditions() {
  return (
    <section id="conditions" aria-labelledby="conditions-title" className="py-24 lg:py-36">
      <div className="container-x">
        <SectionHeading
          id="conditions-title"
          eyebrow="Conditions we treat"
          title={
            <>
              Understanding your <em className="text-clay">skin & hair</em> concerns
            </>
          }
          intro="From everyday breakouts to long-term conditions, every concern is assessed individually. Select a concern to learn how care begins."
        />
        <div className="mt-16 space-y-20 lg:mt-24 lg:space-y-28">
          <ConditionGroup id="skin" title="Skin Concerns" intro="Medical and cosmetic skin conditions affecting the face and body." items={skinConditions} />
          <ConditionGroup id="hair" title="Hair & Scalp" intro="Evaluation and care for hair fall, thinning and scalp health." items={hairConditions} />
        </div>
      </div>
    </section>
  );
}
