import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { BlueprintFigure } from "@/components/blueprint-figure";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Container, PageHeader } from "@/components/layout-primitives";
import { Reveal } from "@/components/reveal";
import { assetIfExists } from "@/lib/assets";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.method" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates(locale, "/method"),
    ...buildOpenGraph({
      locale,
      path: "/method",
      title: t("title"),
      description: t("description"),
    }),
  };
}

type Step = { step: string; title: string; body: string };
type Rule = { title: string; body: string };

export default async function MethodPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("pages.method");
  const tn = await getTranslations("nav");
  const tc = await getTranslations("common");

  const doctrine = t.raw("doctrine") as Rule[];
  const process = t.raw("process") as Step[];

  return (
    <>
      <BreadcrumbJsonLd
        locale={locale}
        items={[
          { name: "ArchXS", path: "" },
          { name: tn("method"), path: "/method" },
        ]}
      />
      <PageHeader kicker={t("kicker")} title={t("title")} lead={t("lead")} />

      <Container className="py-16 sm:py-20">
        <section>
          <p className="sheet-label">{t("doctrineTitle")}</p>
          <ol className="mt-8 border-t border-border">
            {doctrine.map((rule, i) => (
              <Reveal as="li" key={rule.title} delay={i * 50}>
                <div className="grid gap-x-10 gap-y-2 border-b border-border py-8 sm:grid-cols-[3rem_16rem_1fr]">
                  <span className="font-mono text-xs text-redline">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="text-lg leading-snug">{rule.title}</h2>
                  <p className="measure text-[0.9375rem] leading-relaxed text-muted-foreground">
                    {rule.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </section>

        <section className="mt-20 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-16">
          <div className="max-w-3xl border-t border-border pt-6">
            <p className="sheet-label">{t("lineageTitle")}</p>
            <p className="mt-4 text-[1.0625rem] leading-[1.75] text-foreground/90">
              {t("lineageBody")}
            </p>
          </div>
          <BlueprintFigure
            src={assetIfExists("/img/method/method-loop.webp")}
            alt={t("doctrineTitle")}
            caption={t("doctrineTitle")}
            figureNo={`${tc("figure")} 01`}
            aspect="aspect-square"
            sizes="(max-width: 1024px) 100vw, 352px"
            className="lg:mt-6"
          />
        </section>

        <section className="mt-24">
          <p className="sheet-label">{t("processTitle")}</p>
          <p className="measure mt-4 text-lg leading-relaxed text-muted-foreground">
            {t("processLead")}
          </p>
          <ol className="mt-10 border-t border-border">
            {process.map((s, i) => (
              <Reveal as="li" key={s.step} delay={i * 40}>
                <div className="grid gap-x-10 gap-y-2 border-b border-border py-7 sm:grid-cols-[4rem_14rem_1fr]">
                  <span className="font-mono text-xs text-redline">{s.step}</span>
                  <h3 className="text-base font-medium">{s.title}</h3>
                  <p className="measure text-sm leading-relaxed text-muted-foreground">
                    {s.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </section>

        <section className="mt-24 max-w-3xl border-t border-border pt-6">
          <p className="sheet-label">{t("aiTitle")}</p>
          <p className="mt-4 text-[1.0625rem] leading-[1.75] text-foreground/90">
            {t("aiBody")}
          </p>
        </section>
      </Container>
    </>
  );
}
