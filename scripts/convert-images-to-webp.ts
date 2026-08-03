/**
 * Converts generated PNG masters to WebP and keeps only the WebP in git.
 *
 *   npx tsx scripts/convert-images-to-webp.ts            # convert, keep PNGs locally
 *   npx tsx scripts/convert-images-to-webp.ts --delete   # convert and remove PNGs
 *   npx tsx scripts/convert-images-to-webp.ts --dry-run
 *
 * This step is not cosmetic. Generated illustrations come back as multi-megabyte
 * PNGs; shipping them unconverted is the single easiest way to lose the Core Web
 * Vitals budget on the largest element of the page.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(process.cwd(), "public", "img");
const QUALITY = 82;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const deletePng = args.includes("--delete");

// OpenGraph cards stay PNG: several social crawlers still render WebP
// previews inconsistently, and a card that fails to render costs more than
// the bytes it saves.
const SKIP_DIRS = new Set(["og"]);

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return SKIP_DIRS.has(entry.name) ? [] : walk(full);
    }
    return /\.(png|jpe?g|tiff?)$/i.test(entry.name) ? [full] : [];
  });
}

async function main() {
  const files = walk(ROOT);
  if (files.length === 0) {
    console.log("public/img: nothing to convert.");
    return;
  }

  let before = 0;
  let after = 0;
  let converted = 0;

  for (const file of files) {
    const target = file.replace(/\.(png|jpe?g|tiff?)$/i, ".webp");
    const sourceSize = fs.statSync(file).size;

    if (fs.existsSync(target) && fs.statSync(target).mtimeMs >= fs.statSync(file).mtimeMs) {
      console.log(`skip  ${path.relative(ROOT, target)} (up to date)`);
      continue;
    }
    if (dryRun) {
      console.log(`would convert ${path.relative(ROOT, file)}`);
      continue;
    }

    await sharp(file).webp({ quality: QUALITY, effort: 6 }).toFile(target);
    const targetSize = fs.statSync(target).size;
    before += sourceSize;
    after += targetSize;
    converted++;
    console.log(
      `ok    ${path.relative(ROOT, target)}  ${Math.round(sourceSize / 1024)} KB → ${Math.round(targetSize / 1024)} KB`,
    );

    if (deletePng) fs.unlinkSync(file);
  }

  if (converted > 0) {
    console.log(
      `\n${converted} converted: ${Math.round(before / 1024)} KB → ${Math.round(after / 1024)} KB` +
        ` (${Math.round((1 - after / before) * 100)}% smaller)`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
