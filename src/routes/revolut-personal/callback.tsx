import { createFileRoute } from "@tanstack/react-router";
import { CallbackClient } from "@/src/features/revolut-personal/CallbackClient";

const CALLBACK_RESPONSE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow",
} as const;

export const Route = createFileRoute("/revolut-personal/callback")({
  head: () => ({
    meta: [
      { title: "Revolut Personal Callback | robin.build" },
      {
        name: "description",
        content: "Enable Banking callback for Robin's personal Revolut CLI.",
      },
      { name: "referrer", content: "no-referrer" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  headers: () => CALLBACK_RESPONSE_HEADERS,
  component: CallbackRoute,
});

/** Displays the Enable Banking callback page without reading codes server-side. */
function CallbackRoute() {
  return <CallbackClient />;
}
