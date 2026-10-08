/**
 * Single source of truth for clinic facts.
 *
 * Values marked `source: 'listing'` were gathered from public directory
 * listings (Justdial, DocIndia, Lybrate, Practo, Yappe) and MUST be confirmed
 * with the clinic before launch. Anything still unknown is `null` and renders
 * as a clearly marked placeholder on the site — never replace these with
 * guesses.
 */

export type Fact<T> = { value: T; source: 'listing' | 'clinic' };

export const clinic = {
  name: 'Twacha Clinic',
  wordmark: 'TWACHA CLINIC',
  fullName: 'Twacha Skin Clinic',
  tagline: 'Dermatology • Hair • Aesthetic Care',
  city: 'Kota',

  doctor: {
    name: 'Dr. Vivek Singhvi',
    title: 'Dermatologist',
    qualifications: {
      source: 'listing',
      value: [
        { degree: 'MD – Dermatology, Venereology & Leprosy', institution: 'Mahadevappa Rampure Medical College, Gulbarga' },
        { degree: 'MBBS', institution: 'Rabindranath Tagore Medical College, Udaipur' },
      ],
    } satisfies Fact<{ degree: string; institution: string }[]>,
    // Listings disagree (21 vs 26 years) — keep as placeholder until confirmed.
    experience: null as Fact<string> | null,
    memberships: null as Fact<string[]> | null,
  },

  address: {
    source: 'listing',
    value: {
      line1: '464-A, Talwandi',
      line2: 'Near DAV School, Opp. Hanuman Mandir',
      locality: 'Talwandi',
      city: 'Kota',
      region: 'Rajasthan',
      postalCode: '324005',
      country: 'IN',
    },
  } satisfies Fact<{
    line1: string;
    line2: string;
    locality: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  }>,

  phone: { source: 'listing', value: '+91 82906 92839' } satisfies Fact<string>,
  // Assumed to be the same as the phone number — confirm WhatsApp is active on it.
  whatsapp: { source: 'listing', value: '+91 82906 92839' } satisfies Fact<string>,
  email: null as Fact<string> | null,

  hours: {
    // Only "closed on Sunday" was found in listings; exact hours are unverified.
    summary: null as Fact<string> | null,
    note: { source: 'listing', value: 'Closed on Sundays' } satisfies Fact<string>,
  },

  /** Leave empty to hide the icons. Add only official clinic profiles. */
  social: {
    instagram: null as string | null,
    facebook: null as string | null,
  },

  /** Google Maps search query that resolves to the clinic. */
  mapsQuery: 'Twacha Clinic, Talwandi, Kota, Rajasthan 324005',
} as const;

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export function addressLines() {
  const a = clinic.address.value;
  return [a.line1, a.line2, `${a.city}, ${a.region} ${a.postalCode}`];
}

export function formatAddress() {
  return addressLines().join(', ');
}

export function telHref(number: string) {
  return `tel:${number.replace(/[^\d+]/g, '')}`;
}

export function whatsappHref(message?: string) {
  const digits = clinic.whatsapp.value.replace(/\D/g, '');
  const text = message ?? `Hello ${clinic.name}, I would like to enquire about an appointment with ${clinic.doctor.name}.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export const mapsEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(clinic.mapsQuery)}&output=embed`;
export const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(clinic.mapsQuery)}`;
export const reviewsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.mapsQuery)}`;
