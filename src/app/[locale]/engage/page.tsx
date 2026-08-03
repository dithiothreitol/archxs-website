import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Container, PageHeader } from "@/components/layout-primitives";
import { Reveal } from "@/components/reveal";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.engage" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates(locale, "/engage"),
    ...buildOpenGraph({
      locale,
      path: "/engage",
      title: t("title"),
      description: t("description"),
    }),
  };
}

type Form = { title: string; body: string };

export default async function EngagePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("pages.engage");
  const tn = await getTranslations("nav");
  const forms = t.raw("forms") as Form[];

  return (
    <>
      <BreadcrumbJsonLd
        locale={locale}
        items={[
          { name: "ArchXS", path: "" },
          { name: tn("engage"), path: "/engage" },
        ]}
      />
      <PageHeader kicker={t("kicker")} title={t("title")} lead={t("lead")} />

      <Container className="py-16 sm:py-20">
        <p className="sheet-label">{t("formsTitle")}</p>
        <ol className="mt-8 border-t border-border">
          {forms.map((f, i) => (
            <Reveal as="li" key={f.title} delay={i * 50}>
              <div className="grid gap-x-10 gap-y-3 border-b border-border py-8 sm:grid-cols-[3rem_15rem_1fr]">
                <span className="font-mono text-xs text-redline">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="text-lg leading-snug">{f.title}</h2>
                <p className="measure leading-relaxed text-muted-foreground">
                  {f.body}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>

        <div className="mt-20 grid gap-12 sm:grid-cols-2 sm:gap-16">
          <section className="border-t border-border pt-5">
            <p className="sheet-label">{t("selectivityTitle")}</p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {t("selectivityBody")}
            </p>
          </section>
          <section className="border-t border-border pt-5">
            <p className="sheet-label">{t("pricingTitle")}</p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {t("pricingBody")}
            </p>
          </section>
        </div>

      </Container>
    </>
  );
}
