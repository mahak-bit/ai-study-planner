'use client';

import Link from 'next/link';
import { useRef, type CSSProperties } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { gsap, MOTION_OK, useGSAP } from '@/lib/gsap';

/**
 * General dermatology education. Each layer lists concerns commonly associated
 * with that depth; it is not a diagnosis.
 */
const layers = [
  {
    name: 'The skin barrier',
    tag: 'Stratum corneum',
    body: 'The outermost layer of flattened cells that locks in moisture and keeps irritants out. When it is weakened, skin can feel dry, tight or reactive.',
    concerns: ['Sensitive skin', 'Eczema', 'Skin allergies'],
    faces: ['#f7f0e7', '#eadfce', '#dfd0bd'],
    pattern:
      'repeating-linear-gradient(0deg, rgba(139,94,72,0.10) 0 1px, transparent 1px 22px), repeating-linear-gradient(90deg, rgba(139,94,72,0.08) 0 1px, transparent 1px 34px)',
  },
  {
    name: 'Epidermis',
    tag: 'Living outer layer',
    body: 'Where new skin cells form and pigment-producing cells (melanocytes) live. Many concerns of colour and surface texture begin here.',
    concerns: ['Pigmentation', 'Melasma', 'Vitiligo', 'Psoriasis'],
    faces: ['#f0dccb', '#e3c6ae', '#d7b89f'],
    pattern:
      'radial-gradient(circle at 30% 30%, rgba(139,94,72,0.35) 0 2px, transparent 3px), radial-gradient(circle, rgba(255,255,255,0.55) 0 5px, transparent 6px)',
  },
  {
    name: 'Dermis',
    tag: 'Structure & support',
    body: 'A deeper layer of collagen and elastic fibres, blood vessels, oil glands and hair follicles — the structure behind firmness, scarring and hair growth.',
    concerns: ['Acne & scars', 'Hair fall', 'Rosacea', 'Fine lines'],
    faces: ['#e8c4b0', '#d8ac96', '#cb9e88'],
    pattern:
      'repeating-linear-gradient(35deg, rgba(255,255,255,0.35) 0 2px, transparent 2px 12px), repeating-linear-gradient(-25deg, rgba(139,94,72,0.12) 0 1px, transparent 1px 16px)',
  },
  {
    name: 'Subcutis',
    tag: 'Deep cushioning',
    body: 'Soft fatty tissue that cushions and insulates. Hair roots reach down towards it, and changes here affect volume as skin ages.',
    concerns: ['Hair & scalp health', 'Age-related changes'],
    faces: ['#eedab0', '#dfc596', '#d2b788'],
    pattern: 'radial-gradient(circle, rgba(255,255,255,0.5) 0 13px, rgba(201,154,90,0.25) 14px 15px, transparent 16px)',
  },
];

const PATTERN_SIZE = ['auto', '18px 18px, 14px 14px', 'auto', '34px 34px'];

function Slab({ i }: { i: number }) {
  const l = layers[i];
  const face: CSSProperties = { backgroundColor: l.faces[0], backgroundImage: l.pattern, backgroundSize: PATTERN_SIZE[i] };
  return (
    <div
      data-layer={i}
      className="absolute inset-0 [transform-style:preserve-3d]"
      style={{ transform: `translateZ(calc((var(--t) + 40px) * ${(layers.length - 1) / 2 - i}))` }}
    >
      {/* top face */}
      <div
        className="absolute inset-0 border border-white/50 shadow-[0_0_0_1px_rgba(139,94,72,0.08)] [transform:translateZ(var(--t))]"
        style={face}
      >
        <span className="absolute top-3 left-4 font-serif text-[0.95rem] text-charcoal/70 italic">
          0{i + 1} · {l.name}
        </span>
      </div>
      {/* front edge */}
      <div
        className="absolute inset-x-0 bottom-0 h-[var(--t)] origin-bottom [transform:rotateX(-90deg)]"
        style={{ backgroundColor: l.faces[1] }}
      />
      {/* right edge */}
      <div
        className="absolute inset-y-0 right-0 w-[var(--t)] origin-right [transform:rotateY(90deg)]"
        style={{ backgroundColor: l.faces[2] }}
      />
    </div>
  );
}

