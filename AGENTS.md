# Repository guide

A web desktop built with TanStack Start, React, TypeScript, and Tailwind CSS, deployed to Cloudflare Workers. Use Bun. See [README.md](README.md) for the project layout.

## Commands

- `bun dev` — local development server on port 3000.
- `bun run test` — run Vitest and React Testing Library tests in `tests/`; append a test file path to run only that file.
- `bun run test:coverage` — run tests with the coverage requirements in `vitest.config.ts`.
- `bunx biome check <files>` — check edited files; format only files you touched. `bun run lint` checks the whole repo.
- `bun run build` — production build and TypeScript check.
- `bun run preview` — build and preview locally.
- `bun run deploy` — build and deploy using the generated `dist/server/wrangler.json`; retain this config path when invoking Wrangler directly.

The complete CI checks are defined in [.github/workflows/ci.yml](.github/workflows/ci.yml).

## Repo conventions

- `@/` imports resolve to the repository root, not `src/`.
- Routes live in `src/routes/`. Do not manually edit generated `src/routeTree.gen.ts`.
- Keep browser-only APIs out of server rendering paths.
- Reuse existing components in `components/ui/` and `components/magicui/`, and use `lucide-react` icons.
- Preserve mobile behavior and both light and dark themes when changing UI.
