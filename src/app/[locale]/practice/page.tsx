import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Container, PageHeader } from "@/components/layout-primitives";
import { Reveal } from "@/components/reveal";
import { Link } from "@/i18n/navigation";
import { PRACTICE_SLUGS } from "@/lib/routes";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.practice" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates(locale, "/practice"),
    ...buildOpenGraph({
      locale,
      path: "/practice",
      title: t("title"),
      description: t("description"),
    }),
  };
}

export default async function PracticePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("practice");
  const tn = await getTranslations("nav");

  return (
    <>
      <BreadcrumbJsonLd
        locale={locale}
        items={[
          { name: "ArchXS", path: "" },
          { name: tn("practice"), path: "/practice" },
        ]}
      />
      <PageHeader
        kicker={tn("practice")}
        title={t("title")}
        lead={t("lead")}
      />

      <Container className="py-16 sm:py-20">
        <ul className="border-t border-border">
          {PRACTICE_SLUGS.map((slug, i) => (
            <Reveal as="li" key={slug} delay={i * 50}>
              <Link
                href={`/practice/${slug}`}
                className="group grid gap-x-10 gap-y-4 border-b border-border py-10 lg:grid-cols-[auto_1fr_1fr]"
              >
                <span className="font-mono text-xs text-redline">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="text-xl leading-snug sm:text-2xl">
                    <span className="redline-mark">
                      {t(`items.${slug}.short`)}
                    </span>
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                    {t(`items.${slug}.teaser`)}
                  </p>
                </div>
                <p className="self-center font-mono text-[0.6875rem] uppercase leading-relaxed tracking-[0.12em] text-muted-foreground/85">
                  {t(`items.${slug}.evidenceLine`)}
                </p>
              </Link>
            </Reveal>
          ))}
        </ul>
      </Container>
    </>
  );
}
