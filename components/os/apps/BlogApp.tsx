"use client";

import { Check, Copy, Rss } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BlogPostContent } from "@/components/blog/BlogPostContent";
import { Button } from "@/components/ui/button";
import { getBlogPosts } from "@/lib/blog";
import { cn } from "@/lib/utils";

interface BlogAppProps {
  className?: string;
  initialSlug?: string;
}

const COPIED_STATE_DURATION_MS = 1600;

export default function BlogApp({ className, initialSlug }: BlogAppProps) {
  const pathname = usePathname();
  const router = useRouter();
  const copiedTimerRef = useRef<number | null>(null);
  const posts = useMemo(() => getBlogPosts(), []);
  const firstPostSlug = posts[0]?.slug ?? "";
  const validInitialSlug = posts.some((post) => post.slug === initialSlug)
    ? initialSlug
    : firstPostSlug;
  const [selectedSlug, setSelectedSlug] = useState(validInitialSlug ?? "");
  const [copied, setCopied] = useState(false);
  const selectedPost =
    posts.find((post) => post.slug === selectedSlug) ?? posts[0];

  useEffect(() => {
    const maybeSlug = pathname.match(/^\/blog\/([^/]+)$/)?.[1];
    if (maybeSlug && posts.some((post) => post.slug === maybeSlug)) {
      setSelectedSlug(maybeSlug);
      return;
    }

    if (!selectedPost) return;
    router.replace(`/blog/${selectedPost.slug}`);
  }, [pathname, posts, router, selectedPost]);

  const selectPost = useCallback(
    (slug: string) => {
      if (copiedTimerRef.current !== null) {
        window.clearTimeout(copiedTimerRef.current);
        copiedTimerRef.current = null;
      }
      setCopied(false);
      setSelectedSlug(slug);
      router.push(`/blog/${slug}`);
    },
    [router],
  );

  const copySelectedPostUrl = useCallback(async () => {
    if (!selectedPost) return;
    const postUrl = new URL(
      `/blog/${selectedPost.slug}`,
      window.location.origin,
    ).toString();

    try {
      await navigator.clipboard.writeText(postUrl);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = postUrl;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }

    setCopied(true);
    if (copiedTimerRef.current !== null) {
      window.clearTimeout(copiedTimerRef.current);
    }
    copiedTimerRef.current = window.setTimeout(() => {
      setCopied(false);
      copiedTimerRef.current = null;
    }, COPIED_STATE_DURATION_MS);
  }, [selectedPost]);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current !== null) {
        window.clearTimeout(copiedTimerRef.current);
      }
    };
  }, []);

  if (!selectedPost) {
    return (
      <div className={cn("grid min-h-0 flex-1 place-items-center", className)}>
        <p className="text-sm text-muted-foreground">No posts yet.</p>
      </div>
    );
  }

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col md:flex-row", className)}>
      <aside className="max-h-56 shrink-0 overflow-auto border-b border-border/80 p-3 md:max-h-none md:w-72 md:border-r md:border-b-0">
        <div className="mb-3 flex items-center gap-2 px-1 text-sm font-medium">
          <Rss className="h-4 w-4" />
          Blog
        </div>
        <div className="space-y-1">
          {posts.map((post) => (
            <button
              className={cn(
                "w-full rounded-md px-2 py-2 text-left transition-colors",
                post.slug === selectedPost.slug
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50",
              )}
              key={post.slug}
              onClick={() => selectPost(post.slug)}
              type="button"
            >
              <span className="block text-sm font-medium leading-5">
                {post.title}
              </span>
              <span className="mt-1 block font-mono text-[11px] text-muted-foreground">
                {post.publishedAt} / {post.readingTime}
              </span>
            </button>
          ))}
        </div>
      </aside>

      <article className="min-h-0 flex-1 overflow-auto p-4 sm:p-6">
        <header className="border-b border-border pb-5">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
            <time dateTime={selectedPost.publishedAt}>
              {selectedPost.publishedAt}
            </time>
            <span aria-hidden="true">/</span>
            <span>{selectedPost.readingTime}</span>
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-normal sm:text-3xl">
            {selectedPost.title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {selectedPost.description}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {selectedPost.tags.map((tag) => (
              <span
                className="rounded-md border border-border px-2 py-1 font-mono text-[11px] text-muted-foreground"
                key={tag}
              >
                {tag}
              </span>
            ))}
            <Button
              className="ml-auto gap-1.5"
              onClick={copySelectedPostUrl}
              size="sm"
              type="button"
              variant="outline"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied link" : "Copy link"}
            </Button>
          </div>
        </header>

        <div className="mt-5">
          <BlogPostContent post={selectedPost} />
        </div>
      </article>
    </div>
  );
}
