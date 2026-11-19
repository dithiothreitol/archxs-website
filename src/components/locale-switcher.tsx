"use client";

import { useLocale } from "next-intl";
import { getPathname, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * Plain <a>, not the router <Link>, on purpose. `[locale]/layout.tsx` is the
 * root layout, so switching locale swaps the whole document: a soft navigation
 * re-mounts <html> without the `dark` class that the pre-paint script set (that
 * script never runs again on the client), which flipped the theme. A full page
 * load re-runs the script and is the correct thing for a root-layout change
 * anyway — it also works the same in dev and in the static export.
 */
export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 font-mono text-[0.6875rem] uppercase tracking-[0.14em]">
      {routing.locales.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span className="text-border">/</span>}
          <a
            href={getPathname({ href: pathname, locale: l })}
            hrefLang={l}
            lang={l}
            aria-current={l === locale ? "true" : undefined}
            className={cn(
              "transition-colors",
              l === locale
                ? "text-foreground"
                : "text-muted-foreground hover:text-redline",
            )}
          >
            {l}
          </a>
        </span>
      ))}
    </div>
  );
}
