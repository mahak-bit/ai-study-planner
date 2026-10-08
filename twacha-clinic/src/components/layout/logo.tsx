import Link from 'next/link';
import { clinic } from '@/content/clinic';
import { cn } from '@/lib/cn';

export function Logo({ compact = false, tone = 'dark' }: { compact?: boolean; tone?: 'dark' | 'light' }) {
  return (
    <Link href="/" aria-label={`${clinic.name} — home`} className="group flex flex-col leading-none">
      <span
        className={cn(
          'font-serif whitespace-nowrap tracking-[0.24em] sm:tracking-[0.28em] transition-[font-size] duration-500 ease-[var(--ease-luxe)]',
          compact ? 'text-base sm:text-lg' : 'text-[1.1rem] sm:text-[1.4rem]',
          tone === 'dark' ? 'text-ink' : 'text-ivory',
        )}
      >
        {clinic.wordmark}
      </span>
      <span
        className={cn(
          'mt-1.5 whitespace-nowrap text-[0.55rem] font-semibold tracking-[0.28em] uppercase sm:text-[0.6rem] sm:tracking-[0.3em]',
          tone === 'dark' ? 'text-clay' : 'text-clay-soft',
        )}
      >
        {clinic.doctor.name}
      </span>
    </Link>
  );
}
