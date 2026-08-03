"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * No React state at all: the theme lives on <html class="dark">, and which icon
 * shows is decided by CSS. That keeps the button correct on first paint, with
 * no hydration mismatch and no effect syncing React to the DOM.
 */
export function ThemeToggle() {
  const t = useTranslations("nav");

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
