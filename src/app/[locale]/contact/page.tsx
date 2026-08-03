import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ContactForm } from "@/components/contact-form";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Container, PageHeader } from "@/components/layout-primitives";
import { SITE_CONFIG } from "@/lib/constants";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.contact" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates(locale, "/contact"),
    ...buildOpenGraph({
      locale,
      path: "/contact",
      title: t("title"),
      description: t("description"),
    }),
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("pages.contact");
  const tn = await getTranslations("nav");

  return (
    <>
      <BreadcrumbJsonLd
        locale={locale}
        items={[
          { name: "ArchXS", path: "" },
          { name: tn("talk"), path: "/contact" },
        ]}
      />
      <PageHeader kicker={t("kicker")} title={t("title")} lead={t("lead")} />

      <Container className="py-16 sm:py-20">
        <div className="grid gap-14 lg:grid-cols-[1fr_20rem] lg:gap-20">
          <section>
            <p className="sheet-label">{t("formTitle")}</p>
            <div className="mt-6">
              <ContactForm />
            </div>
            <p className="mt-6 max-w-md text-xs leading-relaxed text-muted-foreground">
              {t("formNote")}
            </p>
          </section>

          <aside className="space-y-10">
            <div className="border-t border-border pt-4">
              <p className="sheet-label">{t("emailTitle")}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t("emailBody")}
              </p>
              <p className="mt-4">
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="redline-mark font-mono text-sm"
                >
                  {SITE_CONFIG.email}
                </a>
              </p>
            </div>

            {/* The calendar block renders only once a real booking URL is
                configured. A dead link on a site arguing for verification
                would undermine the argument. */}
            {SITE_CONFIG.bookingUrl && (
              <div className="border-t border-border pt-4">
                <p className="sheet-label">{t("bookTitle")}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {t("bookBody")}
                </p>
                <p className="mt-4">
                  <a
                    href={SITE_CONFIG.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="redline-mark font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted-foreground"
                  >
                    {t("book")} ↗
                  </a>
                </p>
              </div>
            )}
          </aside>
        </div>
      </Container>
    </>
  );
}
