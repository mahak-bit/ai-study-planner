import type { ReactNode } from 'react';

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="container-x pt-32 pb-24 lg:pt-44 lg:pb-36">
      <div className="mx-auto max-w-2xl">
        <p className="eyebrow">Legal</p>
        <h1 className="display mt-6 text-5xl sm:text-6xl">{title}</h1>
        <div className="mt-12 space-y-6 leading-relaxed text-muted [&_h2]:mt-12 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:text-ink">{children}</div>
      </div>
    </article>
  );
}
