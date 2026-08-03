import { compileMDX } from "next-mdx-remote/rsc";

/**
 * Compiles a raw MDX body at build time. Frontmatter is parsed separately in
 * lib/content, so it is stripped from the source before it gets here.
 */
export async function Mdx({ source }: { source: string }) {
  const { content } = await compileMDX({
    source,
    options: { parseFrontmatter: false },
  });
  return content;
}
