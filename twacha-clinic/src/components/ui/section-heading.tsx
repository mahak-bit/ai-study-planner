import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Reveal } from './reveal';

type Props = {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: 'left' | 'center';
  id?: string;
  className?: string;
  tone?: 'light' | 'dark';
};

export function SectionHeading({ eyebrow, title, intro, align = 'left', id, className, tone = 'light' }: Props) {
  return (
    <Reveal className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center', className)}>
      <p className={cn('eyebrow', tone === 'dark' && 'text-clay-soft')}>{eyebrow}</p>
      <h2 id={id} className={cn('display mt-5 text-[2.6rem] sm:text-5xl lg:text-[4rem]', tone === 'dark' && 'text-ivory')}>
        {title}
      </h2>
      {intro ? (
        <p className={cn('mt-6 text-base leading-relaxed sm:text-lg', tone === 'dark' ? 'text-ivory/70' : 'text-muted', align === 'center' && 'mx-auto max-w-2xl')}>
          {intro}
        </p>
      ) : null}
    </Reveal>
  );
}
