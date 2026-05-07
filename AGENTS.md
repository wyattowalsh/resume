# Repository Instructions

## Project Shape

- This is a Vike + React resume system backed by canonical JSON data in `assets/data/resume.json` and artifact-specific variants in `assets/data/variants/`.
- The public route is `/`. The `/full` and `/single` routes are local-only print compositions and must stay blocked in production by `api/ssr.ts`.
- Static downloads live in `public/downloads/` and are user-initiated footer downloads, not indexable pages.
- The developer docs app in `docs/` is a separate Next.js + Fumadocs app with its own package manifest and lockfile.

## Data And Rendering Contracts

- Keep committed resume facts in `assets/data/resume.json`; use `site.json`, `full.json`, and `single.json` for artifact curation.
- Keep web-only skill popover evidence in `assets/data/skill-details.json`; it must not appear in generated PDF/DOCX artifacts.
- Keep skill icon assets and metadata in the skill-icon pipeline: `assets/data/skill-icons.json`, `assets/data/skill-section-icons.json`, and `public/skill-icons/`.
- Preserve all visible skill chips on `/` as interactive popover triggers. Curated skills may show detailed evidence and references; uncatalogued skills should still show lightweight category context.
- Keep `src/lib/artifact-specs.ts` aligned with print layouts, DOCX generation, and `src/scripts/check-artifacts.ts` whenever artifact budgets or ATS policies change.

## Commands

- Use `pnpm dev` for the public resume app.
- Use `pnpm docs:dev` or `pnpm -C docs dev` for the docs app.
- Use `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test`, `pnpm check:docs`, and `pnpm build` for normal validation.
- Use `PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" pnpm check:artifacts` on macOS when artifact generation needs an explicit Chrome binary.
- Use `pnpm check:artifacts` after changes to print layouts, variants, DOCX generation, artifact specs, skill icons, popovers, downloads, or the release workflow.
- Use `pnpm check:artifacts:current` only when auditing artifacts already on disk without the freshness requirement.

## Release And SEO Rules

- Do not add `/full`, `/single`, or `/downloads/` to `public/sitemap.xml`.
- Keep `public/robots.txt` and `public/llms.txt` aligned with the policy that `/` is canonical and print/download artifacts are not landing pages.
- Keep `.github/workflows/ci.yml` and `.github/workflows/release-theme.yml` using `pnpm check:artifacts` for the synced generate, public-download copy, and artifact regression gate.
- If public metadata changes, update the focused SEO tests in `src/lib/site.test.ts`.
