import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { BlueprintFigure } from "@/components/blueprint-figure";
import { BreadcrumbJsonLd, ServiceJsonLd } from "@/components/seo/json-ld";
import { Container, PageHeader } from "@/components/layout-primitives";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { assetIfExists } from "@/lib/assets";
import { PRACTICE_SLUGS, type PracticeSlug } from "@/lib/routes";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    PRACTICE_SLUGS.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!PRACTICE_SLUGS.includes(slug as PracticeSlug)) return {};
  const t = await getTranslations({ locale, namespace: `practice.items.${slug}` });
  const path = `/practice/${slug}`;
  return {
    title: t("title"),
    description: t("lead").slice(0, 300),
    alternates: buildAlternates(locale, path),
    ...buildOpenGraph({
      locale,
      path,
      title: t("title"),
      description: t("lead").slice(0, 300),
      image: assetIfExists(`/img/practice/${slug}.webp`),
    }),
  };
}

export default async function PracticeAreaPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!PRACTICE_SLUGS.includes(slug as PracticeSlug)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations(`practice.items.${slug}`);
  const ts = await getTranslations("practice.sections");
  const tn = await getTranslations("nav");
  const tc = await getTranslations("common");

  const tItems = await getTranslations("practice.items");
  const artifacts = t.raw("artifacts") as string[];
  const others = PRACTICE_SLUGS.filter((s) => s !== slug);

  return (
    <>
      <ServiceJsonLd
        locale={locale}
        name={t("title")}
        description={t("lead")}
        path={`/practice/${slug}`}
      />
      <BreadcrumbJsonLd
        locale={locale}
        items={[
          { name: "ArchXS", path: "" },
          { name: tn("practice"), path: "/practice" },
          { name: t("short"), path: `/practice/${slug}` },
        ]}
      />

      <PageHeader kicker={tn("practice")} title={t("title")} lead={t("lead")} />

      <Container className="py-16 sm:py-20">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-20">
          <div className="min-w-0 space-y-14">
            <BlueprintFigure
              src={assetIfExists(`/img/practice/${slug}.webp`)}
              alt={t("title")}
              caption={t("teaser")}
              figureNo={`${tc("figure")} 01`}
              aspect="aspect-[16/9]"
              sizes="(max-width: 1024px) 100vw, 700px"
            />

            {(["reframe", "evidence", "consequence"] as const).map((key) => (
              <section key={key}>
                <p className="sheet-label">{ts(key)}</p>
                <p className="measure mt-4 text-[1.0625rem] leading-[1.75] text-foreground/90">
                  {t(key)}
                </p>
              </section>
            ))}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="sheet-label">{ts("artifacts")}</p>
            <ul className="mt-5 space-y-4">
              {artifacts.map((a) => (
                <li
                  key={a}
                  className="border-t border-border pt-3.5 text-sm leading-relaxed text-muted-foreground"
                >
                  {a}
                </li>
              ))}
            </ul>
          </aside>
        </div>

        <nav className="mt-20 border-t border-border pt-8">
          <p className="sheet-label">{tn("practice")}</p>
          <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
            {others.map((s) => (
              <li key={s}>
                <Link
                  href={`/practice/${s}`}
                  className="redline-mark text-sm text-muted-foreground hover:text-foreground"
                >
                  {tItems(`${s}.short`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </>
  );
}
