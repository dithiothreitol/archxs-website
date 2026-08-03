import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { slugsForLocale } from "@/lib/content";
import { STATIC_ROUTES } from "@/lib/routes";
import { localeUrl } from "@/lib/seo";

export const dynamic = "force-static";

/**
 * Every URL carries its own hreflang cluster, and content URLs are emitted per
 * locale from the files that actually exist — the sitemap never advertises a
 * translation that has not been written.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const route of STATIC_ROUTES) {
    for (const locale of routing.locales) {
      entries.push({
        url: localeUrl(locale, route.path),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, localeUrl(l, route.path)]),
          ),
        },
      });
    }
  }

  for (const collection of ["work", "insights"] as const) {
    for (const locale of routing.locales) {
      for (const slug of slugsForLocale(collection, locale)) {
        const path = `/${collection}/${slug}`;
        const availableLocales = routing.locales.filter((l) =>
          slugsForLocale(collection, l).includes(slug),
        );
        entries.push({
          url: localeUrl(locale, path),
          changeFrequency: "yearly",
          priority: collection === "insights" ? 0.7 : 0.75,
          alternates: {
            languages: Object.fromEntries(
              availableLocales.map((l) => [l, localeUrl(l, path)]),
            ),
          },
        });
      }
    }
  }

  return entries;
}
