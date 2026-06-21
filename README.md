robin.build is a small web OS built with TanStack Start, React, TypeScript, Tailwind CSS v4, shadcn-style primitives, Magic UI bits, and Cloudflare Workers.

## Getting Started

Run the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The home route lives in `src/routes/index.tsx`; the bootable desktop screen lives in `src/features/home/HomeScreen.tsx`.

## Useful Commands

```bash
bun run build
bun run lint
bun run preview
bun run deploy
```

## Architecture

- `src/routes/__root.tsx` owns the document shell, metadata, theme bootstrap, global styles, and shared background.
- `src/routes/` contains TanStack Start file routes.
- `src/features/` contains route-owned feature code.
- `components/os/` contains the reusable desktop/window/app primitives.
- `components/ui/` contains local shadcn-style primitives.

## Deploy

Cloudflare Workers deployment is handled by `@cloudflare/vite-plugin` and `wrangler.jsonc`.
