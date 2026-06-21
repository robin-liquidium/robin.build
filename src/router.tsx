import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

/** Creates a fresh TanStack Router instance for each app render. */
export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
