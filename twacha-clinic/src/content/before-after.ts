/**
 * Before / after cases. Add ONLY real, consented and authorised clinic images.
 * While this list is empty the entire section is hidden from the site.
 */
export type BeforeAfterCase = {
  category: string;
  before: { src: string; alt: string };
  after: { src: string; alt: string };
  note?: string;
};

export const beforeAfterCases: BeforeAfterCase[] = [];
