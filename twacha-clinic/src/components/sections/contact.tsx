import { CalendarDays, Clock, Mail, MapPin, Navigation, Phone } from 'lucide-react';
import { clinic, addressLines, directionsHref, mapsEmbedSrc, telHref, whatsappHref } from '@/content/clinic';
import { ButtonLink } from '@/components/ui/button';
import { Placeholder } from '@/components/ui/placeholder';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/ui/reveal';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';

export function Contact() {
  const rows = [
    {
      icon: MapPin,
      label: 'Address',
      value: (
        <>
          {addressLines().map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </>
      ),
    },
    {
      icon: Phone,
      label: 'Phone',
      value: (
        <a href={telHref(clinic.phone.value)} className="hover:text-clay">
          {clinic.phone.value}
        </a>
      ),
    },
    {
      icon: WhatsAppIcon,
      label: 'WhatsApp',
      value: (
        <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="hover:text-clay">
          {clinic.whatsapp.value}
        </a>
      ),
    },
    {
      icon: Mail,
      label: 'Email',
      value: clinic.email ? (
        <a href={`mailto:${clinic.email.value}`} className="hover:text-clay">
          {clinic.email.value}
        </a>
      ) : (
        <Placeholder>Insert verified email</Placeholder>
      ),
    },
    {
      icon: Clock,
      label: 'Opening hours',
      value: (
        <>
          <span className="block">{clinic.hours.summary ? clinic.hours.summary.value : <Placeholder>Insert verified hours</Placeholder>}</span>
          <span className="mt-1 block text-sm text-muted">{clinic.hours.note.value}</span>
        </>
      ),
    },
  ];

  return (
    <section id="contact" aria-labelledby="contact-title" className="bg-sand/50 py-24 lg:py-36">
      <div className="container-x">
        <SectionHeading
          id="contact-title"
          eyebrow="Visit the clinic"
          title={
            <>
              Find us in <em className="text-clay">Talwandi, Kota</em>
            </>
          }
        />

        <div className="mt-14 grid gap-px bg-line lg:mt-20 lg:grid-cols-12">
          <Reveal className="bg-ivory p-7 sm:p-10 lg:col-span-5 lg:p-12">
            <p className="font-serif text-3xl text-ink">{clinic.fullName}</p>
            <p className="mt-1 text-sm text-muted">{clinic.doctor.name}</p>
            <dl className="mt-10 space-y-7">
              {rows.map(({ icon: Icon, label, value }) => (
                <div key={label} className="grid grid-cols-[1.5rem_1fr] gap-4">
                  <Icon aria-hidden className="mt-0.5 size-[1.1rem] text-clay" strokeWidth={1.5} />
                  <div>
                    <dt className="eyebrow text-[0.6rem]">{label}</dt>
                    <dd className="mt-1.5 leading-relaxed text-charcoal">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <div className="mt-12 grid gap-3 sm:grid-cols-2">
              <ButtonLink href="/book" icon={<CalendarDays aria-hidden className="size-4" />}>
                Book Appointment
              </ButtonLink>
              <ButtonLink href={whatsappHref()} variant="outline" icon={<WhatsAppIcon className="size-4" />}>
                WhatsApp
              </ButtonLink>
              <ButtonLink href={telHref(clinic.phone.value)} variant="outline" icon={<Phone aria-hidden className="size-4" />}>
                Call Clinic
              </ButtonLink>
              <ButtonLink href={directionsHref} variant="outline" icon={<Navigation aria-hidden className="size-4" />}>
                Get Directions
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal className="relative min-h-[22rem] bg-sand lg:col-span-7" delay={0.1}>
            <div data-map data-lenis-prevent className="absolute inset-0">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-sm text-muted">
              <MapPin aria-hidden className="size-6 text-clay" strokeWidth={1.4} />
              <p>Loading map…</p>
              <a href={directionsHref} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold tracking-[0.14em] text-charcoal uppercase underline-offset-4 hover:underline">
                Open in Google Maps
              </a>
            </div>
            <iframe
              title={`Map showing ${clinic.fullName}, Talwandi, Kota`}
              src={mapsEmbedSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0 grayscale-[0.6] sepia-[0.15] transition-[filter] duration-700 hover:grayscale-0 hover:sepia-0"
            />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
