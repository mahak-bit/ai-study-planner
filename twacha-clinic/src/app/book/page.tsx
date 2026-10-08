import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Clock, MapPin, Phone } from 'lucide-react';
import { clinic, formatAddress, telHref, whatsappHref } from '@/content/clinic';
import { BookingForm } from '@/components/sections/booking-form';
import { Placeholder } from '@/components/ui/placeholder';
import { Reveal, TextReveal } from '@/components/ui/reveal';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';

export const metadata: Metadata = {
  title: 'Book an Appointment',
  description: `Request an appointment with ${clinic.doctor.name} at ${clinic.name}, Talwandi, Kota.`,
  alternates: { canonical: '/book' },
};

function FormSkeleton() {
  return (
    <div aria-hidden className="animate-pulse space-y-9">
      <div className="grid gap-9 sm:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i}>
            <div className="h-2.5 w-24 bg-sand" />
            <div className="mt-5 h-px w-full bg-line" />
          </div>
        ))}
      </div>
      <div className="h-24 w-full bg-cream" />
      <div className="h-12 w-52 bg-sand" />
    </div>
  );
}

export default function BookPage() {
  return (
    <section aria-labelledby="book-title" className="pt-32 pb-24 lg:pt-44 lg:pb-36">
      <div className="container-x grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow">Appointments</p>
          <h1 id="book-title" className="display mt-6 text-[3rem] sm:text-6xl lg:text-[4.5rem]">
            <TextReveal lines={['Request an', 'appointment']} className="[&>span:nth-child(2)]:text-clay [&>span:nth-child(2)]:italic" />
          </h1>
          <Reveal delay={0.3}>
            <p className="mt-8 max-w-md leading-relaxed text-muted sm:text-lg">
              Share a few details and the clinic will get in touch to confirm a suitable time with {clinic.doctor.name}.
            </p>
            <ul className="mt-12 space-y-6 border-t border-line pt-8 text-sm">
              <li className="flex gap-4">
                <MapPin aria-hidden className="size-4 shrink-0 text-clay" />
                <span className="text-charcoal">{formatAddress()}</span>
              </li>
              <li className="flex gap-4">
                <Phone aria-hidden className="size-4 shrink-0 text-clay" />
                <a href={telHref(clinic.phone.value)} className="text-charcoal hover:text-clay">
                  {clinic.phone.value}
                </a>
              </li>
              <li className="flex gap-4">
                <WhatsAppIcon className="size-4 shrink-0 text-clay" />
                <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="text-charcoal hover:text-clay">
                  Prefer to chat? Message us on WhatsApp
                </a>
              </li>
              <li className="flex gap-4">
                <Clock aria-hidden className="size-4 shrink-0 text-clay" />
                <span className="text-charcoal">
                  {clinic.hours.summary ? clinic.hours.summary.value : <Placeholder>Insert verified hours</Placeholder>} · {clinic.hours.note.value}
                </span>
              </li>
            </ul>
          </Reveal>
        </div>
        <Reveal className="lg:col-span-6 lg:col-start-7" delay={0.15}>
          <Suspense fallback={<FormSkeleton />}>
            <BookingForm />
          </Suspense>
        </Reveal>
      </div>
    </section>
  );
}
