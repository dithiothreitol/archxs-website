import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { BlueprintFigure } from "@/components/blueprint-figure";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Container, PageHeader, Prose } from "@/components/layout-primitives";
import { Mdx } from "@/components/mdx";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { assetIfExists } from "@/lib/assets";
import { getWorkItem, localesForSlug, slugsForLocale } from "@/lib/content";
import { buildAlternatesFor, buildOpenGraph } from "@/lib/seo";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    slugsForLocale("work", locale).map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const item = getWorkItem(locale, slug);
  if (!item) return {};
  const path = `/work/${slug}`;
  const image = assetIfExists(`/img/work/${slug}.webp`);
  return {
    title: item.frontmatter.title,
    description: item.frontmatter.summary,
    alternates: buildAlternatesFor(
      locale,
      path,
      localesForSlug("work", slug, routing.locales),
    ),
    ...buildOpenGraph({
      locale,
      path,
      title: item.frontmatter.title,
      description: item.frontmatter.summary,
      image,
    }),
  };
}

export default async function WorkItemPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const item = getWorkItem(locale, slug);
  if (!item) notFound();

  const t = await getTranslations("common");
  const tn = await getTranslations("nav");
  const { frontmatter: fm } = item;

  return (
    <>
      <BreadcrumbJsonLd
        locale={locale}
        items={[
          { name: "ArchXS", path: "" },
          { name: tn("work"), path: "/work" },
          { name: fm.title, path: `/work/${slug}` },
        ]}
      />

      <PageHeader
        kicker={`${tn("work")} · ${fm.sector}`}
        title={fm.title}
        lead={fm.summary}
        meta={
          fm.metrics?.length ? (
            <dl className="grid gap-6 sm:grid-cols-3 lg:max-w-3xl">
              {fm.metrics.map((m) => (
                <div key={m.label} className="border-t border-border pt-3">
                  <dd className="font-mono text-sm">{m.value}</dd>
                  <dt className="mt-1 text-xs leading-snug text-muted-foreground">
                    {m.label}
                  </dt>
                </div>
              ))}
            </dl>
          ) : null
        }
      />

      <Container className="py-16 sm:py-20">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-20">
          <article className="min-w-0">
            <BlueprintFigure
              src={assetIfExists(`/img/work/${slug}.webp`)}
              alt={fm.title}
              figureNo={`${t("figure")} 01`}
              caption={fm.sector}
              aspect="aspect-[16/9]"
              sizes="(max-width: 1024px) 100vw, 680px"
              className="mb-12"
            />
            <Prose>
              <Mdx source={item.body} />
            </Prose>
          </article>

          <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
            {fm.period && (
              <div>
                <p className="sheet-label">{t("period")}</p>
                <p className="mt-2 font-mono text-sm">{fm.period}</p>
              </div>
            )}
            {fm.capabilities?.length > 0 && (
              <div>
                <p className="sheet-label">{t("capabilities")}</p>
                <ul className="mt-2 space-y-1.5">
                  {fm.capabilities.map((c) => (
                    <li key={c} className="text-sm text-muted-foreground">
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {fm.stack?.length > 0 && (
              <div>
                <p className="sheet-label">{t("stack")}</p>
                <ul className="mt-2 space-y-1.5">
                  {fm.stack.map((s) => (
                    <li
                      key={s}
                      className="font-mono text-[0.8125rem] text-muted-foreground"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {fm.disclosure === "anonymised" && (
              <p className="border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground/80">
                {t("anonymisedNote")}
              </p>
            )}
          </aside>
        </div>

        <p className="mt-16 border-t border-border pt-8">
          <Link
            href="/work"
            className="redline-mark font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted-foreground"
          >
            ← {t("backTo")} {tn("work").toLowerCase()}
          </Link>
        </p>
      </Container>
    </>
  );
}
