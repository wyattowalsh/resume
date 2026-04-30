# Resume Developer Docs

This directory contains the project-local developer documentation app for the resume site. It is a standalone Next.js + Fumadocs application and is separate from the public Vike resume app at the repository root.

## Commands

Run commands from the repository root with `pnpm -C docs <script>`:

```bash
pnpm -C docs dev       # start the Fumadocs dev server
pnpm -C docs build     # build the docs app
pnpm -C docs start     # serve the built docs app
```

## Structure

| Path | Purpose |
| --- | --- |
| `content/docs` | MDX documentation pages and metadata |
| `lib/source.ts` | Fumadocs source adapter for the MDX content collection |
| `app/layout.config.tsx` | Shared docs navigation and base layout options |
| `app/docs/[[...slug]]/page.tsx` | Dynamic docs route renderer |
| `app/api/search/route.ts` | Fumadocs search endpoint |

## Maintenance

Keep developer docs aligned with root project behavior when routes, build commands, generated artifacts, or resume data workflows change. Validate docs changes with `pnpm -C docs build`; validate the public resume app from the repository root with `pnpm test`, `pnpm lint`, and `pnpm build`.
