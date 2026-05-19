import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeExperience } from "@/components/HomeExperience";
import { getBlogPostBySlug, getBlogPosts, getBlogPostUrl } from "@/lib/blog";
import { SITE_NAME } from "@/lib/site";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: `Post not found | ${SITE_NAME}`,
    };
  }

  const url = getBlogPostUrl(post.slug);

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      siteName: SITE_NAME,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) notFound();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: "Robin",
      url: "https://robin.build",
    },
    mainEntityOfPage: getBlogPostUrl(post.slug),
    keywords: post.tags.join(", "),
  };

  return (
    <>
      <HomeExperience initialApp="blog" initialBlogSlug={post.slug} />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialized from typed local blog data.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}
