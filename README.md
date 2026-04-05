# resume

A Vike + React resume system driven by one canonical resume JSON plus curated per-artifact variant files. The repo serves a public long-form resume site and generates print-ready PDF/PNG artifacts from dedicated print routes.

## Routes

| Route | Purpose | Notes |
| --- | --- | --- |
| `/` | Public long-form resume site | Resume-led landing page with portfolio-depth sections and the default app layout, including the theme toggle UI. |
| `/full` | 2-page print resume | Print-focused route used for artifact generation. In Vercel production, `api/ssr.ts` returns `404` for this route, so it stays local-only. |
| `/single` | 1-page print resume | Print-focused route used for artifact generation. In Vercel production, `api/ssr.ts` returns `404` for this route, so it stays local-only. |

## SEO

The production-facing SEO setup is intentionally simple and route-specific:

- `src/lib/site.ts` defines the shared root title for `/`.
- `src/lib/seo.ts` builds the rest of the shared `/` metadata from the resolved site variant, including the description, canonical URL, Open Graph fields, Twitter card fields, and `ProfilePage` JSON-LD.
- `src/pages/index/+Head.tsx` emits that metadata for the interactive home route.
- `renderer/+config.ts` reuses that shared root title, while `src/pages/full/+config.ts` and `src/pages/single/+config.ts` still override titles for the print routes.
- `src/pages/full/+Head.tsx` and `src/pages/single/+Head.tsx` add `noindex, nofollow` so the print views stay out of search results.
- `public/robots.txt` allows crawling and points to `public/sitemap.xml`, which is a static sitemap containing the public root URL.

On Vercel, `/full` and `/single` are still local-only: the production SSR entrypoint blocks both routes with a `404`, so only `/` is publicly exposed.

## Data source

`assets/data/resume.json` remains the canonical fact source for resume content.

`assets/data/variants/site.json`, `assets/data/variants/full.json`, and `assets/data/variants/single.json` layer artifact-specific curation on top of that base data:

- `site.json` powers the public long-form landing page
- `full.json` curates the 2-page formal resume
- `single.json` curates the 1-page distilled resume

`src/lib/resume-data.ts` resolves those variant files into validated render payloads for each route.

## Commands

```bash
pnpm dev
```

Start the local Vike dev server.

```bash
pnpm build
```

Build the production app.

```bash
pnpm lint
```

Defined, but currently not a reliable validation gate: the repo is on ESLint 9 without a matching flat-config setup yet.

```bash
pnpm generate:resume
```

Compile `src/scripts/generate.ts`, then generate print artifacts from the `/full` and `/single` routes.

## Resume generation workflow

`src/scripts/generate.ts` is self-contained:

- If `APP_URL` is **not** set, it starts a local Vike dev server on an available localhost port.
- If `APP_URL` **is** set, it uses that URL instead and waits for it to become reachable.
- It renders `/full` and `/single` in Puppeteer, then writes:
  - `assets/outputs/resume-full.pdf`
  - `assets/outputs/resume-full.png`
  - `assets/outputs/resume-single.pdf`
  - `assets/outputs/resume-single.png`

`assets/outputs/` is gitignored, so generated artifacts are not committed by default.

## Production note

The print routes exist in the app code, but they are intentionally not public on Vercel. `api/ssr.ts` blocks both `/full` and `/single` when `VERCEL_ENV=production`, which means only the interactive `/` route is exposed in production.
