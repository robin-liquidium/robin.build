import { render, screen, within } from "@testing-library/react";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { BlogPostContent } from "@/components/blog/BlogPostContent";
import {
  BLOG_POSTS,
  type BlogPost,
  getBlogPostBySlug,
  getBlogPosts,
  getBlogPostUrl,
} from "@/lib/blog";
import {
  DESKTOP_README_CONTENT,
  DESKTOP_README_FILE_NAME,
  getShortcutIconSrc,
  PROJECT_WEB_SHORTCUTS,
} from "@/lib/desktop-shortcuts";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";
import { testRouterState } from "./setup";

type RouteHead = (input: { params: Record<string, string> }) => {
  links?: Array<Record<string, string>>;
  meta?: Array<Record<string, string>>;
};

type RouteWithComponent = {
  component: React.ComponentType;
  head?: RouteHead;
  headers?: () => Record<string, string>;
  server?: {
    handlers: {
      GET: () => Promise<Response>;
    };
  };
};

const SAMPLE_POST: BlogPost = {
  slug: "sample",
  title: "Sample Post",
  description: "A sample description.",
  publishedAt: "2026-01-01",
  updatedAt: "2026-01-02",
  readingTime: "1 min read",
  tags: ["test"],
  content: [
    { type: "heading", text: "Heading" },
    { type: "paragraph", text: "Paragraph" },
    { type: "list", items: ["One", "Two"] },
    { type: "code", language: "ts", code: "const value = 1;" },
    { type: "link", href: "https://example.com", label: "Example link" },
  ],
};

const FIRST_BLOG_POST = BLOG_POSTS[0];
if (!FIRST_BLOG_POST) {
  throw new Error("Expected at least one blog post fixture.");
}

/** Returns a required test fixture after making the assertion visible. */
function requireFixture<T>(value: T | undefined, label: string): T {
  expect(value).toBeDefined();
  if (value === undefined) {
    throw new Error(`Expected ${label}.`);
  }
  return value;
}

/** Casts mocked TanStack route objects to the tiny shape used in tests. */
function asTestRoute(route: object): RouteWithComponent {
  return route as RouteWithComponent;
}

/** Returns the mocked server route surface used by resource route tests. */
function requireRouteServer(route: RouteWithComponent) {
  expect(route.server).toBeDefined();
  if (!route.server) {
    throw new Error("Expected route server handlers.");
  }
  return route.server;
}

describe("site data", () => {
  it("exports the public site constants", () => {
    expect(SITE_URL).toBe("https://robin.build");
    expect(SITE_NAME).toBe("robin.build");
    expect(SITE_DESCRIPTION).toContain("Educational notes");
  });

  it("sorts, finds, and links blog posts", () => {
    const posts = getBlogPosts();

    expect(posts).toHaveLength(BLOG_POSTS.length);
    expect(posts[0]?.slug).toBe(BLOG_POSTS[0]?.slug);
    expect(getBlogPostBySlug(posts[0]?.slug ?? "")).toBe(BLOG_POSTS[0]);
    expect(getBlogPostBySlug("missing-post")).toBeUndefined();
    expect(getBlogPostUrl("hello")).toBe(`${SITE_URL}/blog/hello`);
  });

  it("sorts a temporarily expanded blog list by newest publish date", () => {
    const futurePost: BlogPost = {
      ...SAMPLE_POST,
      slug: "future-post",
      publishedAt: "2099-01-01",
      updatedAt: "2099-01-02",
    };

    BLOG_POSTS.push(futurePost);
    try {
      expect(getBlogPosts()[0]).toBe(futurePost);
    } finally {
      BLOG_POSTS.pop();
    }
  });

  it("defines project shortcuts and selects their icons", () => {
    const daylineShortcut = PROJECT_WEB_SHORTCUTS.find(
      (shortcut) => shortcut.id === "dayline",
    );
    const shortcutWithTheme = PROJECT_WEB_SHORTCUTS.find(
      (shortcut) => shortcut.id === "liquidium-fi",
    );
    const fallbackShortcut = PROJECT_WEB_SHORTCUTS.find(
      (shortcut) => shortcut.id === "runesswap",
    );

    const themedShortcut = requireFixture(shortcutWithTheme, "themed shortcut");
    const shortcutFallback = requireFixture(
      fallbackShortcut,
      "fallback shortcut",
    );
    expect(daylineShortcut).toMatchObject({
      host: "dayline.robin.build",
      href: "https://dayline.robin.build",
    });
    expect(getShortcutIconSrc(themedShortcut, true)).toContain("dark");
    expect(getShortcutIconSrc(themedShortcut, false)).toContain("light");
    expect(getShortcutIconSrc(shortcutFallback, true)).toBe(
      shortcutFallback.iconSrc,
    );
    expect(DESKTOP_README_FILE_NAME).toBe("README.md");
    expect(DESKTOP_README_CONTENT).toContain("Quick Start");
  });

  it("merges conditional class names with Tailwind conflict resolution", () => {
    expect(cn("px-2", false && "hidden", "px-4")).toBe("px-4");
  });
});

describe("blog content", () => {
  it("renders every blog block type", () => {
    render(<BlogPostContent post={SAMPLE_POST} />);

    expect(screen.getByRole("heading", { name: "Heading" })).toBeVisible();
    expect(screen.getByText("Paragraph")).toBeVisible();
    expect(screen.getByRole("list")).toBeVisible();
    expect(screen.getByText("One")).toBeVisible();
    expect(screen.getByText("const value = 1;")).toBeVisible();
    expect(screen.getByRole("link", { name: "Example link" })).toHaveAttribute(
      "href",
      "https://example.com",
    );
  });
});

