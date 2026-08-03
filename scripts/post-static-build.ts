/**
 * Post-processing for the static export.
 *
 * Next emits /pl/ and /en/ but nothing at the root, and GitHub Pages needs two
 * extra files. This script writes:
 *   out/index.html  — a language-aware redirect with a full meta/hreflang head,
 *                     so the root URL is still a valid, indexable entry point
 *   out/.nojekyll   — stops Pages from dropping files that start with "_"
 *   out/CNAME       — keeps the custom domain bound to the deployment
 */
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "out");
const SITE = "https://archxs.com";
const DEFAULT_LOCALE = "pl";
const LOCALES = ["pl", "en"] as const;

const TITLE = "ArchXS — architecture, AI and security tested in production";
const DESCRIPTION =
  "A boutique advisory and engineering practice: enterprise architecture, process automation, cybersecurity and identity, applied AI and software delivery.";

function fail(message: string): never {
  console.error(`post-static-build: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(OUT)) fail("out/ not found — run the export build first");

const hreflang = LOCALES.map(
  (l) => `  <link rel="alternate" hreflang="${l}" href="${SITE}/${l}/">`,
).join("\n");

const rootHtml = `<!doctype html>
<html lang="${DEFAULT_LOCALE}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${TITLE}</title>
<meta name="description" content="${DESCRIPTION}">
<link rel="canonical" href="${SITE}/${DEFAULT_LOCALE}/">
${hreflang}
  <link rel="alternate" hreflang="x-default" href="${SITE}/en/">
<meta property="og:type" content="website">
<meta property="og:url" content="${SITE}/">
<meta property="og:site_name" content="ArchXS">
<meta property="og:title" content="${TITLE}">
<meta property="og:description" content="${DESCRIPTION}">
<meta name="twitter:card" content="summary_large_image">
<script>
(function () {
  try {
    var supported = ${JSON.stringify(LOCALES)};
    var preferred = (navigator.languages || [navigator.language || "${DEFAULT_LOCALE}"]);
    for (var i = 0; i < preferred.length; i++) {
      var tag = String(preferred[i]).toLowerCase().split("-")[0];
      if (supported.indexOf(tag) !== -1) {
        location.replace("/" + tag + "/");
        return;
      }
    }
  } catch (e) {}
  location.replace("/${DEFAULT_LOCALE}/");
})();
</script>
<noscript><meta http-equiv="refresh" content="0;url=/${DEFAULT_LOCALE}/"></noscript>
</head>
<body>
<p>ArchXS — <a href="/${DEFAULT_LOCALE}/">polski</a> · <a href="/en/">English</a></p>
</body>
</html>
`;

fs.writeFileSync(path.join(OUT, "index.html"), rootHtml, "utf8");
fs.writeFileSync(path.join(OUT, ".nojekyll"), "", "utf8");

// CNAME lives at the repo root (it predates this build); copy it into the
// artifact so the custom domain survives a deploy.
const cnameSrc = path.join(process.cwd(), "CNAME");
if (fs.existsSync(cnameSrc)) {
  fs.copyFileSync(cnameSrc, path.join(OUT, "CNAME"));
} else {
  console.warn("post-static-build: CNAME not found at repo root — skipping");
}

console.log("post-static-build: wrote index.html, .nojekyll, CNAME");
