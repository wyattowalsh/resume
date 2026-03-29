# resume

A Vike + React resume site driven by a single JSON data file. The repo serves an interactive web resume and generates print-ready PDF/PNG artifacts from dedicated print routes.

## Routes

| Route | Purpose | Notes |
| --- | --- | --- |
| `/` | Interactive web resume | Uses the default app layout, including the theme toggle UI. |
| `/full` | 2-page print resume | Print-focused route used for artifact generation. In production, `vercel.json` rewrites this route to `/404`, so it is local-only on Vercel. |
| `/single` | 1-page print resume | Print-focused route used for artifact generation. In production, `vercel.json` rewrites this route to `/404`, so it is local-only on Vercel. |

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