export function SkinLayers() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION_OK, lg: '(min-width: 1024px)' }, (ctx) => {
        if (!ctx.conditions?.motion) return;
        const el = root.current!;
        el.dataset.anim = 'on';
        const slabs = gsap.utils.toArray<HTMLElement>('[data-layer]', el);
        const copies = gsap.utils.toArray<HTMLElement>('[data-copy-layer]', el);
        const ticks = gsap.utils.toArray<HTMLElement>('[data-tick]', el);
        const gap = ctx.conditions.lg ? 64 : 40;
        const t = ctx.conditions.lg ? 22 : 16;
        // centre the stack on the stage so it opens symmetrically
        const zOf = (i: number, g: number) => ((layers.length - 1) / 2 - i) * (t + g);

        slabs.forEach((s, i) => gsap.set(s, { z: zOf(i, 2) }));
        gsap.set(copies, { autoAlpha: 0, y: 24 });
        gsap.set('[data-stage]', { rotateX: 62, rotateZ: -42, scale: 0.92 });

        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.7 },
        });

        // 1. the stack opens up and turns
        tl.to('[data-stage]', { rotateX: 58, rotateZ: -30, scale: 1, duration: 1 }, 0);
        slabs.forEach((s, i) => tl.to(s, { z: zOf(i, gap), duration: 1 }, 0));
        tl.to('[data-intro-copy]', { autoAlpha: 0, y: -20, duration: 0.4 }, 0.6);

        // 2. step through each layer
        layers.forEach((_, active) => {
          const at = 1 + active * 1.2;
          slabs.forEach((s, i) => {
            tl.to(s, { z: zOf(i, gap) + (i === active ? 30 : 0), duration: 0.5 }, at);
            // dim faces, not the slab: opacity on a preserve-3d parent flattens it
            tl.to(s.children, { opacity: i === active ? 1 : 0.3, duration: 0.5 }, at);
          });
          if (active > 0) tl.to(copies[active - 1], { autoAlpha: 0, y: -24, duration: 0.35 }, at);
          tl.to(copies[active], { autoAlpha: 1, y: 0, duration: 0.45 }, at + 0.15);
          tl.to(ticks[active], { scaleX: 1, duration: 0.4 }, at);
        });

        // 3. settle back together
        tl.to(slabs.flatMap((s) => [...s.children]), { opacity: 1, duration: 0.5 }, 1 + layers.length * 1.2);
        tl.to('[data-stage]', { rotateZ: -24, duration: 1 }, 1 + layers.length * 1.2);

        return () => {
          delete el.dataset.anim;
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-labelledby="layers-title"
      className="relative bg-ink text-ivory motion-safe:h-[480vh] [&[data-anim=on]_[data-overlay]]:absolute [&[data-anim=on]_[data-overlay]]:inset-x-0 [&[data-anim=on]_[data-overlay]]:top-0 [&[data-anim=on]_[data-overlay]]:!mt-0"
    >
      <div className="relative overflow-hidden py-24 motion-safe:sticky motion-safe:top-0 motion-safe:flex motion-safe:h-svh motion-safe:items-center motion-safe:py-0">
        <div aria-hidden className="grain pointer-events-none absolute inset-0 opacity-40" />
        <div aria-hidden className="pointer-events-none absolute top-1/2 left-[30%] h-[36rem] w-[36rem] -translate-1/2 rounded-full bg-clay/25 blur-[120px]" />

        <div className="container-x relative grid w-full items-center gap-6 lg:grid-cols-12 lg:gap-10">
          {/* 3D stage */}
          <div className="flex h-[17rem] items-center justify-center [perspective:1400px] sm:h-[24rem] lg:col-span-7 lg:h-[34rem]">
            <div
              data-stage
              className="relative size-[13rem] [--t:16px] [transform-style:preserve-3d] [transform:rotateX(58deg)_rotateZ(-30deg)] sm:size-[16rem] lg:size-[22rem] lg:[--t:22px]"
            >
              {layers.map((_, i) => (
                <Slab key={i} i={i} />
              ))}
            </div>
          </div>

          {/* copy */}
          <div className="lg:col-span-5">
            <div data-copy-wrap className="relative min-h-[18rem] space-y-12 sm:min-h-[16rem] lg:min-h-[22rem]">
            <div data-intro-copy data-overlay>
              <p className="eyebrow text-clay-soft">Skin, layer by layer</p>
              <h2 id="layers-title" className="display mt-5 text-[2.4rem] text-ivory sm:text-5xl lg:text-[3.6rem]">
                Every concern has <em className="text-clay-soft">a depth.</em>
              </h2>
              <p className="mt-5 max-w-md leading-relaxed text-ivory/65">
                Understanding where a concern begins is the first step to treating it well. Scroll to explore.
              </p>
            </div>

              {layers.map((l, i) => (
                <article key={l.name} data-copy-layer data-overlay>
                  <p className="text-[0.65rem] font-semibold tracking-[0.25em] text-clay-soft uppercase">
                    0{i + 1} — {l.tag}
                  </p>
                  <h3 className="mt-3 font-serif text-[2rem] text-ivory sm:text-4xl lg:text-5xl">{l.name}</h3>
                  <p className="mt-3 max-w-md text-[0.92rem] leading-relaxed text-ivory/70 sm:mt-4 sm:text-base">{l.body}</p>
                  <ul className="mt-5 flex flex-wrap gap-2 sm:mt-6" aria-label={`Concerns related to the ${l.name.toLowerCase()}`}>
                    {l.concerns.map((c) => (
                      <li key={c} className="rounded-full border border-ivory/20 px-3.5 py-1.5 text-xs text-ivory/85">
                        {c}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/#conditions"
                    className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.14em] text-clay-soft uppercase hover:text-ivory sm:mt-6"
                  >
                    See conditions we treat <ArrowUpRight aria-hidden className="size-3.5" />
                  </Link>
                </article>
              ))}
            </div>

            <div aria-hidden className="mt-8 hidden gap-2 lg:motion-safe:flex">
              {layers.map((l) => (
                <span key={l.name} className="relative h-px w-12 bg-ivory/20">
                  <span data-tick className="absolute inset-0 origin-left scale-x-0 bg-clay-soft" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
