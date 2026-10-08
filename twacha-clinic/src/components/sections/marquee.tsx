import { hairConditions, skinConditions } from '@/content/conditions';

const words = [...skinConditions, ...hairConditions].map((c) => c.name);

/** Editorial ticker of concerns. Pauses on hover; stops for reduced motion. */
export function Marquee() {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {words.map((w, i) => (
        <li key={w} className="flex items-center font-serif text-4xl whitespace-nowrap text-ink sm:text-6xl lg:text-7xl">
          <span className={i % 2 ? 'text-clay italic' : ''}>{w}</span>
          <span aria-hidden className="mx-6 inline-block size-2 rounded-full bg-clay-soft sm:mx-10" />
        </li>
      ))}
    </ul>
  );

  return (
    <section aria-label="Concerns we treat" className="overflow-hidden border-y border-line bg-cream py-10 sm:py-14">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
}
