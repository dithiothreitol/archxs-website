import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { OrganizationJsonLd } from "@/components/seo/json-ld";
import { routing } from "@/i18n/routing";
import { SITE_CONFIG } from "@/lib/constants";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

import "./globals.css";

// Display: a workhorse serif. Serif headings + mono details is the single
// strongest signal that this page was not produced by a template.
const display = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const body = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  display: "swap",
});

const technical = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-technical",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "meta.site" });

  return {
    metadataBase: new URL(SITE_CONFIG.url),
    title: { default: t("title"), template: `%s | ${SITE_CONFIG.name}` },
    description: t("description"),
    keywords: t("keywords").split(", "),
    applicationName: SITE_CONFIG.name,
    authors: [{ name: SITE_CONFIG.founder, url: SITE_CONFIG.linkedin }],
    creator: SITE_CONFIG.founder,
    publisher: SITE_CONFIG.name,
    category: "technology consulting",
    alternates: buildAlternates(locale),
    ...buildOpenGraph({
      locale,
      title: t("title"),
      description: t("description"),
    }),
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && {
      verification: {
        google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION && {
          other: {
            "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
          },
        }),
      },
    }),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Applies the stored theme before first paint. Light is the default:
            the dark-by-default look is exactly what we are differentiating from. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("archxs-theme");var d=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark")}catch(e){}`,
          }}
        />
        <OrganizationJsonLd locale={locale} />
      </head>
      <body
        className={`${display.variable} ${body.variable} ${technical.variable}`}
      >
        <NextIntlClientProvider>
          <a
            href="#content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-foreground focus:px-4 focus:py-2 focus:text-primary-foreground"
          >
            {locale === "pl" ? "Przejdź do treści" : "Skip to content"}
          </a>
          <SiteHeader />
          <main id="content">{children}</main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
