import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { media, type MediaKey, type MediaSlot } from '@/content/media';
import { cn } from '@/lib/cn';

const tones: Record<MediaSlot['tone'], { bg: string; a: string; b: string }> = {
  sand: { bg: 'bg-[#e9dfd1]', a: 'bg-[#f6efe5]', b: 'bg-[#d5c2ab]' },
  clay: { bg: 'bg-[#dcc8b6]', a: 'bg-[#efe2d4]', b: 'bg-[#bf9a80]' },
  stone: { bg: 'bg-[#e2ddd5]', a: 'bg-[#f3f0ea]', b: 'bg-[#c4b9aa]' },
  ivory: { bg: 'bg-[#f1ebe2]', a: 'bg-[#fbf8f3]', b: 'bg-[#dfd2c1]' },
};

type Props = {
  slot: MediaKey;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Scale the image slightly when a parent with `group` is hovered. */
  hoverZoom?: boolean;
  showLabel?: boolean;
};

/**
 * Renders a real photograph when one is configured in content/media.ts,
 * otherwise an intentional, clearly labelled placeholder of the same size.
 */
export function MediaFrame({ slot, className, sizes = '100vw', priority, hoverZoom = true, showLabel = true }: Props) {
  const item: MediaSlot = media[slot];
  const zoom = hoverZoom && 'transition-transform duration-[1200ms] ease-[var(--ease-luxe)] group-hover:scale-[1.04]';

  if (item.src) {
    return (
      <div className={cn('relative overflow-hidden bg-sand', className)}>
        <Image src={item.src} alt={item.alt} fill sizes={sizes} priority={priority} className={cn('object-cover', zoom)} />
      </div>
    );
  }

  const t = tones[item.tone];
  return (
    <div role="img" aria-label={`${item.alt} (photo coming soon)`} className={cn('relative overflow-hidden', t.bg, className)}>
      <div aria-hidden className={cn('absolute inset-0', zoom)}>
        <div className={cn('absolute -top-1/4 -left-1/4 h-[85%] w-[85%] rounded-full blur-3xl', t.a)} />
        <div className={cn('absolute -right-1/4 -bottom-1/3 h-[80%] w-[80%] rounded-full opacity-70 blur-3xl', t.b)} />
        <div className="grain absolute inset-0 opacity-80" />
      </div>
      {showLabel ? (
        <div aria-hidden className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-4 text-[0.65rem] font-semibold tracking-[0.18em] text-charcoal/45 uppercase">
          <ImageIcon className="size-3.5" />
          <span className="truncate">{item.label}</span>
        </div>
      ) : null}
    </div>
  );
}
