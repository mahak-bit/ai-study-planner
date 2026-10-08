'use client';

import Image from 'next/image';
import { useState } from 'react';
import { beforeAfterCases, type BeforeAfterCase } from '@/content/before-after';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/ui/reveal';

function CompareSlider({ item }: { item: BeforeAfterCase }) {
  const [pos, setPos] = useState(50);
  return (
    <figure>
      <div className="relative aspect-[4/5] overflow-hidden bg-sand select-none focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-clay">
        <Image src={item.after.src} alt={item.after.alt} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <Image src={item.before.src} alt={item.before.alt} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-y-0 w-px bg-ivory" style={{ left: `${pos}%` }}>
          <span className="absolute top-1/2 left-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ivory text-xs text-charcoal shadow">
            ⇆
          </span>
        </div>
        <span className="absolute top-3 left-3 bg-ivory/90 px-2 py-1 text-[0.6rem] font-semibold tracking-widest uppercase">Before</span>
        <span className="absolute top-3 right-3 bg-ivory/90 px-2 py-1 text-[0.6rem] font-semibold tracking-widest uppercase">After</span>
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label={`Compare before and after: ${item.category}`}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      <figcaption className="mt-4">
        <p className="eyebrow text-[0.6rem]">{item.category}</p>
        {item.note ? <p className="mt-1 text-sm text-muted">{item.note}</p> : null}
      </figcaption>
    </figure>
  );
}

/** Hidden automatically until real, consented clinic images are added. */
export function BeforeAfter() {
  if (beforeAfterCases.length === 0) return null;
  return (
    <section aria-labelledby="results-title" className="py-24 lg:py-36">
      <div className="container-x">
        <SectionHeading id="results-title" eyebrow="Results" title="Before & after" intro="Shared with patient consent. Results vary from person to person and are not guaranteed." />
        <Reveal className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {beforeAfterCases.map((c) => (
            <CompareSlider key={c.before.src} item={c} />
          ))}
        </Reveal>
        <p className="mt-10 text-xs text-muted">Individual results vary. Images are of real patients and are shown with their permission.</p>
      </div>
    </section>
  );
}
