import { createFileRoute } from "@tanstack/react-router";
import { getBlogPosts, getBlogPostUrl } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

const XML_HEADERS = {
  "content-type": "application/xml; charset=utf-8",
} as const;

/** Formats a date string for sitemap lastmod values. */
function formatDate(dateValue: string | Date): string {
  return new Date(dateValue).toISOString().split("T")[0] ?? "";
}

/** Escapes XML text that is inserted into generated sitemap entries. */
function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

/** Builds the public sitemap XML from static pages and local blog metadata. */
function buildSitemapXml(): string {
  const posts = getBlogPosts();
  const latestBlogUpdate = posts.reduce<Date | null>((latest, post) => {
    const updated = new Date(post.updatedAt);
    return !latest || updated > latest ? updated : latest;
  }, null);
  const staticLastModified = formatDate(latestBlogUpdate ?? new Date());
  const entries = [
    {
      url: SITE_URL,
      lastmod: staticLastModified,
      changefreq: "monthly",
      priority: "1.0",
    },
    {
      url: `${SITE_URL}/blog`,
      lastmod: staticLastModified,
      changefreq: "weekly",
      priority: "0.8",
    },
    ...posts.map((post) => ({
      url: getBlogPostUrl(post.slug),
      lastmod: formatDate(post.updatedAt),
      changefreq: "monthly",
      priority: "0.7",
    })),
  ];

  const urls = entries
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <lastmod>${escapeXml(entry.lastmod)}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () =>
        new Response(buildSitemapXml(), { headers: XML_HEADERS }),
    },
  },
});
