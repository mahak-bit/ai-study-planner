/**
 * Treatment categories. Names follow services mentioned in public listings
 * (acne scars, melasma, vitiligo, psoriasis, laser, wart & mole removal,
 * anti-ageing, medical cosmetic care). Confirm the final list with the clinic.
 * Copy is deliberately conservative: no guaranteed results.
 */

export type Treatment = {
  name: string;
  summary: string;
  concerns: string;
};

export type TreatmentCategory = {
  id: string;
  label: string;
  intro: string;
  treatments: Treatment[];
};

export const treatmentCategories: TreatmentCategory[] = [
  {
    id: 'clinical',
    label: 'Clinical Dermatology',
    intro: 'Diagnosis and medical management of common and long-term skin conditions.',
    treatments: [
      {
        name: 'Acne Treatment',
        summary: 'Personalised dermatological care focused on understanding the underlying causes of acne and creating an appropriate treatment plan.',
        concerns: 'Active acne, blackheads, recurring breakouts',
      },
      {
        name: 'Pigmentation & Melasma Care',
        summary: 'Evaluation of the type of pigmentation followed by a gradual, supervised approach to management.',
        concerns: 'Melasma, dark spots, post-inflammatory marks',
      },
      {
        name: 'Vitiligo Care',
        summary: 'Careful assessment and an honest discussion of available medical options and realistic expectations.',
        concerns: 'Loss of skin pigment',
      },
      {
        name: 'Psoriasis & Eczema Management',
        summary: 'Long-term care plans for chronic inflammatory skin conditions, reviewed and adjusted over time.',
        concerns: 'Scaly plaques, dry itchy patches, flare-ups',
      },
      {
        name: 'Skin Infection & Allergy Care',
        summary: 'Accurate diagnosis of rashes, fungal infections and allergic reactions to guide appropriate treatment.',
        concerns: 'Fungal rashes, hives, contact allergies',
      },
    ],
  },
  {
    id: 'hair',
    label: 'Hair & Scalp',
    intro: 'Understanding the cause behind hair and scalp concerns before planning care.',
    treatments: [
      {
        name: 'Hair Fall Evaluation',
        summary: 'A structured review of history, pattern and scalp health to understand why hair fall is happening.',
        concerns: 'Excess shedding, sudden hair fall',
      },
      {
        name: 'Hair Thinning Management',
        summary: 'Discussion of medical and procedural options that may suit your pattern of thinning.',
        concerns: 'Reduced density, widening part, receding hairline',
      },
      {
        name: 'Scalp Care',
        summary: 'Targeted care for persistent dandruff, itching and inflammatory scalp conditions.',
        concerns: 'Dandruff, scaling, scalp irritation',
      },
    ],
  },
  {
    id: 'aesthetics',
    label: 'Cosmetic & Aesthetic',
    intro: 'Procedures discussed after a dermatological evaluation, with a focus on natural-looking outcomes.',
    treatments: [
      {
        name: 'Laser Treatments',
        summary: 'Laser-based procedures considered for selected skin concerns, after assessing suitability for your skin type.',
        concerns: 'Selected pigmentation, scarring and hair concerns',
      },
      {
        name: 'Acne Scar Treatment',
        summary: 'Procedural options chosen according to scar type and depth, often planned over several sessions.',
        concerns: 'Atrophic scars, uneven texture',
      },
      {
        name: 'Wart & Mole Removal',
        summary: 'Examination of skin growths and, where appropriate, removal using a suitable clinical technique.',
        concerns: 'Warts, moles, benign skin growths',
      },
      {
        name: 'Medical Cosmetic Skin Care',
        summary: 'Dermatologist-guided skin care for everyday cosmetic concerns, grounded in skin health.',
        concerns: 'Dullness, uneven tone, routine guidance',
      },
    ],
  },
  {
    id: 'rejuvenation',
    label: 'Skin Rejuvenation',
    intro: 'Supporting healthy, balanced skin as it changes over time.',
    treatments: [
      {
        name: 'Anti-Ageing Consultation',
        summary: 'An assessment of age-related skin changes and a conversation about suitable, evidence-informed options.',
        concerns: 'Fine lines, loss of firmness, sun damage',
      },
      {
        name: 'Skin Tone & Texture Care',
        summary: 'Clinical care aimed at improving the overall quality and evenness of the skin.',
        concerns: 'Uneven tone, rough texture, dullness',
      },
    ],
  },
];

/** Large showcase slides. `media` keys refer to src/content/media.ts. */
export const featuredTreatments = [
  {
    name: 'Acne & Acne Scar Care',
    media: 'featuredAcne',
    helps: 'Active breakouts, post-acne marks and textural scarring.',
    suitable: 'Teens and adults with persistent acne or marks that have not settled with routine care.',
  },
  {
    name: 'Pigmentation & Melasma',
    media: 'featuredPigmentation',
    helps: 'Dark patches, uneven tone and long-standing melasma.',
    suitable: 'Anyone noticing new or worsening pigmentation who wants a professional diagnosis first.',
  },
  {
    name: 'Hair & Scalp Evaluation',
    media: 'featuredHair',
    helps: 'Hair fall, thinning and recurring scalp problems.',
    suitable: 'Men and women concerned about changes in hair density or scalp health.',
  },
  {
    name: 'Laser & Aesthetic Procedures',
    media: 'featuredLaser',
    helps: 'Selected cosmetic concerns, following a dermatological assessment.',
    suitable: 'Patients seeking natural-looking improvement whose skin is assessed as suitable.',
  },
] as const;
