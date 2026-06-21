# Repository Guidelines

This project is a small “web OS” built with TanStack Start + TypeScript, styled with Tailwind CSS v4, and deployed to Cloudflare Workers through the Cloudflare Vite plugin. Keep diffs minimal and focused.

## Project Structure & Modules

- `src/routes/` — TanStack Start file routes; root document in `src/routes/__root.tsx`.
- `src/features/` — Route-owned feature surfaces such as the bootable home screen and Revolut personal pages.
- `src/styles/globals.css` — Global Tailwind v4, shadcn, BlockNote, and font styles.
- `components/os/` — Desktop, `AppWindow` (drag/resize), Dock, `StatusBar`, app windows (Files, Calculator, Notes).
- `components/magicui/` — Magic UI widgets (`morphing-text`, terminal).
- `components/ui/` — Primitives (`badge`, `button`, `calendar`, `sliding-number`, `noise`).
- `lib/utils.ts` — `cn` helper. Path alias `@/*` maps to repo root.
- Config: `vite.config.ts`, `wrangler.jsonc`, `biome.json`, `components.json`, `tsconfig.json`.

## Dev, Build, Deploy

- Dev: `bun dev` — Vite dev server with TanStack Start.
- Build: `bun run build` — Vite build plus TypeScript check.
- Lint: `bun run lint`.
- Preview (Workers): `bun run preview`.
- Deploy (Workers): `bun run deploy`. Typegen: `bun run cf-typegen`.

## Architecture Notes

- Boot sequence: terminal runs and prompts for name; then Desktop mounts. Background noise + `MorphingText` show a time‑aware greeting (“good morning/evening {name}”).
- Windows: draggable/resizable; last interaction brings to front; Dock clicks also refocus existing windows.
- Status bar: animated HH:MM:SS via `SlidingNumber`; clicking the date opens a view‑only `Calendar`, with fullscreen and power controls.

## Style & Conventions

- TypeScript (strict), 2‑space indent. Components PascalCase; hooks `useX.ts`; route folders kebab‑case.
- Prefer route-level server rendering; isolate browser-only behavior in feature components. Keep Tailwind class lists readable; compose via `cn(...)`.
- Format only touched files with Biome.

## Testing

- None configured. If adding, use Vitest + React Testing Library; colocate `*.test.ts(x)` and add a `test` script.

## Security & Cloudflare

- Secrets in `.env.local` or `.dev.vars` (never commit). Only expose intentionally public `VITE_` variables to the client.
- Worker entry: `@tanstack/react-start/server-entry`.

## Agent-Specific Notes

- Make minimal diffs. Touch only what you change. Run Biome checks on edited files. Keep things KISS and DRY.
- NEVER ignore lint issues; NEVER use the 'any' type and try to avoid 'unknown' type.
- Do NOT use magic strings, use enums or constants instead if possible.

## UI

- we're using shadcn components as well as Magic UI and 21st.dev. Always read relevant docs using context7 when working with any of these libraries. Always follow best practices when using them.
- Always design everything so it's responsive and works on all screen sizes, as well as mobile, tablet, and desktop. make sure it looks great on all screen sizes and devices and also works great on all.
- use lucide.dev icons for everything, never custom code icons unless instructed.
- Always design for both dark and light theme so that everything always looks good in both themes.
