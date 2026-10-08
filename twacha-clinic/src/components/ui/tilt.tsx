'use client';

import { useRef, type PointerEvent, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Subtle 3D tilt that follows a mouse pointer. Touch and reduced-motion users
 * get a static card. Owns the transform of its own element only.
 */
export function Tilt({ children, className, max = 6 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) translateZ(0)`;
    el.style.setProperty('--glare-x', `${(x + 0.5) * 100}%`);
    el.style.setProperty('--glare-y', `${(y + 0.5) * 100}%`);
  };

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = '';
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn(
        'relative h-full transition-transform duration-500 ease-[var(--ease-luxe)] [transform-style:preserve-3d] will-change-transform',
        // soft glare that follows the pointer
        "after:pointer-events-none after:absolute after:inset-0 after:opacity-0 after:transition-opacity after:duration-500 after:content-[''] after:[background:radial-gradient(circle_at_var(--glare-x,50%)_var(--glare-y,50%),rgba(255,255,255,0.45),transparent_55%)] hover:after:opacity-100",
        className,
      )}
    >
      {children}
    </div>
  );
}
