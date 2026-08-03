/**
 * Composes brand assets that must be pixel-exact: the OpenGraph card and the
 * favicon marks. These are built with sharp from vector primitives rather than
 * generated, because image models still render text unreliably — a wordmark
 * with a mangled letter is worse than no wordmark.
 *
 *   npx tsx scripts/compose-brand-assets.ts
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const PUBLIC = path.join(process.cwd(), "public");
const PAPER = "#F7F5F0";
const INK = "#1A1C1E";
const REDLINE = "#C8431F";
const MUTED = "#5D6266";

function ensureDir(file: string) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

/** Drafting grid + registration marks, shared by every branded surface. */
function frame(w: number, h: number): string {
  const step = 32;
  const lines: string[] = [];
  for (let x = step; x < w; x += step) {
    lines.push(
      `<line x1="${x}" y1="0" x2="${x}" y2="${h}" stroke="${INK}" stroke-opacity="0.045" stroke-width="1"/>`,
    );
  }
  for (let y = step; y < h; y += step) {
    lines.push(
      `<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="${INK}" stroke-opacity="0.045" stroke-width="1"/>`,
    );
  }
  const m = 40;
  const t = 22;
  const corners = [
    `M${m},${m + t} L${m},${m} L${m + t},${m}`,
    `M${w - m - t},${m} L${w - m},${m} L${w - m},${m + t}`,
    `M${m},${h - m - t} L${m},${h - m} L${m + t},${h - m}`,
    `M${w - m - t},${h - m} L${w - m},${h - m} L${w - m},${h - m - t}`,
  ]
    .map(
      (d) =>
        `<path d="${d}" fill="none" stroke="${REDLINE}" stroke-opacity="0.55" stroke-width="1.5"/>`,
    )
    .join("");
  return lines.join("") + corners;
}

async function ogCard() {
  const w = 1200;
  const h = 630;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" fill="${PAPER}"/>
  ${frame(w, h)}
  <text x="88" y="250" font-family="Georgia, 'Times New Roman', serif" font-size="96" fill="${INK}" letter-spacing="-2">ArchXS</text>
  <line x1="88" y1="292" x2="470" y2="292" stroke="${REDLINE}" stroke-width="2"/>
  <text x="88" y="356" font-family="Helvetica, Arial, sans-serif" font-size="30" fill="${INK}" fill-opacity="0.86">Architecture, AI and security</text>
  <text x="88" y="398" font-family="Helvetica, Arial, sans-serif" font-size="30" fill="${INK}" fill-opacity="0.86">tested in production.</text>
  <text x="88" y="512" font-family="'Courier New', monospace" font-size="20" fill="${MUTED}" letter-spacing="3">ADVISORY · ENGINEERING · ARCHXS.COM</text>
</svg>`;

  const out = path.join(PUBLIC, "img/og/og-default.png");
  ensureDir(out);
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(out);
  console.log(`ok  ${path.relative(PUBLIC, out)}`);
}

async function icons() {
  const size = 512;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="${PAPER}"/>
  <g stroke="${INK}" stroke-width="14" fill="none" stroke-linecap="square">
    <path d="M118,372 L256,140 L394,372"/>
    <line x1="176" y1="300" x2="336" y2="300"/>
  </g>
  <line x1="118" y1="412" x2="394" y2="412" stroke="${REDLINE}" stroke-width="14"/>
</svg>`;

  // App Router file conventions: src/app/icon.png and src/app/apple-icon.png
  // are picked up automatically and emitted with the right <link> tags, which
  // also stops browsers from probing /favicon.ico and getting a 404.
  const appDir = path.join(process.cwd(), "src", "app");
  await sharp(Buffer.from(svg))
    .resize(512, 512)
    .png({ compressionLevel: 9 })
    .toFile(path.join(appDir, "icon.png"));
  await sharp(Buffer.from(svg))
    .resize(180, 180)
    .png({ compressionLevel: 9 })
    .toFile(path.join(appDir, "apple-icon.png"));
  await sharp(Buffer.from(svg))
    .resize(32, 32)
    .png({ compressionLevel: 9 })
    .toFile(path.join(PUBLIC, "favicon.png"));
  fs.writeFileSync(path.join(PUBLIC, "icon.svg"), svg, "utf8");
  console.log("ok  src/app/icon.png, src/app/apple-icon.png, favicon.png, icon.svg");
}

async function main() {
  await ogCard();
  await icons();
  console.log("\nBrand assets composed. PNGs here are final — do not run them through the generator.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
