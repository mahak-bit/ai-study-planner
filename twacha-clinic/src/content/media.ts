/**
 * Every image slot on the site. Leave `src` as null to show a labelled
 * placeholder; set it to a file in /public/images (e.g. '/images/doctor.jpg')
 * to render the real photo with next/image.
 *
 * Use only real, authorised photographs of the doctor and clinic.
 */

export type MediaSlot = {
  src: string | null;
  alt: string;
  label: string;
  tone: 'sand' | 'clay' | 'stone' | 'ivory';
};

export const media = {
  hero: { src: null, alt: 'Dr. Vivek Singhvi at Twacha Clinic, Kota', label: 'Hero photograph — doctor or clinic interior', tone: 'sand' },
  doctor: { src: null, alt: 'Portrait of Dr. Vivek Singhvi, dermatologist', label: 'Portrait of Dr. Vivek Singhvi', tone: 'clay' },
  featuredAcne: { src: null, alt: 'Acne and acne scar care at Twacha Clinic', label: 'Acne care photograph', tone: 'sand' },
  featuredPigmentation: { src: null, alt: 'Pigmentation and melasma consultation', label: 'Pigmentation care photograph', tone: 'stone' },
  featuredHair: { src: null, alt: 'Hair and scalp evaluation', label: 'Hair & scalp photograph', tone: 'clay' },
  featuredLaser: { src: null, alt: 'Laser treatment room at Twacha Clinic', label: 'Laser / procedure room photograph', tone: 'ivory' },
  galleryReception: { src: null, alt: 'Reception area at Twacha Clinic', label: 'Reception', tone: 'sand' },
  galleryConsultation: { src: null, alt: 'Consultation room at Twacha Clinic', label: 'Consultation room', tone: 'stone' },
  galleryTreatment: { src: null, alt: 'Treatment room at Twacha Clinic', label: 'Treatment room', tone: 'clay' },
  galleryEnvironment: { src: null, alt: 'Clinic interior at Twacha Clinic', label: 'Clinic environment', tone: 'ivory' },
  galleryEquipment: { src: null, alt: 'Dermatology equipment at Twacha Clinic', label: 'Equipment', tone: 'sand' },
} satisfies Record<string, MediaSlot>;

export type MediaKey = keyof typeof media;
