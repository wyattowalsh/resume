# resume

A Vike + React resume system driven by one canonical resume JSON plus curated per-artifact variant files. The repo serves a screen-native online resume and generates dedicated 2-page and 1-page print artifacts from separate print compositions.

## Routes

| Route     | Purpose                   | Notes                                                                                                                                                                                                                                   |
| --------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`       | Interactive online resume | Public web resume with a dedicated screen layout, subtle scroll progress, skill detail popovers, footer downloads, and the broadest project/skills surface.                                                                               |
| `/full`   | 2-page print resume       | Letter-sized, editorial 2-page artifact with calmer page rhythm, dedicated print choreography, and broader supporting detail than the 1-pager. In Vercel production, `api/ssr.ts` returns `404` for this route, so it stays local-only. |
| `/single` | 1-page print resume       | Letter-sized distilled resume with a linear reading path tuned for both human scanability and safer PDF text extraction. In Vercel production, `api/ssr.ts` returns `404` for this route, so it stays local-only.                       |

Static public downloads are intentionally separate from those blocked routes:

- `/downloads/wyatt-walsh-resume-full.pdf`
- `/downloads/wyatt-walsh-resume-full.docx`
- `/downloads/wyatt-walsh-resume-single.pdf`
- `/downloads/wyatt-walsh-resume-single.docx`

## SEO

The production-facing SEO setup is intentionally strict and route-specific:

- `src/lib/site.ts` defines the shared root title for `/` in the format `Name | Role in City`.
- `src/lib/seo.ts` builds the rest of the shared `/` metadata from the resolved site variant, including the description, canonical URL, Open Graph profile fields, Twitter card fields, and truthful `ProfilePage` + `Person` JSON-LD.
- `src/pages/index/+Head.tsx` emits that metadata for the interactive home route.
- `renderer/+config.ts` reuses that shared root title, while `src/pages/full/+config.ts` and `src/pages/single/+config.ts` still override titles for the print routes.
- `src/pages/full/+Head.tsx` and `src/pages/single/+Head.tsx` add `noindex, nofollow` so the print views stay out of search results.
- `public/robots.txt` allows the canonical root route, blocks `/full`, `/single`, and `/downloads/`, and points to `public/sitemap.xml`, which is a static sitemap containing only the public root URL.
- `public/llms.txt` gives AI crawlers a short Markdown map of the canonical resume page and clarifies that print routes and generated downloads are not separate landing pages.
- `src/lib/site.test.ts` is the focused regression gate for title, description, social image, canonical URL, and JSON-LD shape.

On Vercel, `/full` and `/single` are still local-only: the production SSR entrypoint blocks both routes with a `404`, so only `/` is publicly exposed. Do not add print routes or static download files to the sitemap.

The public PDF/DOCX downloads are intentionally crawl-blocked and omitted from the sitemap. They exist as user-initiated footer downloads, not indexable landing pages; if hosting headers are later added for static files, they should mirror this policy with `X-Robots-Tag: noindex` for `/downloads/*`.

When resume facts change, update `assets/data/resume.json` or `assets/data/variants/site.json`, then verify the public entity surface with `pnpm exec vitest run src/lib/site.test.ts`. The JSON-LD must stay truthful: `sameAs` comes from actual profile URLs, `jobTitle` and location come from the resolved site resume, education and credentials come from committed resume facts, and projects/publications appear under `subjectOf` only when they exist in the public site variant.

## Data source

`assets/data/resume.json` remains the canonical fact source for resume content.

`assets/data/variants/site.json`, `assets/data/variants/full.json`, and `assets/data/variants/single.json` layer artifact-specific curation on top of that base data:

- `site.json` curates the interactive online resume
- `full.json` curates the calmer 2-page editorial resume
- `single.json` curates the 1-page distilled resume

`src/lib/resume-data.ts` resolves those variant files into validated render payloads for each route.

`assets/data/skill-details.json` adds web-only skill popover display data for the interactive `/` route. Each entry stays to the display shape `{ name, desc, icon, links }`; descriptions should be compact, links should be canonical HTTPS references, and the icon path should mirror `assets/data/skill-icons.json`. Those descriptions and reference URLs are intentionally excluded from generated PDF/DOCX artifacts, and `src/scripts/check-artifacts.ts` derives its tooltip-only leakage guard from this file so web popover copy does not drift into print exports.

`assets/data/skill-icons.json` and `assets/data/skill-section-icons.json` drive the interactive route's local skill-icon system. Every visible skill chip on `/` should resolve to a compact local `/skill-icons/...` asset when available, and every skill section should resolve to a typed React icon through `src/components/Skills.tsx`. Prefer original, classic, or source-traced product symbols over generic art, but avoid wide wordmarks and banner logos inside skill chips because they collapse into unreadable slivers at trigger size.

The next planned curation hooks are role-targeted variants for Senior AI/ML Engineer, fintech/data platform, and agent tooling applications. Keep those as variant-file curation passes until there is a concrete need for additional public routes or generated PDFs.

Those resolved payloads now feed dedicated top-level compositions instead of one shared layout:

- `src/components/SiteResumeLayout.tsx` for `/`
- `src/components/FullResumeLayout.tsx` for `/full`
- `src/components/SingleResumeLayout.tsx` for `/single`
- `src/lib/artifact-specs.ts` for the artifact-specific presentation budgets shared by those layouts
- `src/lib/resume-downloads.ts` for the public footer download links shared by web UI and tests

`src/lib/artifact-specs.ts` also carries the DOCX content contract through each artifact spec's `docx` policy. The intent is explicit: both DOCX exports keep the basics summary, work role summaries, and project highlights available for ATS parsing, while the 1-page PDF can still suppress role summaries for visual density. The same DOCX policy also declares whether Projects should start on a fresh DOCX page (`full`) or continue inline (`single`) and whether project stack keywords are emitted into the DOCX export (`full` keeps them, `single` stays tighter). The full artifact currently allows up to three project highlights, while the single-page artifact remains capped at two.

## Web interaction model

The interactive `/` route keeps motion and disclosure intentionally restrained:

- `src/components/SectionProgressNav.tsx` renders a noninteractive Radix Progress hairline that appears only after the header scrolls away. It uses `IntersectionObserver` for visibility and active-section updates instead of scroll-event polling.
- `src/components/SkillPopover.tsx` is the only popover disclosure surface. Work and project evidence is rendered directly in the page content rather than hidden behind role/project popups.
- Every visible skill chip is a keyboard-accessible popover trigger. Curated skills show a compact description, references, and icons from `src/lib/skill-details.ts`; skills without curated detail still open a lightweight category-context card.
- Project action pills use contextual leading icons for GitHub, Kaggle, docs, and live/external links while preserving the trailing external-link indicator.
- Downloads are exposed only in the bottom footer from `resumeDownloadGroups`; the header stays focused on identity and contact links.

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
pnpm docs:dev
pnpm docs:build
pnpm check:docs
```

Run, build, or validate the standalone developer docs app from the root package scripts. CI installs docs dependencies with the docs lockfile and runs `pnpm check:docs` after the root test lane.

```bash
pnpm lint
```

Run the ESLint 9 flat-config lint gate across the TypeScript/React codebase.

```bash
pnpm test
```

Run the focused Vitest suite for the shared date helpers, resume-variant resolver, artifact metadata, and interactive component behavior.

```bash
pnpm generate:resume
```

Compile `src/scripts/generate.ts`, then generate PDF/PNG print artifacts from the `/full` and `/single` routes plus semantic DOCX exports from the same curated variants.

```bash
pnpm check:artifacts
```

Regenerate the artifacts, sync `public/downloads/`, then verify the expected PDFs/PNGs/DOCX files exist, were generated recently, both generated PDFs stay letter-sized, the full artifact stays at 2 pages, the single artifact stays at 1 page, each PDF page uses the expected lower-page text band and density, page 1 of the full PDF carries Experience plus Skills before Projects, page 2 of the full PDF stays focused on Projects plus Education & Certifications, Publications stay out of the full PDF, the curated work/project/skills/education/certification content still appears in the generated PDFs and DOCX files, the full PDF exposes parseable project tech-stack keywords, the 1-page PDF preserves the intended compact extraction order, and the public downloads under `public/downloads/` still satisfy the same hash and content checks.

The artifact checker also runs ATS-oriented checks across generated and public download files:

- `pdfjs-dist` and `pdftotext` must extract contiguous contact fields, profile URLs, section headings, selected work entries, skill groups, keywords, and project descriptions.
- `pdfinfo` must report tagged, unencrypted, non-JavaScript PDFs.
- `pdffonts` must report embedded Unicode fonts and no Type 3 fonts.
- `pdfimages -list` must report no embedded raster images.
- DOCX `word/document.xml` must expose parseable resume text and `document.xml.rels` must contain the expected contact/profile/project hyperlink targets, including project live-site links when the variant includes a `url`.
- Tooltip-only skill-detail descriptions and reference URLs from `assets/data/skill-details.json` must stay out of generated and public PDF/DOCX artifacts.

```bash
pnpm check:artifacts:current
```

Validate the currently generated artifacts and their matching `public/downloads/` copies without failing the generated-artifact freshness gate. This is the audit path for current artifacts: it runs `pnpm build:script` and then executes the checker with `RESUME_ARTIFACT_RECENCY=skip`, which skips only the 15-minute generated-artifact recency check while keeping the rest of the PDF, DOCX, parity, and content guards intact.

Keep `src/lib/artifact-specs.ts` aligned with that DOCX lane: the checker should enforce the `docx` policy fields for summary and project-highlight presence so the DOCX exports stay intentionally ATS-rich even when the `/single` PDF trims visible copy.

```bash
pnpm sync:public-downloads
```

Copy the latest generated PDF and DOCX artifacts into `public/downloads/` so the public site can expose them as static footer downloads without making `/full` or `/single` public routes. `pnpm check:artifacts` runs this sync automatically before validating public-download parity.

## Developer Docs

The `docs/` directory is a standalone Next.js + Fumadocs app for project developer documentation. It keeps its own package manifest and content tree separate from the public resume site.

```bash
pnpm -C docs dev
pnpm -C docs build
pnpm -C docs start
```

Use `pnpm -C docs dev` for local docs authoring, `pnpm -C docs build` for validation, and `pnpm -C docs start` to serve a built docs app. Docs content lives in `docs/content/docs`, the Fumadocs source adapter is `docs/lib/source.ts`, and shared docs navigation options live in `docs/app/layout.config.tsx`.

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

## Visual QA loop

Use the uploaded CI artifacts or a local `pnpm check:artifacts` run to inspect the generated PDFs/PNGs after changes to layout, typography, section ordering, skill icons, or print content budgets. The automated checks guard page counts, extraction order, ATS parseability, public-download parity, and tooltip leakage; visual review should still confirm the interactive `/` route, the `/full` 2-page composition, and the `/single` 1-page composition still read as distinct artifacts.

## Icon provenance

Skill icons are source-controlled UI assets for the interactive route only. Keep their provenance in the icon data pipeline, do not allow icon metadata or tooltip-only skill detail copy to leak into generated PDF/DOCX content, and rerun the artifact checker after icon or popover changes because it verifies public downloads remain text-first and image-free. Use `pnpm sync:skill-icons` only when intentionally refreshing local skill icon assets or their manifest.

When refreshing icons, prefer compact favicon/devicon/original-symbol assets for chip readability. The regression tests in `src/lib/skill-details.test.ts` block known wide wordmark sources such as Python's old text logo, Tableau's banner logo, FIX's white wordmark, Pandera's banner, XGBoost's trimmed banner, Go's horizontal wordmark, and the GNU Bash wordmark. After changing the pipeline, inspect the affected icons visually on `/`, rerun `pnpm sync:skill-icons`, run `pnpm test -- src/lib/skill-details.test.ts`, and run `PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" pnpm check:artifacts` if public downloads or generated artifacts were refreshed.

When editing `assets/data/skill-details.json`, keep the JSON display-only and rerun `pnpm test -- src/lib/skill-details.test.ts src/components/SkillPopover.test.tsx` plus `pnpm check:artifacts` so the raw JSON shape, resolved UI shape, icon parity, and print-artifact leakage guards all run together.

## Release gate

`.github/workflows/release-theme.yml` mirrors the root build, typecheck, lint, test, synced generation/public-download copy/artifact-check lane before upload. It uses `pnpm check:artifacts` so release validation follows the same generate, sync, and parity path as CI. Release uploads include the six generated resume artifacts plus `assets/outputs/SHA256SUMS.txt`; manual dispatches may pass `tag_name`, while release events resolve the published tag through an environment variable before invoking `gh release upload`.

## Professional context cards

Keep professional positioning consistent across the visible resume, metadata, JSON-LD, docs, and public downloads. The canonical `/` route should present Wyatt Walsh as a Senior AI/ML Engineer in New York City with proof across production AI agents, LLM document intelligence, retrieval systems, data platforms, developer tooling, education, credentials, open-source projects, and publications.

## Production note

The print routes exist in the app code, but they are intentionally not public on Vercel. `api/ssr.ts` blocks both `/full` and `/single` when `VERCEL_ENV=production`, which means only the interactive `/` route is exposed in production.

If public resume downloads are enabled, they are served as static files from `public/downloads/` and remain separate from the blocked print routes.
