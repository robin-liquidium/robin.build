# Repository guide

A web desktop built with TanStack Start, React, TypeScript, and Tailwind CSS, deployed to Cloudflare Workers. Use Bun. See [README.md](README.md) for the project layout.

## Commands

- `bun dev` — local development server on port 3000.
- `bun run test` — run `bun test` with happy-dom and React Testing Library on `tests/`; append a test file path to run only that file.
- `bun run test:coverage` — run tests with the coverage requirements in `bunfig.toml`.
- `bun run lint` / `bun run fmt` — lint and format with Bun's built-ins, configured in `bunfig.toml`. Append paths to limit them to files you touched.
- `bun run check` — type check with `bun check`.
- `bun run build` — production build and type check.
- `bun run preview` — build and preview locally.
- `bun run deploy` — build and deploy using the generated `dist/server/wrangler.json`; retain this config path when invoking Wrangler directly.

The complete CI checks are defined in [.github/workflows/ci.yml](.github/workflows/ci.yml).

Package scripts run the Bun canary pinned in `package.json`, which `bun lint` needs. Use `bun run <script>` rather than a global `bun` for these. If your session disables install scripts (`NPM_CONFIG_IGNORE_SCRIPTS`), run `node node_modules/bun/install.js` after `bun install`.

## Repo conventions

- `@/` imports resolve to the repository root, not `src/`.
- Routes live in `src/routes/`. Do not manually edit generated `src/routeTree.gen.ts`.
- Keep browser-only APIs out of server rendering paths.
- Reuse existing components in `components/ui/` and `components/magicui/`, and use `lucide-react` icons.
- Preserve mobile behavior and both light and dark themes when changing UI.
