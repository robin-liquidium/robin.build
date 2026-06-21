import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { lazy, type ReactNode, Suspense } from "react";
import { NoiseBackground } from "@/components/NoiseBackground";
import "../styles/globals.css";

const APP_TITLE = "robin.build";
const APP_DESCRIPTION = "robin.build";
const DevAgentation = import.meta.env.DEV
  ? lazy(async () => {
      const { Agentation } = await import("agentation");
      return { default: Agentation };
    })
  : null;
const THEME_INIT_SCRIPT = `
try {
  const stored = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const useDark = stored ? stored === "dark" : prefersDark;
  document.documentElement.classList.toggle("dark", useDark);
} catch {}
`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_TITLE },
      { name: "description", content: APP_DESCRIPTION },
      { name: "color-scheme", content: "light dark" },
    ],
    links: [
      { rel: "manifest", href: "/manifest.json" },
      { rel: "icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", href: "/apple-icon.png" },
    ],
  }),
  component: RootComponent,
});

/** Renders the route outlet inside the shared app document. */
function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

/** Provides document chrome that used to live in Next's root layout. */
function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          id="theme-init"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: This tiny inline script prevents a theme flash before React hydrates.
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
      </head>
      <body data-app="robin.build" className="antialiased">
        <NoiseBackground />
        <div className="relative z-10">{children}</div>
        {DevAgentation ? (
          <Suspense fallback={null}>
            <DevAgentation />
          </Suspense>
        ) : null}
        <Scripts />
      </body>
    </html>
  );
}
