import fs from "node:fs";
import path from "node:path";

/**
 * Returns the asset path only if the file is actually present in /public.
 * Generated illustrations arrive in batches; a page must never ship a broken
 * <img> because a figure has not been produced yet — the frame just stays empty.
 * Server-side only (build time).
 */
export function assetIfExists(publicPath: string): string | undefined {
  const rel = publicPath.replace(/^\//, "");
  return fs.existsSync(path.join(process.cwd(), "public", rel))
    ? publicPath
    : undefined;
}
