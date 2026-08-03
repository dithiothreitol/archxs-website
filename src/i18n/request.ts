import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

/**
 * Messages are split by concern (site chrome, home, practice, other pages) so
 * that editing copy stays a small, reviewable diff instead of one enormous
 * JSON file. They are merged back into a single namespace tree at request time.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !hasLocale(routing.locales, locale)) {
    locale = routing.defaultLocale;
  }

  const [site, home, practice, pages] = await Promise.all([
    import(`../../messages/${locale}/site.json`),
    import(`../../messages/${locale}/home.json`),
    import(`../../messages/${locale}/practice.json`),
    import(`../../messages/${locale}/pages.json`),
  ]);

  return {
    locale,
    messages: {
      ...site.default,
      ...home.default,
      ...practice.default,
      ...pages.default,
    },
  };
});
