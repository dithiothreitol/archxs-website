import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * Build-time content loader. Essays and case studies live as MDX in
 * src/content/{insights,work}/{locale}/*.mdx — versioned with the code,
 * readable by both humans and coding agents, no CMS to keep alive.
 */

export type InsightFrontmatter = {
  title: string;
  description: string;
  /** 2–4 scannable takeaways rendered above the fold and used by AI answers. */
  takeaways: string[];
  date: string;
  updated?: string;
  /** Editorial grouping, shown as a mono kicker. */
  topic: string;
  readingMinutes: number;
  image?: string;
  draft?: boolean;
};

export type WorkFrontmatter = {
  title: string;
  /** One-line framing of the client problem, not of our role. */
  summary: string;
  /** Sector instead of client name where the engagement is not public. */
  sector: string;
  period: string;
  /** Whether the client may be named — drives the "anonymised" note. */
  disclosure: "public" | "anonymised";
  /** 2–4 hard numbers. Kept in text (not images) so AI engines can cite them. */
  metrics: { label: string; value: string }[];
  capabilities: string[];
  stack: string[];
  order: number;
  image?: string;
  draft?: boolean;
};

export type ContentItem<T> = {
  slug: string;
  locale: string;
  frontmatter: T;
  body: string;
};

const CONTENT_ROOT = path.join(process.cwd(), "src", "content");

function readCollection<T>(collection: string, locale: string): ContentItem<T>[] {
  const dir = path.join(CONTENT_ROOT, collection, locale);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const { data, content } = matter(raw);
      return {
        slug: file.replace(/\.mdx$/, ""),
        locale,
        frontmatter: data as T,
        body: content,
      };
    })
    .filter((item) => !(item.frontmatter as { draft?: boolean }).draft);
}

export function getInsights(locale: string): ContentItem<InsightFrontmatter>[] {
  return readCollection<InsightFrontmatter>("insights", locale).sort((a, b) =>
    b.frontmatter.date.localeCompare(a.frontmatter.date),
  );
}

export function getWork(locale: string): ContentItem<WorkFrontmatter>[] {
  return readCollection<WorkFrontmatter>("work", locale).sort(
    (a, b) => (a.frontmatter.order ?? 99) - (b.frontmatter.order ?? 99),
  );
}

export function getInsight(locale: string, slug: string) {
  return getInsights(locale).find((i) => i.slug === slug) ?? null;
}

export function getWorkItem(locale: string, slug: string) {
  return getWork(locale).find((i) => i.slug === slug) ?? null;
}

/**
 * Slugs that actually exist for this locale. Routes are generated per locale,
 * never from the union: a translation that has not been written yet must not
 * produce an empty page (and must not appear in the sitemap or hreflang set).
 */
export function slugsForLocale(
  collection: "insights" | "work",
  locale: string,
): string[] {
  const dir = path.join(CONTENT_ROOT, collection, locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""))
    .filter((slug) => {
      const raw = fs.readFileSync(path.join(dir, `${slug}.mdx`), "utf8");
      return !matter(raw).data.draft;
    });
}

/** Locales in which a given item exists — drives per-item hreflang. */
export function localesForSlug(
  collection: "insights" | "work",
  slug: string,
  locales: readonly string[],
): string[] {
  return locales.filter((l) =>
    fs.existsSync(path.join(CONTENT_ROOT, collection, l, `${slug}.mdx`)),
  );
}
