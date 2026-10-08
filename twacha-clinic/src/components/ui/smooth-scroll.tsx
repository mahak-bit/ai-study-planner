'use client';

import { useEffect, type ReactNode } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap, ScrollTrigger } from '@/lib/gsap';

let instance: Lenis | null = null;

/** The active Lenis instance, or null when smooth scrolling is off (reduced motion). */
export function getLenis() {
  return instance;
}

/**
 * Lenis smooth scroll driven by GSAP's ticker, so ScrollTrigger scrub
 * timelines and the scroll position share one clock. Skipped entirely for
 * visitors who prefer reduced motion.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    instance = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Same-page hash links ("/#faq"): glide there, keep the URL hash in sync
    // and fire hashchange so sections can react (e.g. the Aesthetics tab).
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a[href*="#"]') as HTMLAnchorElement | null;
      if (!a || a.target === '_blank') return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      e.preventDefault();
      // Lenis already honours the CSS scroll-padding-top for element targets.
      // If a modal (the mobile menu) has paused scrolling, wait until it closes.
      let tries = 0;
      const go = () => {
        if (lenis.isStopped && tries++ < 30) requestAnimationFrame(go);
        else lenis.scrollTo(target);
      };
      go();
      if (location.hash !== url.hash) {
        history.pushState(null, '', url.hash);
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      }
    };
    document.addEventListener('click', onClick, true);

    return () => {
      document.removeEventListener('click', onClick, true);
      gsap.ticker.remove(raf);
      lenis.destroy();
      instance = null;
    };
  }, []);

  return <>{children}</>;
}
