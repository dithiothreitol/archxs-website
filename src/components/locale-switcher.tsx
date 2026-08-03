"use client";

import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 font-mono text-[0.6875rem] uppercase tracking-[0.14em]">
      {routing.locales.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span className="text-border">/</span>}
          <Link
            href={pathname}
            locale={l}
            hrefLang={l}
            aria-current={l === locale ? "true" : undefined}
            className={cn(
              "transition-colors",
              l === locale
                ? "text-foreground"
                : "text-muted-foreground hover:text-redline",
            )}
          >
            {l}
          </Link>
        </span>
      ))}
    </div>
  );
}
