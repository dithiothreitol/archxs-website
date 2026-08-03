import { SITE_CONFIG } from "./constants";
import { routing } from "@/i18n/routing";

export const LOCALES = routing.locales;

/**
 * Mirrors src/i18n/routing.ts + next.config.ts. Every locale is prefixed in
 * every mode; only the trailing slash differs, because the static export sets
 * trailingSlash: true. Deriving the URL shape from the same source as the
 * router keeps canonical/hreflang/sitemap URLs identical to the routes
 * actually served — a canonical pointing at a URL that then redirects is
 * exactly what triggers Search Console's "page with redirect" warning.
 */
const STATIC_EXPORT = process.env.STATIC_EXPORT === "true";

/** Absolute URL for a locale + path, honoring the active localePrefix. */
export function localeUrl(locale: string, path = ""): string {
  const url = `${SITE_CONFIG.url}/${locale}${path}`;
  return STATIC_EXPORT && !url.endsWith("/") ? `${url}/` : url;
}

/**
 * Metadata `alternates`: a self-referencing canonical (each localized page is
 * canonical to itself, NOT to the default locale) plus the full hreflang
 * cluster. x-default points at EN: visitors whose language matches neither
 * locale are better served in English.
 */
export function buildAlternates(locale: string, path = "") {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[l] = localeUrl(l, path);
  languages["x-default"] = localeUrl("en", path);
  return { canonical: localeUrl(locale, path), languages };
}

/**
 * Same as buildAlternates, but limited to the locales in which the item
 * actually exists. Pointing hreflang at a translation that has not been
 * written yet advertises a 404 to every engine that follows it.
 */
export function buildAlternatesFor(
  locale: string,
  path: string,
  availableLocales: readonly string[],
) {
  const languages: Record<string, string> = {};
  for (const l of availableLocales) languages[l] = localeUrl(l, path);
  if (availableLocales.includes("en")) {
    languages["x-default"] = localeUrl("en", path);
  }
  return { canonical: localeUrl(locale, path), languages };
}

const OG_LOCALE: Record<string, string> = { pl: "pl_PL", en: "en_US" };

/** Shared OpenGraph/Twitter block so every page ships the same social shape. */
export function buildOpenGraph(opts: {
  locale: string;
  path?: string;
  title: string;
  description: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
}) {
  const image = opts.image ?? "/img/og/og-default.png";
  return {
    openGraph: {
      type: opts.type ?? ("website" as const),
      url: localeUrl(opts.locale, opts.path ?? ""),
      siteName: SITE_CONFIG.name,
      title: opts.title,
      description: opts.description,
      locale: OG_LOCALE[opts.locale] ?? "pl_PL",
      alternateLocale: LOCALES.filter((l) => l !== opts.locale).map(
        (l) => OG_LOCALE[l],
      ),
      images: [{ url: image, width: 1200, height: 630, alt: opts.title }],
      ...(opts.publishedTime && { publishedTime: opts.publishedTime }),
      ...(opts.modifiedTime && { modifiedTime: opts.modifiedTime }),
    },
    twitter: {
      card: "summary_large_image" as const,
      title: opts.title,
      description: opts.description,
      images: [image],
    },
  };
}
