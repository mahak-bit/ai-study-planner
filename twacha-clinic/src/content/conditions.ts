import type { LucideIcon } from 'lucide-react';
import {
  CircleDot,
  Droplets,
  Feather,
  Fingerprint,
  Flower2,
  Leaf,
  Microscope,
  ScanFace,
  ScanSearch,
  ShieldPlus,
  Sun,
  Waves,
  Wind,
  Sprout,
  Snowflake,
  Layers,
  Palette,
  Shell,
} from 'lucide-react';

/**
 * Conditions shown on the site. Confirm each one is offered by the clinic
 * before launch; remove any that are not.
 */
export type Condition = {
  slug: string;
  name: string;
  summary: string;
  detail: string;
  icon: LucideIcon;
};

export const skinConditions: Condition[] = [
  {
    slug: 'acne',
    name: 'Acne',
    summary: 'Breakouts, blackheads and inflamed pimples on the face or body.',
    detail: 'Care starts by understanding what may be driving your acne — skin type, routine, lifestyle and history — before discussing suitable options.',
    icon: ScanFace,
  },
  {
    slug: 'acne-marks',
    name: 'Acne Marks & Scars',
    summary: 'Dark marks and textural changes left behind after acne.',
    detail: 'Marks and scars differ in type and depth. An assessment helps decide which clinical or procedural options may be appropriate.',
    icon: Layers,
  },
  {
    slug: 'pigmentation',
    name: 'Pigmentation',
    summary: 'Dark patches, spots and areas of uneven colour.',
    detail: 'Pigmentation has many causes, from sun exposure to inflammation. Identifying the type guides the approach to care.',
    icon: Sun,
  },
  {
    slug: 'melasma',
    name: 'Melasma',
    summary: 'Symmetrical brown-grey patches, often on the cheeks and forehead.',
    detail: 'Melasma tends to be long-term and influenced by sun and hormones. Management is usually gradual and closely supervised.',
    icon: Palette,
  },
  {
    slug: 'uneven-tone',
    name: 'Uneven Skin Tone',
    summary: 'Dullness, patchiness and inconsistent texture.',
    detail: 'A dermatological review can help separate everyday dullness from conditions that need specific treatment.',
    icon: Droplets,
  },
  {
    slug: 'vitiligo',
    name: 'Vitiligo',
    summary: 'Areas of skin that lose their natural pigment.',
    detail: 'Vitiligo needs a careful medical evaluation. Options and expectations are discussed openly at consultation.',
    icon: Shell,
  },
  {
    slug: 'sensitive-skin',
    name: 'Sensitive Skin',
    summary: 'Skin that stings, reddens or reacts easily to products.',
    detail: 'Understanding triggers and simplifying routines is often the first step toward calmer skin.',
    icon: Feather,
  },
  {
    slug: 'rosacea',
    name: 'Rosacea',
    summary: 'Persistent facial redness, flushing and visible vessels.',
    detail: 'Rosacea is a chronic condition. Care focuses on identifying triggers and managing flare-ups.',
    icon: Flower2,
  },
  {
    slug: 'skin-allergies',
    name: 'Skin Allergies',
    summary: 'Rashes, itching and hives linked to allergic reactions.',
    detail: 'Evaluation looks at possible triggers and patterns so care can be planned around them.',
    icon: ShieldPlus,
  },
  {
    slug: 'eczema',
    name: 'Eczema',
    summary: 'Dry, itchy, inflamed patches that can come and go.',
    detail: 'Long-term eczema care often combines medical treatment with skin-barrier support and trigger management.',
    icon: Snowflake,
  },
  {
    slug: 'psoriasis',
    name: 'Psoriasis',
    summary: 'Thickened, scaly plaques on the skin or scalp.',
    detail: 'Psoriasis is a chronic condition that benefits from regular review and a plan adjusted over time.',
    icon: Waves,
  },
  {
    slug: 'fungal-infections',
    name: 'Fungal Infections',
    summary: 'Itchy, ring-shaped or spreading rashes caused by fungi.',
    detail: 'Correct diagnosis matters — fungal infections can resemble other rashes and need appropriate treatment.',
    icon: Microscope,
  },
  {
    slug: 'warts-moles',
    name: 'Warts & Moles',
    summary: 'Skin growths that are bothersome or need a closer look.',
    detail: 'Growths are examined first. Where removal is suitable, the options are explained before any procedure.',
    icon: CircleDot,
  },
];

export const hairConditions: Condition[] = [
  {
    slug: 'hair-fall',
    name: 'Hair Fall',
    summary: 'More hair shedding than usual when washing or combing.',
    detail: 'Hair fall can have many causes — stress, nutrition, hormones or scalp health. Finding the cause shapes the plan.',
    icon: Wind,
  },
  {
    slug: 'hair-thinning',
    name: 'Hair Thinning',
    summary: 'Gradual loss of density, a widening part or receding hairline.',
    detail: 'Patterns of thinning differ. An evaluation helps decide which medical or procedural options may be suitable.',
    icon: Sprout,
  },
  {
    slug: 'dandruff',
    name: 'Dandruff',
    summary: 'Flaking, itching and an irritated scalp.',
    detail: 'Persistent dandruff can be linked to underlying scalp conditions that respond to targeted care.',
    icon: Leaf,
  },
  {
    slug: 'scalp-conditions',
    name: 'Scalp Conditions',
    summary: 'Itching, scaling, redness or sores on the scalp.',
    detail: 'Scalp concerns are examined closely, as several conditions can look alike on the surface.',
    icon: Fingerprint,
  },
  {
    slug: 'hair-evaluation',
    name: 'Hair & Scalp Evaluation',
    summary: 'A detailed look at your hair and scalp health.',
    detail: 'A structured evaluation of history, pattern and scalp health — a useful starting point for any hair concern.',
    icon: ScanSearch,
  },
];
