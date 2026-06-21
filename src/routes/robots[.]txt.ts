import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";

const TEXT_HEADERS = {
  "content-type": "text/plain; charset=utf-8",
} as const;

/** Builds the public robots.txt response body. */
function buildRobotsTxt(): string {
  return `User-agent: *
Allow: /
Sitemap: ${SITE_URL}/sitemap.xml
Host: ${SITE_URL}
`;
}

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () =>
        new Response(buildRobotsTxt(), { headers: TEXT_HEADERS }),
    },
  },
});
