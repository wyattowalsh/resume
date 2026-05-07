# Resume Developer Docs

This directory contains the project-local developer documentation app for the resume site. It is a standalone Next.js + Fumadocs application and is separate from the public Vike resume app at the repository root.

## Commands

Run commands from the repository root with `pnpm -C docs <script>`:

```bash
pnpm -C docs dev       # start the Fumadocs dev server
pnpm -C docs build     # build the docs app
pnpm -C docs start     # serve the built docs app
```

The root package also exposes docs shortcuts:

```bash
pnpm docs:dev
pnpm docs:build
pnpm check:docs
```

CI installs this app with `pnpm -C docs install --frozen-lockfile` so the docs lockfile remains authoritative, then runs `pnpm check:docs` as part of the root quality lane.

## Structure

| Path | Purpose |
| --- | --- |
| `content/docs` | MDX documentation pages and metadata |
| `lib/source.ts` | Fumadocs source adapter for the MDX content collection |
| `app/layout.config.tsx` | Shared docs navigation and base layout options |
| `app/docs/[[...slug]]/page.tsx` | Dynamic docs route renderer |
| `app/api/search/route.ts` | Fumadocs search endpoint |

## Maintenance

Keep developer docs aligned with root project behavior when routes, build commands, generated artifacts, resume data workflows, or interactive web disclosures change. In particular, document changes to `assets/data/skill-details.json`, `assets/data/skill-icons.json`, `assets/data/skill-section-icons.json`, `src/lib/artifact-specs.ts`, and the public-download workflow because those files define what appears on the web route versus what is allowed into generated PDF/DOCX artifacts.

Validate docs changes with `pnpm -C docs build`; validate the public resume app from the repository root with `pnpm test`, `pnpm lint`, `pnpm build`, and `PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" pnpm check:artifacts` when artifacts or downloads change.

SEO maintenance lives with the public app, not the docs app. Keep `/` as the only canonical/indexable route, keep `/full`, `/single`, and `/downloads/` out of crawler paths and the sitemap, and update `src/lib/site.test.ts` whenever metadata or JSON-LD expectations change.
