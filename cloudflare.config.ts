import { defineConfig } from "cf/config";

export default defineConfig({
  accountId: "81b27ab7c6fe3a3b3a0e6d31f7d2a381",
  worker: {
    name: "robin-build",
    compatibilityDate: "2026-11-02",
    compatibilityFlags: ["nodejs_compat", "global_fetch_strictly_public"],
    entrypoint: "@tanstack/react-start/server-entry",
    observability: {
      enabled: true,
    },
    domains: ["robin.build"],
  },
});
