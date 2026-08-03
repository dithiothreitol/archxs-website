import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// One flag drives output mode, routing prefixes and canonical/hreflang shape.
// See src/lib/seo.ts for why they must stay derived from the same source.
const isStaticExport = process.env.STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  ...(isStaticExport
    ? {
        output: "export",
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {
        // Every route is locale-prefixed, so "/" has no page of its own.
        // In the export it is a generated index.html (post-static-build.ts);
        // here it is a redirect, because middleware is not an option —
        // `output: export` rejects it, and dev must resolve URLs the same way.
        async redirects() {
          return [{ source: "/", destination: "/pl", permanent: false }];
        },
      }),
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
