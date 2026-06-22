import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

/** Vitest configuration that enforces full coverage on deterministic app code. */
export default defineConfig({
  resolve: {
    alias: {
      "@": rootDir,
    },
  },
  plugins: [react()],
  test: {
    environment: "jsdom",
    environmentOptions: {
      jsdom: {
        url: "http://localhost:3000/",
      },
    },
    globals: false,
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: [
        "lib/blog.ts",
        "lib/desktop-shortcuts.ts",
        "lib/site.ts",
        "lib/utils.ts",
        "components/NoiseBackground.tsx",
        "components/blog/BlogPostContent.tsx",
        "components/magicui/interactive-hover-button.tsx",
        "components/os/apps/ImageViewerApp.tsx",
        "components/os/apps/TextReaderApp.tsx",
        "components/ui/badge.tsx",
        "components/ui/button.tsx",
        "components/ui/calendar.tsx",
        "components/ui/textarea.tsx",
        "src/features/revolut-personal/DocumentPage.tsx",
        "src/router.tsx",
        "src/routes/blog/$slug.tsx",
        "src/routes/blog/index.tsx",
        "src/routes/index.tsx",
        "src/routes/revolut-personal/callback.tsx",
        "src/routes/revolut-personal/privacy.tsx",
        "src/routes/revolut-personal/terms.tsx",
        "src/routes/robots[.]txt.ts",
      ],
      exclude: ["src/routeTree.gen.ts", "src/styles/**"],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
});
