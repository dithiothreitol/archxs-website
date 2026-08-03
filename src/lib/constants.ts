export const SITE_CONFIG = {
  name: "ArchXS",
  url: "https://archxs.com",
  email: "contact@archxs.com",
  /**
   * Booking link. Empty until a real calendar exists: the contact page hides
   * the whole calendar block while this is blank, so no dead link ships.
   * Set it to the Cal.com URL to bring the block back.
   */
  bookingUrl: "",
  linkedin: "https://www.linkedin.com/in/dariusztyszka/",
  github: "https://github.com/dithiothreitol",
  founder: "Dariusz Tyszka",
  founderRole: {
    pl: "Założyciel, principal consultant",
    en: "Founder, principal consultant",
  },
  credentials: ["TOGAF", "CGEIT", "PMP", "PRINCE2", "MSP", "Executive MBA"],
} as const;

/** Sheet numbers for the drafting-sheet section labels (design language, §5). */
export const SHEET = {
  hero: "A-01",
  positions: "A-02",
  practice: "A-03",
  method: "A-04",
  work: "A-05",
  proof: "A-06",
  insights: "A-07",
  faq: "A-08",
  contact: "A-09",
} as const;

/** Site content revision, printed in the footer stamp. Bump on major edits. */
export const REVISION = { rev: "2.0", date: "2026-08" } as const;
