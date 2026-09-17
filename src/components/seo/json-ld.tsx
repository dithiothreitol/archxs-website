import { SITE_CONFIG } from "@/lib/constants";
import { localeUrl } from "@/lib/seo";

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Build-time constant, no user input — safe to inline.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const KNOWS_ABOUT = [
  "Enterprise architecture",
  "Architecture on demand",
  "Architecture as a service",
  "IT strategy",
  "IT governance",
  "Business process automation",
  "Applied artificial intelligence",
  "Large language models",
  "Cybersecurity architecture",
  "Identity and access management",
  "Regulatory compliance",
  "Software architecture",
  "Custom software development",
  "Systems integration",
];

/**
 * Organization-level graph, injected once per page in the root layout.
 * ProfessionalService (not just Organization) because the entity being
 * described is an advisory practice with a service area.
 */
export function OrganizationJsonLd({ locale }: { locale: string }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        "@id": `${SITE_CONFIG.url}/#practice`,
        name: SITE_CONFIG.name,
        url: localeUrl(locale),
        email: SITE_CONFIG.email,
        description:
          locale === "pl"
            ? "Zwinna praktyka doradczo-inżynierska pracująca metodą architektury na żądanie: architektura korporacyjna, procesy biznesowe, cyberbezpieczeństwo, applied AI i wytwarzanie oprogramowania, weryfikowane własnym kodem produkcyjnym."
            : "A boutique advisory and engineering practice built on an architecture-on-demand method: enterprise architecture, business processes, cybersecurity, applied AI and software delivery, validated with my own production code.",
        knowsAbout: KNOWS_ABOUT,
        knowsLanguage: ["pl", "en"],
        areaServed: [
          { "@type": "Country", name: "Poland" },
          { "@type": "Place", name: "European Union" },
        ],
        founder: { "@id": `${SITE_CONFIG.url}/#founder` },
        sameAs: [SITE_CONFIG.linkedin, SITE_CONFIG.github],
      }}
    />
  );
}

/**
 * Minimal Person node. Kept in the data layer, not the visual layer: the site
 * is deliberately about the practice, but search and AI engines weight
 * attributable expertise (E-E-A-T), so the founder must be resolvable.
 */
export function FounderJsonLd({ locale }: { locale: "pl" | "en" }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": `${SITE_CONFIG.url}/#founder`,
        name: SITE_CONFIG.founder,
        jobTitle: SITE_CONFIG.founderRole[locale],
        worksFor: { "@id": `${SITE_CONFIG.url}/#practice` },
        knowsAbout: KNOWS_ABOUT,
        hasCredential: SITE_CONFIG.credentials.map((c) => ({
          "@type": "EducationalOccupationalCredential",
          name: c,
        })),
        sameAs: [SITE_CONFIG.linkedin, SITE_CONFIG.github],
      }}
    />
  );
}

export function ServiceJsonLd({
  locale,
  name,
  description,
  path,
}: {
  locale: string;
  name: string;
  description: string;
  path: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Service",
        name,
        description,
        url: localeUrl(locale, path),
        provider: { "@id": `${SITE_CONFIG.url}/#practice` },
        areaServed: [
          { "@type": "Country", name: "Poland" },
          { "@type": "Place", name: "European Union" },
        ],
      }}
    />
  );
}

export function ArticleJsonLd({
  locale,
  title,
  description,
  path,
  datePublished,
  dateModified,
  image,
}: {
  locale: string;
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        url: localeUrl(locale, path),
        mainEntityOfPage: { "@type": "WebPage", "@id": localeUrl(locale, path) },
        datePublished,
        dateModified: dateModified ?? datePublished,
        inLanguage: locale,
        author: { "@id": `${SITE_CONFIG.url}/#founder` },
        publisher: { "@id": `${SITE_CONFIG.url}/#practice` },
        ...(image && { image: [`${SITE_CONFIG.url}${image}`] }),
      }}
    />
  );
}

/**
 * FAQPage — MUST stay in sync with the rendered accordion. Google (and the
 * AI engines reading the same markup) only honour FAQ structured data whose
 * questions and answers are visible on the page.
 */
export function FaqJsonLd({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((i) => ({
          "@type": "Question",
          name: i.question,
          acceptedAnswer: { "@type": "Answer", text: i.answer },
        })),
      }}
    />
  );
}

export function BreadcrumbJsonLd({
  locale,
  items,
}: {
  locale: string;
  items: { name: string; path: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: localeUrl(locale, item.path),
        })),
      }}
    />
  );
}
