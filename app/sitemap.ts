import type { MetadataRoute } from "next";
import { getBlogPosts, getBlogPostUrl } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getBlogPosts();
  const latestBlogUpdate = posts.reduce<Date | null>((latest, post) => {
    const updated = new Date(post.updatedAt);
    return !latest || updated > latest ? updated : latest;
  }, null);
  const staticLastModified = latestBlogUpdate ?? new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: staticLastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: staticLastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: getBlogPostUrl(post.slug),
    lastModified: new Date(post.updatedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...blogRoutes];
}
