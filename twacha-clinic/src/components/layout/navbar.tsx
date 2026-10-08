'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, m, useMotionValueEvent, useScroll } from 'framer-motion';
import { Menu, Phone, X } from 'lucide-react';
import { clinic, telHref, whatsappHref } from '@/content/clinic';
import { navLinks } from '@/content/navigation';
import { buttonClasses } from '@/components/ui/button';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';
import { cn } from '@/lib/cn';
import { getLenis } from '@/components/ui/smooth-scroll';
import { Logo } from './logo';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 24));

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    getLenis()?.stop();
    panelRef.current?.querySelector<HTMLElement>('a, button')?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>('a, button');
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      getLenis()?.start();
      window.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[60] bg-charcoal px-4 py-2 text-ivory focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow] duration-500 ease-[var(--ease-luxe)]',
          scrolled ? 'border-b border-line/80 bg-ivory/90 backdrop-blur-md' : 'border-b border-transparent bg-transparent',
        )}
      >
        <nav
          aria-label="Primary"
          className={cn(
            'container-x flex items-center justify-between gap-6 transition-[height] duration-500 ease-[var(--ease-luxe)]',
            scrolled ? 'h-16' : 'h-20 lg:h-24',
          )}
        >
          <Logo compact={scrolled} />

          <ul className="hidden items-center gap-7 xl:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="relative py-2 text-[0.8rem] font-medium tracking-wide text-charcoal/80 transition-colors hover:text-ink after:absolute after:inset-x-0 after:bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-clay after:transition-transform after:duration-500 after:ease-[var(--ease-luxe)] hover:after:scale-x-100"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with the clinic on WhatsApp"
              className="grid size-10 place-items-center rounded-full text-charcoal transition-colors hover:bg-sand lg:hidden"
            >
              <WhatsAppIcon className="size-5" />
            </a>
            <a
              href={telHref(clinic.phone.value)}
              className="hidden items-center gap-2 text-[0.8rem] font-medium text-charcoal/80 transition-colors hover:text-ink lg:flex"
            >
              <Phone aria-hidden className="size-4" />
              {clinic.phone.value}
            </a>
            <div className="hidden sm:block">
              <Link href="/book" className={buttonClasses('primary', undefined, scrolled ? 'sm' : 'md')}>
                Book Appointment
              </Link>
            </div>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label="Open menu"
              className="grid size-10 place-items-center rounded-full text-charcoal transition-colors hover:bg-sand xl:hidden"
            >
              <Menu aria-hidden className="size-5" />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open ? (
          <m.div
            key="menu"
            id="mobile-menu"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[70] flex flex-col bg-ivory xl:hidden"
          >
            <div className="container-x flex h-20 items-center justify-between">
              <Logo />
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="grid size-10 place-items-center rounded-full text-charcoal transition-colors hover:bg-sand"
              >
                <X aria-hidden className="size-5" />
              </button>
            </div>
            <div data-lenis-prevent className="container-x flex flex-1 flex-col justify-between overflow-y-auto pt-6 pb-10">
              <ul className="space-y-1">
                {navLinks.map((link, i) => (
                  <m.li
                    key={link.href}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.04, duration: 0.6 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="flex items-baseline justify-between border-b border-line py-3.5 font-serif text-[2rem] leading-none text-ink transition-colors hover:text-clay"
                    >
                      {link.label}
                      <span className="font-sans text-[0.65rem] tracking-[0.2em] text-taupe">{String(i + 1).padStart(2, '0')}</span>
                    </Link>
                  </m.li>
                ))}
              </ul>
              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                <Link href="/book" onClick={() => setOpen(false)} className={buttonClasses('primary')}>
                  Book Appointment
                </Link>
                <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className={buttonClasses('outline')}>
                  <WhatsAppIcon className="size-4" /> WhatsApp
                </a>
              </div>
            </div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