describe("routes", () => {
  it("creates the root document and router", async () => {
    const rootModule = await import("@/src/routes/__root");
    const routerModule = await import("@/src/router");
    const route = asTestRoute(rootModule.Route);

    expect(route.head?.({ params: {} }).meta).toContainEqual({
      title: "robin.build",
    });
    expect(
      renderToStaticMarkup(React.createElement(route.component)),
    ).toContain('data-app="robin.build"');
    expect(typeof routerModule.getRouter).toBe("function");
    routerModule.getRouter();
  });

  it("serves robots.txt", async () => {
    const { Route } = await import("@/src/routes/robots[.]txt");
    const response = await requireRouteServer(
      asTestRoute(Route),
    ).handlers.GET();

    expect(response.headers.get("content-type")).toBe(
      "text/plain; charset=utf-8",
    );
    expect(await response.text()).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });

  it("serves sitemap.xml with static and blog URLs", async () => {
    const { Route } = await import("@/src/routes/sitemap[.]xml");
    const response = await requireRouteServer(
      asTestRoute(Route),
    ).handlers.GET();
    const xml = await response.text();

    expect(response.headers.get("content-type")).toBe(
      "application/xml; charset=utf-8",
    );
    expect(xml).toContain(`<loc>${SITE_URL}</loc>`);
    expect(xml).toContain(`<loc>${getBlogPostUrl(FIRST_BLOG_POST.slug)}</loc>`);
  });

  it("serves sitemap.xml when there are no blog posts", async () => {
    vi.resetModules();
    vi.doMock("@/lib/blog", () => ({
      getBlogPostUrl: (slug: string) => `${SITE_URL}/blog/${slug}`,
      getBlogPosts: () => [],
    }));

    const { Route } = await import("@/src/routes/sitemap[.]xml");
    const response = await requireRouteServer(
      asTestRoute(Route),
    ).handlers.GET();
    expect(await response.text()).toContain(`<loc>${SITE_URL}/blog</loc>`);

    vi.doUnmock("@/lib/blog");
    vi.resetModules();
  });

  it("renders the index route metadata and component", async () => {
    const { Route } = await import("@/src/routes/index");
    const route = asTestRoute(Route);

    expect(route.head?.({ params: {} }).meta).toContainEqual({
      title: "robin.build",
    });
    render(React.createElement(route.component));
    expect(screen.getByLabelText("robin.build")).toBeVisible();
  });

  it("redirects the blog index to the newest post", async () => {
    const { Route } = await import("@/src/routes/blog/index");
    const route = asTestRoute(Route);

    expect(route.head?.({ params: {} }).links).toContainEqual({
      rel: "canonical",
      href: "/blog",
    });
    render(React.createElement(route.component));

    const redirect = screen.getByTestId("navigate");
    expect(redirect).toHaveAttribute("data-to", "/blog/$slug");
    expect(redirect).toHaveAttribute(
      "data-params",
      JSON.stringify({ slug: FIRST_BLOG_POST.slug }),
    );
  });

  it("renders the blog index desktop when there are no posts", async () => {
    vi.resetModules();
    vi.doMock("@/lib/blog", () => ({
      getBlogPosts: () => [],
    }));

    const { Route } = await import("@/src/routes/blog/index");
    const route = asTestRoute(Route);
    render(React.createElement(route.component));
    expect(screen.getByLabelText("robin.build")).toBeVisible();

    vi.doUnmock("@/lib/blog");
    vi.resetModules();
  });

  it("builds blog post metadata for known and missing slugs", async () => {
    const { Route } = await import("@/src/routes/blog/$slug");
    const route = asTestRoute(Route);
    const knownHead = route.head?.({ params: { slug: FIRST_BLOG_POST.slug } });
    const missingHead = route.head?.({ params: { slug: "nope" } });

    expect(knownHead?.meta).toContainEqual({ title: FIRST_BLOG_POST.title });
    expect(knownHead?.links).toContainEqual({
      rel: "canonical",
      href: `/blog/${FIRST_BLOG_POST.slug}`,
    });
    expect(missingHead?.meta).toContainEqual({
      title: `Post not found | ${SITE_NAME}`,
    });
  });

  it("renders a shareable blog post route", async () => {
    const { Route } = await import("@/src/routes/blog/$slug");
    const route = asTestRoute(Route);
    testRouterState.params = { slug: FIRST_BLOG_POST.slug };

    render(React.createElement(route.component));

    const hiddenArticle = screen.getByRole("article", { hidden: true });
    expect(
      within(hiddenArticle).getByRole("heading", { level: 1 }),
    ).toHaveTextContent(FIRST_BLOG_POST.title);
    expect(
      document.querySelector('script[type="application/ld+json"]'),
    ).toHaveTextContent(FIRST_BLOG_POST.title);
  });

  it("falls back to the blog desktop when a blog slug is missing", async () => {
    const { Route } = await import("@/src/routes/blog/$slug");
    const route = asTestRoute(Route);
    testRouterState.params = { slug: "missing" };

    render(React.createElement(route.component));

    expect(screen.getByLabelText("robin.build")).toBeVisible();
    expect(document.body.style.overflow).toBe("hidden");
  });
});
