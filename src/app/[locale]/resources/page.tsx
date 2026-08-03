import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Container, PageHeader } from "@/components/layout-primitives";
import { Reveal } from "@/components/reveal";
import { Link } from "@/i18n/navigation";
import { SITE_CONFIG } from "@/lib/constants";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.resources" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates(locale, "/resources"),
    ...buildOpenGraph({
      locale,
      path: "/resources",
      title: t("title"),
      description: t("description"),
    }),
  };
}

type Item = { name: string; desc: string };

export default async function ResourcesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("pages.resources");
  const tn = await getTranslations("nav");
  const oss = t.raw("oss") as Item[];

  return (
    <>
      <BreadcrumbJsonLd
        locale={locale}
        items={[
          { name: "ArchXS", path: "" },
          { name: tn("resources"), path: "/resources" },
        ]}
      />
      <PageHeader kicker={t("kicker")} title={t("title")} lead={t("lead")} />

      <Container className="py-16 sm:py-20">
        <section>
          <p className="sheet-label">{t("ossTitle")}</p>
          <p className="measure mt-4 leading-relaxed text-muted-foreground">
            {t("ossLead")}
          </p>
          <ul className="mt-8 border-t border-border">
            {oss.map((o, i) => (
              <Reveal as="li" key={o.name} delay={i * 40}>
                <div className="grid gap-x-10 gap-y-2 border-b border-border py-7 lg:grid-cols-[18rem_1fr]">
                  <h2 className="font-mono text-sm">{o.name}</h2>
                  <p className="measure text-sm leading-relaxed text-muted-foreground">
                    {o.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
          <p className="mt-6">
            <a
              href={SITE_CONFIG.github}
              target="_blank"
              rel="noopener noreferrer"
              className="redline-mark font-mono text-[0.6875rem] uppercase tracking-[0.16em]"
            >
              GitHub ↗
            </a>
          </p>
        </section>

        <section className="mt-20 max-w-2xl border-t border-border pt-6">
          <p className="sheet-label">{t("writingTitle")}</p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            {t("writingLead")}
          </p>
          <p className="mt-5">
            <Link
              href="/insights"
              className="redline-mark font-mono text-[0.6875rem] uppercase tracking-[0.16em]"
            >
              {tn("insights")} →
            </Link>
          </p>
        </section>
      </Container>
    </>
  );
}
