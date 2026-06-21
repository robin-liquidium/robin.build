import { createFileRoute, Navigate } from "@tanstack/react-router";
import { getBlogPosts } from "@/lib/blog";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import { HomeScreen } from "@/src/features/home/HomeScreen";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: `Blog | ${SITE_NAME}` },
      { name: "description", content: SITE_DESCRIPTION },
      { property: "og:title", content: `Blog | ${SITE_NAME}` },
      { property: "og:description", content: SITE_DESCRIPTION },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogIndexRoute,
});

/** Opens the first blog post through the desktop blog surface. */
function BlogIndexRoute() {
  const firstPost = getBlogPosts()[0];

  if (!firstPost) {
    return <HomeScreen initialApp="blog" />;
  }

  return <Navigate to="/blog/$slug" params={{ slug: firstPost.slug }} />;
}
