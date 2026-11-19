"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

/**
 * No React state at all: the theme lives on <html class="dark">, and which icon
 * shows is decided by CSS. That keeps the button correct on first paint, with
 * no hydration mismatch and no effect syncing React to the DOM.
 */
export function ThemeToggle() {
  const t = useTranslations("nav");

  // Safety net: if <html> is ever re-created on the client (a root-layout
  // re-mount), the pre-paint script does not run again, so re-apply the
  // stored theme here. A no-op in the normal case.
  useEffect(() => {
    try {
      const stored = localStorage.getItem("archxs-theme");
      const dark =
        stored === "dark" ||
        (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", dark);
    } catch {
      /* storage disabled — keep whatever the document has */
    }
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("archxs-theme", next ? "dark" : "light");
    } catch {
      /* storage disabled — the theme simply will not persist */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("toggleTheme")}
      className="grid size-8 place-items-center border border-border/70 text-muted-foreground transition-colors hover:border-redline hover:text-foreground"
    >
      <Moon className="size-3.5 dark:hidden" />
      <Sun className="hidden size-3.5 dark:block" />
    </button>
  );
}
