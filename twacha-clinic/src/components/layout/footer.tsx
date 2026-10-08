import Link from 'next/link';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { clinic, formatAddress, telHref, whatsappHref } from '@/content/clinic';
import { footerLinks } from '@/content/navigation';
import { Placeholder } from '@/components/ui/placeholder';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';
import { Logo } from './logo';

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4" fill="currentColor">
      <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.87.25-1.46 1.5-1.46H16.6V4.46A21 21 0 0 0 14.3 4.3c-2.28 0-3.84 1.39-3.84 3.95v2.25H8v3h2.46V21h3.04Z" />
    </svg>
  );
}

export function Footer() {
  const socials = [
    clinic.social.instagram && { href: clinic.social.instagram, label: 'Instagram', icon: <InstagramIcon /> },
    clinic.social.facebook && { href: clinic.social.facebook, label: 'Facebook', icon: <FacebookIcon /> },
    { href: whatsappHref(), label: 'WhatsApp', icon: <WhatsAppIcon className="size-4" /> },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode }[];

  return (
    <footer className="bg-ink pb-28 text-ivory/70 lg:pb-0">
      <div className="container-x grid gap-14 py-20 md:grid-cols-12 lg:py-24">
        <div className="md:col-span-5">
          <Logo tone="light" />
          <p className="mt-6 max-w-sm text-sm leading-relaxed">
            Dermatology, hair & scalp and aesthetic care in {clinic.city}, led by {clinic.doctor.name}.
          </p>
          <ul className="mt-8 flex gap-3" aria-label="Social and messaging">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid size-10 place-items-center rounded-full border border-ivory/15 text-ivory/80 transition-colors hover:border-clay-soft hover:text-ivory"
                >
                  {s.icon}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Footer" className="md:col-span-3">
          <h2 className="eyebrow text-clay-soft">Explore</h2>
          <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-1">
            {footerLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-ivory">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-4">
          <h2 className="eyebrow text-clay-soft">Visit</h2>
          <address className="mt-6 space-y-4 text-sm not-italic">
            <p className="flex gap-3">
              <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-clay-soft" />
              <span>
                {clinic.fullName}
                <br />
                {formatAddress()}
              </span>
            </p>
            <p className="flex gap-3">
              <Phone aria-hidden className="mt-0.5 size-4 shrink-0 text-clay-soft" />
              <a href={telHref(clinic.phone.value)} className="hover:text-ivory">
                {clinic.phone.value}
              </a>
            </p>
            <p className="flex gap-3">
              <Mail aria-hidden className="mt-0.5 size-4 shrink-0 text-clay-soft" />
              {clinic.email ? (
                <a href={`mailto:${clinic.email.value}`} className="hover:text-ivory">
                  {clinic.email.value}
                </a>
              ) : (
                <Placeholder className="border-clay-soft/40 text-clay-soft">Insert verified email</Placeholder>
              )}
            </p>
            <p className="flex gap-3">
              <Clock aria-hidden className="mt-0.5 size-4 shrink-0 text-clay-soft" />
              <span>
                {clinic.hours.summary ? (
                  clinic.hours.summary.value
                ) : (
                  <Placeholder className="border-clay-soft/40 text-clay-soft">Insert verified hours</Placeholder>
                )}
                <br />
                {clinic.hours.note.value}
              </span>
            </p>
          </address>
        </div>
      </div>

      <div className="border-t border-ivory/10">
        <div className="container-x flex flex-col gap-4 py-8 text-xs leading-relaxed text-ivory/50 md:flex-row md:items-start md:justify-between">
          <p className="max-w-2xl">
            The information on this website is for general awareness only and is not a substitute for a medical consultation.
            Diagnosis and treatment decisions are made only after an in-person evaluation. Individual results vary.
          </p>
          <p className="shrink-0">
            © {new Date().getFullYear()} {clinic.fullName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
