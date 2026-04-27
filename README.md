# resume

A Vike + React resume system driven by one canonical resume JSON plus curated per-artifact variant files. The repo serves a screen-native online resume and generates dedicated 2-page and 1-page print artifacts from separate print compositions.

## Routes

| Route     | Purpose                   | Notes                                                                                                                                                                                                                                   |
| --------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`       | Interactive online resume | Public web resume with a dedicated screen layout, section jump nav, richer section intros, and the broadest project/skills surface.                                                                                                     |
| `/full`   | 2-page print resume       | Letter-sized, editorial 2-page artifact with calmer page rhythm, dedicated print choreography, and broader supporting detail than the 1-pager. In Vercel production, `api/ssr.ts` returns `404` for this route, so it stays local-only. |
| `/single` | 1-page print resume       | Letter-sized distilled resume with a linear reading path tuned for both human scanability and safer PDF text extraction. In Vercel production, `api/ssr.ts` returns `404` for this route, so it stays local-only.                       |

Static public downloads are intentionally separate from those blocked routes:

- `/downloads/wyatt-walsh-resume-full.pdf`
- `/downloads/wyatt-walsh-resume-single.pdf`

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
- `full.json` curates the calmer 2-page editorial resume
- `single.json` curates the 1-page distilled resume

`src/lib/resume-data.ts` resolves those variant files into validated render payloads for each route.

The next planned curation hooks are role-targeted variants for Senior AI/ML Engineer, fintech/data platform, and agent tooling applications. Keep those as variant-file curation passes until there is a concrete need for additional public routes or generated PDFs.

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

Compile `src/scripts/generate.ts`, then generate PDF/PNG print artifacts from the `/full` and `/single` routes plus semantic DOCX exports from the same curated variants.

```bash
pnpm check:artifacts
```

Regenerate the artifacts, then verify the expected PDFs/PNGs/DOCX files exist, were generated recently, both generated PDFs stay letter-sized, the full artifact stays at 2 pages, the single artifact stays at 1 page, each PDF page uses the expected lower-page text band and density, page 1 of the full PDF carries Experience plus Skills before Projects, page 2 of the full PDF stays focused on Projects plus Education & Certifications, Publications stay out of the full PDF, the curated work/project/skills/education/certification content still appears in the generated PDFs and DOCX files, the full PDF exposes parseable project tech-stack keywords, the 1-page PDF preserves the intended compact extraction order, and the public downloads under `public/downloads/` still satisfy the same content checks.

The artifact checker also runs ATS-oriented checks across generated and public download files:

- `pdfjs-dist` and `pdftotext` must extract contiguous contact fields, profile URLs, section headings, selected work entries, skill groups, keywords, and project descriptions.
- `pdfinfo` must report tagged, unencrypted, non-JavaScript PDFs.
- `pdffonts` must report embedded Unicode fonts and no Type 3 fonts.
- `pdfimages -list` must report no embedded raster images.
- DOCX `word/document.xml` must expose parseable resume text and `document.xml.rels` must contain the expected contact/profile/project hyperlink targets.

```bash
pnpm sync:public-downloads
```

Copy the latest generated PDF and DOCX artifacts into `public/downloads/` so the public site can expose them as static downloads without making `/full` or `/single` public routes.

## Resume generation workflow

`src/scripts/generate.ts` is self-contained:

- If `APP_URL` is **not** set, it starts a local Vike dev server on an available localhost port.
- If `APP_URL` **is** set, it uses that URL instead and waits for it to become reachable.
- If Puppeteer cannot auto-discover Chrome in your environment, set `PUPPETEER_EXECUTABLE_PATH` to a Chrome/Chromium binary before running the generator.
- On macOS, this usually works: `PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" pnpm check:artifacts`.
- `pnpm check:artifacts` requires Poppler tools (`pdfinfo`, `pdffonts`, `pdftotext`, and `pdfimages`) for the ATS PDF checks. On macOS, install them with `brew install poppler`.
- It renders `/full` and `/single` in Puppeteer, then writes:
  - `assets/outputs/resume-full.pdf`
  - `assets/outputs/resume-full.docx`
  - `assets/outputs/resume-full.png`
  - `assets/outputs/resume-single.pdf`
  - `assets/outputs/resume-single.docx`
  - `assets/outputs/resume-single.png`

`assets/outputs/` is gitignored, so generated artifacts are not committed by default.

`src/scripts/check-artifacts.ts` provides a portable regression gate on top of those generated files by parsing the PDFs in Node with `pdfjs-dist` and Poppler and the DOCX files through their Word XML, including section-order and ATS parseability checks so column-style extraction, font, image, hyperlink, and contact/keyword regressions are caught in CI.

The CI workflow also uploads the generated PDF/PNG/DOCX artifacts on every run so layout changes can be inspected without regenerating them locally.

## Production note

The print routes exist in the app code, but they are intentionally not public on Vercel. `api/ssr.ts` blocks both `/full` and `/single` when `VERCEL_ENV=production`, which means only the interactive `/` route is exposed in production.

If public resume downloads are enabled, they are served as static files from `public/downloads/` and remain separate from the blocked print routes.
