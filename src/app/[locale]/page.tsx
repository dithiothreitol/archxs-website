import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { BlueprintFigure } from "@/components/blueprint-figure";
import { FaqJsonLd } from "@/components/seo/json-ld";
import { Reveal } from "@/components/reveal";
import {
  Container,
  Metric,
  Section,
} from "@/components/layout-primitives";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "@/i18n/navigation";
import { assetIfExists } from "@/lib/assets";
import { getInsights, getWork } from "@/lib/content";
import { SHEET, SITE_CONFIG } from "@/lib/constants";
import { PRACTICE_SLUGS } from "@/lib/routes";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.site" });
  return {
    alternates: buildAlternates(locale),
    ...buildOpenGraph({
      locale,
      title: t("title"),
      description: t("description"),
    }),
  };
}

type Position = { claim: string; body: string; href: string };
type MethodItem = { title: string; body: string };
type ProofMetric = { value: string; label: string };
type OssItem = { name: string; desc: string };
type ProductItem = { name: string; desc: string; href: string };
type FaqItem = { q: string; a: string };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const tp = await getTranslations("practice.items");
  const tc = await getTranslations("common");

  const proof = t.raw("hero.proof") as ProofMetric[];
  const positions = t.raw("positions.items") as Position[];
  const methodItems = t.raw("method.items") as MethodItem[];
  const oss = t.raw("proof.oss") as OssItem[];
  const products = t.raw("proof.products") as ProductItem[];
  const faq = t.raw("faq.items") as FaqItem[];

  const work = getWork(locale).slice(0, 3);
  const insights = getInsights(locale).slice(0, 3);

  return (
    <>
      <FaqJsonLd items={faq.map((f) => ({ question: f.q, answer: f.a }))} />

      {/* ── A-01 Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="blueprint-grid blueprint-grid-fade absolute inset-0 -z-10" />
        <Container className="pb-16 pt-16 sm:pb-20 sm:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <p className="sheet-label">
                {SHEET.hero} · {t("hero.kicker")}
              </p>
              <h1 className="mt-6 text-[2.5rem] leading-[1.06] sm:text-[3.25rem] lg:text-[3.5rem]">
                {t("hero.title")}
              </h1>
              <p className="measure mt-7 text-lg leading-relaxed text-muted-foreground">
                {t("hero.lead")}
              </p>
            </div>

            <BlueprintFigure
              src={assetIfExists("/img/hero/hero-blueprint.webp")}
              alt={t("hero.figureCaption")}
              caption={t("hero.figureCaption")}
              figureNo={`${tc("figure")} 01`}
              priority
              aspect="aspect-[4/3]"
              sizes="(max-width: 1024px) 100vw, 560px"
            />
          </div>

          <dl className="mt-16 grid gap-8 sm:grid-cols-3">
            {proof.map((m) => (
              <div key={m.value}>
                <Metric label={m.label} value={m.value} />
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* ── A-02 Positions ────────────────────────────────────────────── */}
      <Section sheet={SHEET.positions} label={t("positions.label")}>
        <h2 className="measure text-3xl leading-tight sm:text-[2.125rem]">
          {t("positions.title")}
        </h2>
        <ol className="mt-12 space-y-px">
          {positions.map((p, i) => (
            <Reveal as="li" key={p.href} delay={i * 60}>
              <Link
                href={p.href}
                className="group grid gap-x-8 gap-y-3 border-t border-border py-8 sm:grid-cols-[auto_1fr] sm:py-9"
              >
                <span className="font-mono text-xs text-redline">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-xl leading-snug sm:text-[1.375rem]">
                    <span className="redline-mark">{p.claim}</span>
                  </h3>
                  <p className="measure mt-3 leading-relaxed text-muted-foreground">
                    {p.body}
                  </p>
                  <span className="mt-4 inline-block font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors group-hover:text-redline">
                    {t("positions.linkLabel")} →
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </ol>
      </Section>

      {/* ── A-03 Practice areas ───────────────────────────────────────── */}
      <Section sheet={SHEET.practice} label={t("practiceIntro.label")}>
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <h2 className="text-3xl leading-tight sm:text-[2.125rem]">
            {t("practiceIntro.title")}
          </h2>
          <p className="measure self-end leading-relaxed text-muted-foreground">
            {t("practiceIntro.lead")}
          </p>
        </div>

        <ul className="mt-14 grid gap-px border-t border-border sm:grid-cols-2 lg:grid-cols-3">
          {PRACTICE_SLUGS.map((slug, i) => (
            <Reveal as="li" key={slug} delay={i * 50}>
              <Link
                href={`/practice/${slug}`}
                className="group flex h-full flex-col border-b border-border py-8 pr-6 sm:min-h-[15rem]"
              >
                <span className="sheet-label">{`0${i + 1}`}</span>
                <h3 className="mt-4 text-lg leading-snug">
                  <span className="redline-mark">{tp(`${slug}.short`)}</span>
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {tp(`${slug}.teaser`)}
                </p>
                <p className="mt-auto pt-5 font-mono text-[0.625rem] uppercase leading-relaxed tracking-[0.12em] text-muted-foreground/80">
                  <span className="text-redline/80">
                    {t("practiceIntro.evidenceLabel")}:{" "}
                  </span>
                  {tp(`${slug}.evidenceLine`)}
                </p>
              </Link>
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* ── A-04 Method ───────────────────────────────────────────────── */}
      <Section sheet={SHEET.method} label={t("method.label")}>
        <h2 className="measure text-3xl leading-tight sm:text-[2.125rem]">
          {t("method.title")}
        </h2>
        <div className="mt-12 grid gap-x-14 gap-y-10 sm:grid-cols-2">
          {methodItems.map((m, i) => (
            <Reveal key={m.title} delay={i * 60}>
              <div className="dimension-line pt-5">
                <h3 className="text-base font-medium">{m.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {m.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-12">
          <Link
            href="/method"
            className="redline-mark font-mono text-[0.6875rem] uppercase tracking-[0.16em]"
          >
            {t("method.link")} →
          </Link>
        </p>
      </Section>

      {/* ── A-05 Selected work ────────────────────────────────────────── */}
      {work.length > 0 && (
        <Section sheet={SHEET.work} label={t("work.label")}>
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <h2 className="text-3xl leading-tight sm:text-[2.125rem]">
              {t("work.title")}
            </h2>
            <p className="measure self-end leading-relaxed text-muted-foreground">
              {t("work.lead")}
            </p>
          </div>

          <ul className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {work.map((item, i) => (
              <Reveal as="li" key={item.slug} delay={i * 60}>
                <Link href={`/work/${item.slug}`} className="group block">
                  <BlueprintFigure
                    src={assetIfExists(`/img/work/${item.slug}.webp`)}
                    alt={item.frontmatter.title}
                    aspect="aspect-[16/10]"
                    sizes="(max-width: 640px) 100vw, 380px"
                  />
                  <p className="sheet-label mt-5">{item.frontmatter.sector}</p>
                  <h3 className="mt-2 text-lg leading-snug">
                    <span className="redline-mark">
                      {item.frontmatter.title}
                    </span>
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.frontmatter.summary}
                  </p>
                </Link>
              </Reveal>
            ))}
          </ul>

          <p className="mt-12">
            <Link
              href="/work"
              className="redline-mark font-mono text-[0.6875rem] uppercase tracking-[0.16em]"
            >
              {t("work.link")} →
            </Link>
          </p>
        </Section>
      )}

      {/* ── A-06 Evidence ─────────────────────────────────────────────── */}
      <Section sheet={SHEET.proof} label={t("proof.label")}>
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <h2 className="text-3xl leading-tight sm:text-[2.125rem]">
            {t("proof.title")}
          </h2>
          <p className="measure self-end leading-relaxed text-muted-foreground">
            {t("proof.lead")}
          </p>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-3">
          <div>
            <p className="sheet-label">{t("proof.ossLabel")}</p>
            <ul className="mt-5 space-y-5">
              {oss.map((o) => (
                <li key={o.name} className="border-t border-border pt-4">
                  <p className="font-mono text-sm">{o.name}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {o.desc}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-5">
              <a
                href={SITE_CONFIG.github}
                target="_blank"
                rel="noopener noreferrer"
                className="redline-mark font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted-foreground"
              >
                {t("proof.ossLink")} →
              </a>
            </p>
          </div>

          <div>
            <p className="sheet-label">{t("proof.productsLabel")}</p>
            <ul className="mt-5 space-y-5">
              {products.map((p) => (
                <li key={p.name} className="border-t border-border pt-4">
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="redline-mark font-mono text-sm"
                  >
                    {p.name} ↗
                  </a>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {p.desc}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="sheet-label">{t("proof.credLabel")}</p>
            <ul className="mt-5 space-y-2.5">
              {SITE_CONFIG.credentials.map((c) => (
                <li
                  key={c}
                  className="border-t border-border pt-2.5 font-mono text-sm text-muted-foreground"
                >
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ── A-07 Writing ──────────────────────────────────────────────── */}
      {insights.length > 0 && (
        <Section sheet={SHEET.insights} label={t("insights.label")}>
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <h2 className="text-3xl leading-tight sm:text-[2.125rem]">
              {t("insights.title")}
            </h2>
            <p className="measure self-end leading-relaxed text-muted-foreground">
              {t("insights.lead")}
            </p>
          </div>

          <ul className="mt-12 border-t border-border">
            {insights.map((item, i) => (
              <Reveal as="li" key={item.slug} delay={i * 50}>
                <Link
                  href={`/insights/${item.slug}`}
                  className="group grid gap-x-8 gap-y-2 border-b border-border py-7 sm:grid-cols-[8rem_1fr]"
                >
                  <span className="sheet-label pt-1">
                    {item.frontmatter.topic}
                  </span>
                  <div>
                    <h3 className="text-lg leading-snug">
                      <span className="redline-mark">
                        {item.frontmatter.title}
                      </span>
                    </h3>
                    <p className="measure mt-2 text-sm leading-relaxed text-muted-foreground">
                      {item.frontmatter.description}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>

          <p className="mt-10">
            <Link
              href="/insights"
              className="redline-mark font-mono text-[0.6875rem] uppercase tracking-[0.16em]"
            >
              {t("insights.link")} →
            </Link>
          </p>
        </Section>
      )}

      {/* ── A-08 FAQ ──────────────────────────────────────────────────── */}
      <Section sheet={SHEET.faq} label={t("faq.label")}>
        <h2 className="measure text-3xl leading-tight sm:text-[2.125rem]">
          {t("faq.title")}
        </h2>
        <Accordion type="single" collapsible className="mt-10 max-w-3xl">
          {faq.map((item, i) => (
            <AccordionItem key={item.q} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-base leading-snug hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-[0.9375rem] leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      {/* ── A-09 Contact: an address stated as fact, nothing suggested ── */}
      <Section sheet={SHEET.contact} label={t("contact.label")}>
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <h2 className="font-mono text-2xl tracking-tight sm:text-3xl">
            <a
              href={`mailto:${SITE_CONFIG.email}`}
              className="redline-mark font-normal"
            >
              {t("contact.title")}
            </a>
          </h2>
          <p className="measure self-center leading-relaxed text-muted-foreground">
            {t("contact.body")}
          </p>
        </div>
      </Section>
    </>
  );
}
