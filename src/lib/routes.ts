/**
 * Single source of truth for the route table: navigation, sitemap and llms.txt
 * all read from here so they can never drift apart.
 */
export const PRACTICE_SLUGS = [
  "enterprise-architecture",
  "business-process-automation",
  "cybersecurity-identity",
  "applied-ai",
  "software-delivery",
] as const;

export type PracticeSlug = (typeof PRACTICE_SLUGS)[number];

export const STATIC_ROUTES = [
  { path: "", priority: 1.0, changeFrequency: "monthly" as const },
  { path: "/practice", priority: 0.9, changeFrequency: "monthly" as const },
  ...PRACTICE_SLUGS.map((s) => ({
    path: `/practice/${s}`,
    priority: 0.85,
    changeFrequency: "monthly" as const,
  })),
  { path: "/method", priority: 0.8, changeFrequency: "yearly" as const },
  { path: "/work", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/insights", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/resources", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/engage", priority: 0.7, changeFrequency: "yearly" as const },
  { path: "/about", priority: 0.6, changeFrequency: "yearly" as const },
  { path: "/contact", priority: 0.7, changeFrequency: "yearly" as const },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" as const },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" as const },
];

/** Primary navigation (order matters). Labels come from messages/nav.*. */
export const NAV_ITEMS = [
  { key: "practice", path: "/practice" },
  { key: "work", path: "/work" },
  { key: "insights", path: "/insights" },
  { key: "method", path: "/method" },
  { key: "about", path: "/about" },
] as const;
