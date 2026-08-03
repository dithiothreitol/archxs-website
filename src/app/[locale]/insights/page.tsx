import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Container, PageHeader } from "@/components/layout-primitives";
import { Reveal } from "@/components/reveal";
import { Link } from "@/i18n/navigation";
import { getInsights } from "@/lib/content";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.insights" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates(locale, "/insights"),
    ...buildOpenGraph({
      locale,
      path: "/insights",
      title: t("title"),
      description: t("description"),
    }),
  };
}

export default async function InsightsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("pages.insights");
  const tc = await getTranslations("common");
  const tn = await getTranslations("nav");
  const items = getInsights(locale);

  return (
    <>
      <BreadcrumbJsonLd
        locale={locale}
        items={[
          { name: "ArchXS", path: "" },
          { name: tn("insights"), path: "/insights" },
        ]}
      />
      <PageHeader kicker={t("kicker")} title={t("title")} lead={t("lead")} />

      <Container className="py-16 sm:py-20">
        <ul className="border-t border-border">
          {items.map((item, i) => (
            <Reveal as="li" key={item.slug} delay={i * 40}>
              <Link
                href={`/insights/${item.slug}`}
                className="group grid gap-x-10 gap-y-3 border-b border-border py-9 lg:grid-cols-[9rem_1fr_auto]"
              >
                <div className="sheet-label lg:pt-1.5">
                  {item.frontmatter.topic}
                </div>
                <div>
                  <h2 className="text-xl leading-snug sm:text-[1.375rem]">
                    <span className="redline-mark">
                      {item.frontmatter.title}
                    </span>
                  </h2>
                  <p className="measure mt-3 leading-relaxed text-muted-foreground">
                    {item.frontmatter.description}
                  </p>
                </div>
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted-foreground lg:pt-1.5 lg:text-right">
                  {item.frontmatter.date}
                  <br className="hidden lg:block" />
                  <span className="lg:mt-1 lg:inline-block">
                    {" "}
                    {item.frontmatter.readingMinutes} {tc("minutes")}
                  </span>
                </p>
              </Link>
            </Reveal>
          ))}
        </ul>
      </Container>
    </>
  );
}
