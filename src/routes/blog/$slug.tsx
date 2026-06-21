import { createFileRoute } from "@tanstack/react-router";
import { BlogPostContent } from "@/components/blog/BlogPostContent";
import { getBlogPostBySlug, getBlogPostUrl } from "@/lib/blog";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { HomeScreen } from "@/src/features/home/HomeScreen";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => {
    const post = getBlogPostBySlug(params.slug);

    if (!post) {
      return {
        meta: [{ title: `Post not found | ${SITE_NAME}` }],
      };
    }

    const url = getBlogPostUrl(post.slug);
    return {
      meta: [
        { title: post.title },
        { name: "description", content: post.description },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.description },
        { property: "og:url", content: url },
        { property: "og:site_name", content: SITE_NAME },
        { property: "og:type", content: "article" },
        { property: "article:published_time", content: post.publishedAt },
        { property: "article:modified_time", content: post.updatedAt },
        { name: "keywords", content: post.tags.join(", ") },
      ],
      links: [{ rel: "canonical", href: `/blog/${post.slug}` }],
    };
  },
  component: BlogPostRoute,
});

/** Renders a shareable blog URL while opening the post inside the desktop UI. */
function BlogPostRoute() {
  const { slug } = Route.useParams();
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return <HomeScreen initialApp="blog" />;
  }

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
      url: SITE_URL,
    },
    mainEntityOfPage: getBlogPostUrl(post.slug),
    keywords: post.tags.join(", "),
  };

  return (
    <>
      <article className="sr-only">
        <header>
          <p>
            <time dateTime={post.publishedAt}>{post.publishedAt}</time>
            {" / "}
            {post.readingTime}
          </p>
          <h1>{post.title}</h1>
          <p>{post.description}</p>
        </header>
        <BlogPostContent post={post} />
      </article>
      <HomeScreen initialApp="blog" initialBlogSlug={post.slug} />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialized from typed local blog data.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}
