# resume

A Vike + React resume site driven by a single JSON data file. The repo serves an interactive web resume and generates print-ready PDF/PNG artifacts from dedicated print routes.

## Routes

| Route | Purpose | Notes |
| --- | --- | --- |
| `/` | Interactive web resume | Uses the default app layout, including the theme toggle UI. |
| `/full` | 2-page print resume | Print-focused route used for artifact generation. In production, `vercel.json` rewrites this route to `/404`, so it is local-only on Vercel. |
| `/single` | 1-page print resume | Print-focused route used for artifact generation. In production, `vercel.json` rewrites this route to `/404`, so it is local-only on Vercel. |

## SEO

The production-facing SEO setup is intentionally simple and route-specific:

- `src/lib/site.ts` defines the shared root title for `/`.
- `src/lib/seo.ts` builds the rest of the shared `/` metadata from the validated resume JSON, including the description, canonical URL, Open Graph fields, Twitter card fields, and `ProfilePage` JSON-LD.
- `src/pages/index/+Head.tsx` emits that metadata for the interactive home route.
- `renderer/+config.ts` reuses that shared root title, while `src/pages/full/+config.ts` and `src/pages/single/+config.ts` still override titles for the print routes.
- `src/pages/full/+Head.tsx` and `src/pages/single/+Head.tsx` add `noindex, nofollow` so the print views stay out of search results.
- `public/robots.txt` allows crawling and points to `public/sitemap.xml`, which is a static sitemap containing the public root URL.

On Vercel, `/full` and `/single` are still local-only: `vercel.json` rewrites both routes to `/404` in production, so only `/` is publicly exposed.

## Data source

`assets/data/resume.json` is the single source of truth for the resume content. The route components import that file directly and validate it with `resumeSchema` before rendering.

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

The print routes exist in the app code, but they are intentionally not public on Vercel. `vercel.json` rewrites both `/full` and `/single` to `/404`, which means only the interactive `/` route is exposed in production.
