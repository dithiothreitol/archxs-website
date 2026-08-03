import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Container, PageHeader, Prose } from "@/components/layout-primitives";
import { Mdx } from "@/components/mdx";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { assetIfExists } from "@/lib/assets";
import { getInsight, getInsights, localesForSlug, slugsForLocale } from "@/lib/content";
import { buildAlternatesFor, buildOpenGraph } from "@/lib/seo";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    slugsForLocale("insights", locale).map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const item = getInsight(locale, slug);
  if (!item) return {};
  const path = `/insights/${slug}`;
  return {
    title: item.frontmatter.title,
    description: item.frontmatter.description,
    alternates: buildAlternatesFor(
      locale,
      path,
      localesForSlug("insights", slug, routing.locales),
    ),
    ...buildOpenGraph({
      locale,
      path,
      type: "article",
      title: item.frontmatter.title,
      description: item.frontmatter.description,
      image: assetIfExists(`/img/insights/${slug}.webp`),
      publishedTime: item.frontmatter.date,
      modifiedTime: item.frontmatter.updated ?? item.frontmatter.date,
    }),
  };
}

export default async function InsightPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const item = getInsight(locale, slug);
  if (!item) notFound();

  const t = await getTranslations("common");
  const tn = await getTranslations("nav");
  const { frontmatter: fm } = item;
  const more = getInsights(locale)
    .filter((i) => i.slug !== slug)
    .slice(0, 2);

  return (
    <>
      <ArticleJsonLd
        locale={locale}
        title={fm.title}
        description={fm.description}
        path={`/insights/${slug}`}
        datePublished={fm.date}
        dateModified={fm.updated}
        image={assetIfExists(`/img/insights/${slug}.webp`)}
      />
      <BreadcrumbJsonLd
        locale={locale}
        items={[
          { name: "ArchXS", path: "" },
          { name: tn("insights"), path: "/insights" },
          { name: fm.title, path: `/insights/${slug}` },
        ]}
      />

      <PageHeader
        kicker={`${fm.topic} · ${fm.readingMinutes} ${t("minutes")}`}
        title={fm.title}
        lead={fm.description}
        meta={
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
            {t("published")} {fm.date}
            {fm.updated && ` · ${t("updated")} ${fm.updated}`}
          </p>
        }
      />

      <Container className="py-16 sm:py-20">
        {/* Sidebar first in DOM and in the grid: a fixed 16rem rail on the
            left, the article in the wide flexible track on the right. */}
        <div className="grid gap-14 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-20">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            {fm.takeaways?.length > 0 && (
              <div className="border-t border-border pt-4">
                <p className="sheet-label">{t("takeaways")}</p>
                <ul className="mt-4 space-y-3.5">
                  {fm.takeaways.map((k) => (
                    <li
                      key={k}
                      className="relative pl-4 text-sm leading-relaxed text-muted-foreground before:absolute before:left-0 before:top-[0.65em] before:h-px before:w-2.5 before:bg-redline/70"
                    >
                      {k}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          <article className="min-w-0">
            <Prose>
              <Mdx source={item.body} />
            </Prose>
          </article>
        </div>

        {more.length > 0 && (
          <nav className="mt-20 border-t border-border pt-8">
            <p className="sheet-label">{tn("insights")}</p>
            <ul className="mt-5 grid gap-6 sm:grid-cols-2">
              {more.map((m) => (
                <li key={m.slug}>
                  <Link href={`/insights/${m.slug}`} className="group block">
                    <p className="sheet-label">{m.frontmatter.topic}</p>
                    <p className="mt-1.5 leading-snug">
                      <span className="redline-mark">{m.frontmatter.title}</span>
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <p className="mt-12">
          <Link
            href="/insights"
            className="redline-mark font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted-foreground"
          >
            ← {t("backTo")} {tn("insights").toLowerCase()}
          </Link>
        </p>
      </Container>
    </>
  );
}
