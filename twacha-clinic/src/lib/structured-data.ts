import { clinic, siteUrl } from '@/content/clinic';

/**
 * schema.org data built ONLY from fields present in content/clinic.ts.
 * Unknown values (email, hours, ratings) are omitted rather than guessed.
 */
export function clinicJsonLd() {
  const a = clinic.address.value;
  return {
    '@context': 'https://schema.org',
    '@type': ['MedicalClinic', 'MedicalBusiness', 'LocalBusiness'],
    '@id': `${siteUrl}/#clinic`,
    name: clinic.fullName,
    url: siteUrl,
    telephone: clinic.phone.value.replace(/\s/g, ''),
    ...(clinic.email ? { email: clinic.email.value } : {}),
    medicalSpecialty: 'Dermatology',
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${a.line1}, ${a.line2}`,
      addressLocality: a.city,
      addressRegion: a.region,
      postalCode: a.postalCode,
      addressCountry: a.country,
    },
    employee: {
      '@type': 'Physician',
      name: clinic.doctor.name,
      medicalSpecialty: 'Dermatology',
    },
  };
}

export function serializeJsonLd(data: object) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
