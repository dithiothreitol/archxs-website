import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LegalPage } from "@/components/legal-page";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.terms" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates(locale, "/terms"),
    ...buildOpenGraph({
      locale,
      path: "/terms",
      title: t("title"),
      description: t("description"),
    }),
  };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalPage locale={locale} namespace="pages.terms" />;
}
