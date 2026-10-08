/**
 * Patient reviews. Add ONLY genuine reviews the patient has permitted you to
 * publish (e.g. copied from the clinic's Google Business Profile).
 * `rating` should only be set if it is the rating the patient actually gave.
 * While this list is empty the section shows placeholder slots.
 */
export type Review = {
  quote: string;
  author: string;
  context?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
};

export const reviews: Review[] = [];
