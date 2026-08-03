import { defineRouting } from "next-intl/routing";

/**
 * PL is the default: the practice sells into Polish mid-market boards.
 * EN is a full mirror — international clients and, just as importantly, the
 * English-language queries that AI search engines answer from.
 *
 * localePrefix is "always" in every mode, deliberately. Static export needs it
 * (every route must be a real file), and "as-needed" would require middleware
 * to rewrite the unprefixed default locale — which `output: export` forbids.
 * Keeping one value means dev and production resolve URLs identically, so a
 * canonical can never point at a path that only exists in one of them.
 * The bare "/" is handled without middleware: a dev-only redirect in
 * next.config.ts, and a generated root index.html in the export (see
 * scripts/post-static-build.ts).
 */
export const routing = defineRouting({
  locales: ["pl", "en"],
  defaultLocale: "pl",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
