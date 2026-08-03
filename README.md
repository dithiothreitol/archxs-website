# archxs.com

Site of the ArchXS advisory and engineering practice. Static, bilingual (PL/EN),
deployed to GitHub Pages.

The intent behind the content and design decisions is written down in
[PLAN_IMPLEMENTACJI.md](PLAN_IMPLEMENTACJI.md) — read that before changing copy,
tone or structure. Two rules from it are load-bearing:

- **The site does not sell.** No packages, no price list, no training, no
  newsletter, no pop-ups. Conversion is meant to happen because the reader is
  persuaded by the reasoning, not pushed by a call to action.
- **Minimal personal exposure.** The voice is the practice ("we"), not a person.
  The founder's name appears only in the footer, in structured data, and as
  article authorship — never as biography or marketing.

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Styling | Tailwind CSS v4, shadcn/ui (new-york), framer-motion |
| i18n | next-intl — `pl` (default) and `en` |
| Content | MDX in `src/content/{insights,work}/{locale}/`, read at build time |
| Output | Static export → GitHub Pages |
| Illustrations | Gemini image models, post-processed with sharp |

## Development

```bash
npm install
npm run dev            # http://localhost:3000
npm run build          # server build (checks types)
npm run build:static   # static export into out/ + post-processing
npm run lint
```

Copy `.env.example` to `.env.local` if you need the contact form, search-console
verification or the image pipeline. Everything builds without them.

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the static
export and publishes it.

**One-time repository setting:** Settings → Pages → Source → **GitHub Actions**.
Until that is switched, Pages keeps serving the old branch content.

Optional repository secrets: `WEB3FORMS_KEY`, `GOOGLE_SITE_VERIFICATION`,
`BING_SITE_VERIFICATION`.

### Things that must not move

- `CNAME` — copied into `out/` during post-processing, so the custom domain
  survives a deploy.

## Content

Essays and case studies are MDX with frontmatter typed in `src/lib/content.ts`.
Slugs are shared across locales; a file that exists in one locale and not the
other is handled correctly — it simply does not appear in the other locale's
listing, sitemap or hreflang cluster.

Site copy (navigation, home page, practice areas, legal pages) lives in
`messages/{locale}/*.json`, split by concern so edits stay reviewable.

Adding a practice area means adding a slug to `src/lib/routes.ts` and the
matching block to both `messages/*/practice.json` files.

## Illustrations

```bash
npx tsx scripts/compose-brand-assets.ts                # OG card + icons (sharp, deterministic)
npx tsx scripts/generate-archxs-images.ts              # Gemini, only missing files
npx tsx scripts/generate-archxs-images.ts --prompts    # write prompts, call nothing
npm run convert-webp -- --delete                       # PNG masters → .webp, drop the PNGs
```

Only `.webp` is committed; PNG masters are gitignored. The exception is
`public/img/og/og-default.png`, which stays PNG because social crawlers handle
WebP previews inconsistently.

The visual identity of the artwork lives in one constant, `ARCHXS_STYLE_GUIDE`,
appended to every prompt. Text is never generated into artwork — the wordmark and
the OG card are composed with sharp, because image models still misspell.

Missing illustrations are safe: `assetIfExists()` checks the file at build time,
so a figure that has not been generated renders as an empty drafting frame
instead of a broken image.

## SEO / AI search

- Self-referencing canonicals plus a full hreflang cluster, derived from the same
  flag as the routing so the canonical always matches the URL actually served.
- JSON-LD: `ProfessionalService`, `Person` (founder), `Service`, `Article`,
  `FAQPage`, `BreadcrumbList`.
- `robots.ts` explicitly allows AI crawlers; `public/llms.txt` summarises the
  site for language models. Both are deliberate: being quotable is a
  distribution channel.
- The FAQ JSON-LD must stay in sync with the rendered accordion — structured data
  is only valid while the questions are visible on the page.

## Contact

contact@archxs.com
