import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getBlogPosts } from "@/lib/blog";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog",
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: `Blog | ${SITE_NAME}`,
    description: SITE_DESCRIPTION,
    url: `${SITE_URL}/blog`,
    siteName: SITE_NAME,
    type: "website",
  },
};

export default function BlogIndexPage() {
  const firstPost = getBlogPosts()[0];
  if (!firstPost) notFound();

  permanentRedirect(`/blog/${firstPost.slug}`);
}
