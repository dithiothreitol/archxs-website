import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { BreadcrumbJsonLd, FounderJsonLd } from "@/components/seo/json-ld";
import { Container, PageHeader } from "@/components/layout-primitives";
import { SITE_CONFIG } from "@/lib/constants";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.about" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates(locale, "/about"),
    ...buildOpenGraph({
      locale,
      path: "/about",
      title: t("title"),
      description: t("description"),
    }),
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("pages.about");
  const tn = await getTranslations("nav");
  const paragraphs = t.raw("paragraphs") as string[];
  const sectors = t.raw("sectors") as string[];

  return (
    <>
      <FounderJsonLd locale={locale as "pl" | "en"} />
      <BreadcrumbJsonLd
        locale={locale}
        items={[
          { name: "ArchXS", path: "" },
          { name: tn("about"), path: "/about" },
        ]}
      />
      <PageHeader kicker={t("kicker")} title={t("title")} lead={t("lead")} />

      <Container className="py-16 sm:py-20">
        <div className="grid gap-14 lg:grid-cols-[1fr_18rem] lg:gap-20">
          <div className="measure space-y-6 text-[1.0625rem] leading-[1.75] text-foreground/90">
            {paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>

          <aside className="space-y-9">
            <div>
              <p className="sheet-label">{t("credentialsLabel")}</p>
              <ul className="mt-3 space-y-2">
                {SITE_CONFIG.credentials.map((c) => (
                  <li
                    key={c}
                    className="border-t border-border pt-2 font-mono text-sm text-muted-foreground"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="sheet-label">{t("sectorsLabel")}</p>
              <ul className="mt-3 space-y-2">
                {sectors.map((s) => (
                  <li
                    key={s}
                    className="border-t border-border pt-2 text-sm text-muted-foreground"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="sheet-label">{t("founderLabel")}</p>
              <p className="mt-3 border-t border-border pt-3 text-sm leading-relaxed text-muted-foreground">
                {t("founderNote")}
              </p>
              <p className="mt-3">
                <a
                  href={SITE_CONFIG.linkedin}
                  target="_blank"
                  rel="noopener noreferrer me"
                  className="redline-mark font-mono text-[0.6875rem] uppercase tracking-[0.16em]"
                >
                  LinkedIn ↗
                </a>
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
