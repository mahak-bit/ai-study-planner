import Link from 'next/link';
import { CalendarDays } from 'lucide-react';
import { whatsappHref } from '@/content/clinic';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';

/** Sticky bottom call-to-action shown on phones and small tablets. */
export function MobileCtaBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ivory/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
      <div className="grid grid-cols-[1fr_auto] gap-2 p-2.5">
        <Link
          href="/book"
          className="flex h-12 items-center justify-center gap-2 bg-charcoal text-[0.78rem] font-semibold tracking-[0.1em] text-ivory uppercase transition-colors active:bg-clay"
        >
          <CalendarDays aria-hidden className="size-4" />
          Book Appointment
        </Link>
        <a
          href={whatsappHref()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 items-center justify-center gap-2 border border-charcoal/20 px-5 text-[0.78rem] font-semibold tracking-[0.1em] text-charcoal uppercase transition-colors active:bg-sand"
        >
          <WhatsAppIcon className="size-[1.1rem]" />
          WhatsApp
        </a>
      </div>
    </div>
  );
}
