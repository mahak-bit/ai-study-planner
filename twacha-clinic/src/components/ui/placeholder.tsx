import { cn } from '@/lib/cn';

/**
 * Visibly marks content that still needs verified information from the
 * clinic. Search the codebase for `<Placeholder` to find every gap.
 */
export function Placeholder({ children, className }: { children: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-block border border-dashed border-clay/40 bg-clay/[0.06] px-1.5 py-0.5 font-sans text-[0.85em] text-clay not-italic',
        className,
      )}
      data-placeholder
    >
      [{children}]
    </span>
  );
}
