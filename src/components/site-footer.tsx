import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { PRACTICE_SLUGS } from "@/lib/routes";
import { REVISION, SITE_CONFIG } from "@/lib/constants";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const tp = await getTranslations("practice.items");
  const tn = await getTranslations("nav");

  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-heading text-base">ArchXS</p>
            <p className="measure-tight mt-3 text-sm leading-relaxed text-muted-foreground">
              {t("blurb")}
            </p>
          </div>

          <div>
            <p className="sheet-label">{tn("practice")}</p>
            <ul className="mt-3 space-y-2">
              {PRACTICE_SLUGS.map((slug) => (
                <li key={slug}>
                  <Link
                    href={`/practice/${slug}`}
                    className="redline-mark text-sm text-muted-foreground hover:text-foreground"
                  >
                    {tp(`${slug}.short`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="sheet-label">{t("navigate")}</p>
            <ul className="mt-3 space-y-2">
              {[
                { href: "/work", label: tn("work") },
                { href: "/insights", label: tn("insights") },
                { href: "/method", label: tn("method") },
                { href: "/engage", label: tn("engage") },
                { href: "/resources", label: tn("resources") },
                { href: "/about", label: tn("about") },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="redline-mark text-sm text-muted-foreground hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="sheet-label">{t("contact")}</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="redline-mark text-muted-foreground hover:text-foreground"
                >
                  {SITE_CONFIG.email}
                </a>
              </li>
              <li>
                <a
                  href={SITE_CONFIG.linkedin}
                  rel="noopener noreferrer me"
                  target="_blank"
                  className="redline-mark text-muted-foreground hover:text-foreground"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href={SITE_CONFIG.github}
                  rel="noopener noreferrer me"
                  target="_blank"
                  className="redline-mark text-muted-foreground hover:text-foreground"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Revision stamp: a drawing is always issued at a revision. */}
        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-5 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            {SITE_CONFIG.name} · rev {REVISION.rev} · {REVISION.date}
          </p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-foreground">
              {t("privacy")}
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              {t("terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
