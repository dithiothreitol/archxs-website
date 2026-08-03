import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { BlueprintFigure } from "@/components/blueprint-figure";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Container, PageHeader } from "@/components/layout-primitives";
import { Reveal } from "@/components/reveal";
import { Link } from "@/i18n/navigation";
import { assetIfExists } from "@/lib/assets";
import { getWork } from "@/lib/content";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.work" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates(locale, "/work"),
    ...buildOpenGraph({
      locale,
      path: "/work",
      title: t("title"),
      description: t("description"),
    }),
  };
}

export default async function WorkPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("pages.work");
  const tc = await getTranslations("common");
  const tn = await getTranslations("nav");
  const items = getWork(locale);

  return (
    <>
      <BreadcrumbJsonLd
        locale={locale}
        items={[
          { name: "ArchXS", path: "" },
          { name: tn("work"), path: "/work" },
        ]}
      />
      <PageHeader kicker={t("kicker")} title={t("title")} lead={t("lead")} />

      <Container className="py-16 sm:py-20">
        <ul className="grid gap-14 sm:grid-cols-2 sm:gap-x-10 lg:gap-x-14">
          {items.map((item, i) => (
            <Reveal as="li" key={item.slug} delay={i * 50}>
              <Link href={`/work/${item.slug}`} className="group block">
                <BlueprintFigure
                  src={assetIfExists(`/img/work/${item.slug}.webp`)}
                  alt={item.frontmatter.title}
                  aspect="aspect-[16/10]"
                  sizes="(max-width: 640px) 100vw, 520px"
                />
                <div className="mt-5 flex flex-wrap items-baseline gap-x-4">
                  <p className="sheet-label">{item.frontmatter.sector}</p>
                  {item.frontmatter.period && (
                    <p className="sheet-label">{item.frontmatter.period}</p>
                  )}
                </div>
                <h2 className="mt-2.5 text-xl leading-snug">
                  <span className="redline-mark">{item.frontmatter.title}</span>
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.frontmatter.summary}
                </p>
                <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3">
                  {item.frontmatter.metrics?.slice(0, 2).map((m) => (
                    <div key={m.label} className="border-t border-border pt-2.5">
                      <dt className="text-[0.6875rem] leading-snug text-muted-foreground">
                        {m.label}
                      </dt>
                      <dd className="mt-0.5 font-mono text-sm">{m.value}</dd>
                    </div>
                  ))}
                </dl>
                {item.frontmatter.disclosure === "anonymised" && (
                  <p className="mt-4 font-mono text-[0.625rem] uppercase leading-relaxed tracking-[0.12em] text-muted-foreground/70">
                    {tc("anonymisedNote")}
                  </p>
                )}
              </Link>
            </Reveal>
          ))}
        </ul>
      </Container>
    </>
  );
}
