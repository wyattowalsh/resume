# resume

 A Vike + React resume system driven by one canonical resume JSON plus curated per-artifact variant files. The repo serves a screen-native online resume and generates dedicated 2-page and 1-page print artifacts from separate print compositions.

## Routes

| Route | Purpose | Notes |
| --- | --- | --- |
| `/` | Interactive online resume | Public web resume with a dedicated screen layout, section jump nav, and deeper project presentation. |
| `/full` | 2-page print resume | Letter-sized, editorial 2-page artifact with dedicated print layout and page choreography. In Vercel production, `api/ssr.ts` returns `404` for this route, so it stays local-only. |
| `/single` | 1-page print resume | Letter-sized recruiter scan sheet with a flatter dedicated print layout. In Vercel production, `api/ssr.ts` returns `404` for this route, so it stays local-only. |

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

- `site.json` curates the interactive online resume
- `full.json` curates the 2-page formal resume
- `single.json` curates the 1-page distilled resume

`src/lib/resume-data.ts` resolves those variant files into validated render payloads for each route.

Those resolved payloads now feed dedicated top-level compositions instead of one shared layout:

- `src/components/SiteResumeLayout.tsx` for `/`
- `src/components/FullResumeLayout.tsx` for `/full`
- `src/components/SingleResumeLayout.tsx` for `/single`
- `src/lib/artifact-specs.ts` for the artifact-specific presentation budgets shared by those layouts

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

Run the ESLint 9 flat-config lint gate across the TypeScript/React codebase.

```bash
pnpm test
```

Run the focused Vitest suite for the shared date and resume-variant resolver logic.

```bash
pnpm generate:resume
```

Compile `src/scripts/generate.ts`, then generate print artifacts from the `/full` and `/single` routes.

```bash
pnpm check:artifacts
```

Regenerate the print artifacts, then verify the expected PDFs/PNGs exist, were generated recently, both PDFs stay letter-sized, the full artifact stays at 2 pages, the single artifact stays at 1 page, page 2 of the full PDF still contains `Projects`, and the curated project selections still appear in the generated PDFs.

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

`src/scripts/check-artifacts.ts` provides a portable regression gate on top of those generated files by parsing the PDFs in Node with `pdfjs-dist`.

## Production note

The print routes exist in the app code, but they are intentionally not public on Vercel. `api/ssr.ts` blocks both `/full` and `/single` when `VERCEL_ENV=production`, which means only the interactive `/` route is exposed in production.
