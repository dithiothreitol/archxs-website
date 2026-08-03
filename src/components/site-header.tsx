"use client";

import { useState, useSyncExternalStore } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { NAV_ITEMS } from "@/lib/routes";
import { cn } from "@/lib/utils";

/** Scroll position is external state, so it is read as external state. */
function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

export function SiteHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const scrolled = useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY > 8,
    () => false, // server render: treat the page as being at the top
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-background/85 backdrop-blur-[6px] transition-colors",
        scrolled ? "border-border" : "border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5 sm:px-8">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-heading text-lg tracking-tight">ArchXS</span>
          <span className="hidden font-mono text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors group-hover:text-redline sm:inline">
            {t("wordmarkSuffix")}
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-7 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.path);
            return (
              <Link
                key={item.key}
                href={item.path}
                className={cn(
                  "redline-mark font-mono text-[0.6875rem] uppercase tracking-[0.16em] transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-4 md:ml-0">
          <div className="hidden sm:block">
            <LocaleSwitcher />
          </div>
          <ThemeToggle />
          {/* Contact is a nav destination like any other, not a call to action. */}
          <Link
            href="/contact"
            className="redline-mark hidden font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground sm:inline"
          >
            {t("talk")}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={t("menu")}
            aria-expanded={open}
            className="grid size-8 place-items-center border border-border/70 text-muted-foreground md:hidden"
          >
            {open ? <X className="size-3.5" /> : <Menu className="size-3.5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav
            className="mx-auto flex max-w-6xl flex-col px-5 py-2 sm:px-8"
            // Closing on navigation belongs to the click that navigates, not to
            // an effect watching the pathname afterwards.
            onClick={() => setOpen(false)}
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.path}
                className="border-b border-border/50 py-3 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground last:border-0"
              >
                {t(item.key)}
              </Link>
            ))}
            <Link
              href="/contact"
              className="py-3 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground"
            >
              {t("talk")}
            </Link>
            <div className="py-3 sm:hidden">
              <LocaleSwitcher />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
