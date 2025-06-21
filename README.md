# resume

> ##### monorepo for my resume generation system. 
> it transforms [resume.json](./assets/data/resume.json) into `HTML`, `PDF`, and `PNG` outputs. 
> 
> The `HTML` version contains a theme toggle of which is not visible/present in the `PDF` and `PNG` outputs. Everything is styled according to design theory, color theory, accessibility, ATS-friendly, and responsive design principles around the theme color `#6a9fb5` and complementary colors.

---

## Tech Stack

Here is a comprehensive list of tools used in this project:

### Core & Frontend

| Tool | Description | Usage Details |
| :--- | :--- | :--- |
| **`pnpm`** | A fast, disk space-efficient package manager. | Manages project dependencies, runs scripts, and can handle monorepo workspaces. Key commands: `pnpm install`, `pnpm add <pkg>`, `pnpm run <script>`. |
| **`TypeScript`** | A statically typed superset of JavaScript that compiles to plain JavaScript. | Ensures type safety for the entire codebase, reducing runtime errors and improving developer experience and maintainability. |
| **`Vite`** | A next-generation frontend build tool and development server. | Provides a blazing-fast development experience with Hot Module Replacement (HMR) and bundles the application for production. Key commands: `pnpm dev`, `pnpm build`. |
| **`React` (v19)** | A JavaScript library for building user interfaces with a component-based architecture. | Serves as the core of the frontend application, used to build the interactive and dynamic HTML version of the resume. |

### UI & Styling

| Tool | Description | Usage Details |
| :--- | :--- | :--- |
| **`Tailwind CSS` (v4)** | A utility-first CSS framework for rapidly building custom user interfaces. | Styles all components directly in the markup, ensuring a consistent, modern, and responsive design that adheres to the specified aesthetic principles. |
| **`shadcn/ui`** | A collection of beautifully designed, re-usable UI components for React. | Provides accessible and customizable components (e.g., buttons, cards, dialogs) built on Radix UI and Tailwind CSS, accelerating development. |
| **`React Icons`** | A library providing a vast collection of popular icon packs as React components. | Used to include SVG icons in the UI to enhance visual communication, such as for contact information or section headers. |
| **`clsx` & `tailwind-merge`** | Utility functions for constructing and managing CSS class strings. | `clsx` conditionally joins class names. `tailwind-merge` intelligently merges Tailwind classes without style conflicts. Essential for dynamic component styling and included with `shadcn/ui`. |

### Data & Schema

| Tool | Description | Usage Details |
| :--- | :--- | :--- |
| **`Zod`** | A TypeScript-first schema declaration and validation library. | Defines the schema for `resume.json`, then parses and validates the data at runtime. It also infers TypeScript types automatically, ensuring data integrity throughout the app. |

### Testing & Quality Assurance

| Tool | Description | Usage Details |
| :--- | :--- | :--- |
| **`Vitest`** | A blazing-fast unit and integration test framework powered by Vite. | The natural choice for testing in a Vite project. It leverages Vite's configuration and pipeline for exceptional speed and a seamless developer experience. Tests are typically located in `*.test.ts(x)` files. |
| **`React Testing Library`**| A lightweight library for testing React components in a user-centric way. | Used with Vitest to write tests that focus on component behavior from a user's perspective rather than on implementation details, ensuring the UI is both functional and accessible. |
| **`Playwright`** | A modern end-to-end testing framework by Microsoft for web applications. | Automates browser actions to perform robust E2E tests on the final React application. Its powerful API can also generate PDFs and screenshots, making it a potential all-in-one replacement for `Puppeteer`. |

### Automation, Tooling & Output Generation

| Tool | Description | Usage Details |
| :--- | :--- | :--- |
| **`Puppeteer`** | A Node.js library for controlling a headless Chrome or Chromium browser. | Used in a script to programmatically open the final HTML page and print it to high-fidelity `PDF` and `PNG` files. (Could be replaced by `Playwright`). |
| **`ESLint`** | A pluggable and configurable linter for identifying and reporting on patterns. | Enforces code quality, catches common errors, and ensures a consistent coding style across the project. Configured with an `.eslintrc.js` file and various plugins. |
| **`Prettier`** | An opinionated code formatter that enforces a consistent style. | Works alongside ESLint to automatically format code, handling all stylistic concerns. Typically configured with a `.prettierrc` file and run on save or as a pre-commit hook. |
| **`Husky`** | A tool that enables easy management of Git hooks. | Automates tasks during the Git workflow. For example, it can be configured to run linters and tests before a commit is created (`pre-commit`) to maintain repository health. |
| **`lint-staged`**| A tool to run linters against files that are staged in Git. | Works with Husky to ensure that only files passing quality checks are committed. This prevents faulty code from ever entering the main branch. |
| **`GitHub Actions`** | A CI/CD platform integrated directly into your GitHub repository. | Automates the entire workflow: installing dependencies, linting, testing, building, and generating the final `HTML`, `PDF`, and `PNG` resume outputs on every push or pull request. |
| **`ImageMagick (`magick`)`** | A command-line software suite for image manipulation. | Can be used for post-processing the `PNG` output, such as optimizing its file size, converting format, or applying visual effects. |

---

## File Structure

Here is an overview of the project's file structure, including configuration files, assets, and generated outputs:

```
.
├── .cursor/               # Cursor IDE specific files and context
├── .github/               # GitHub Actions CI/CD workflows
├── .vscode/               # VSCode editor and workspace settings
├── assets/
│   ├── data/
│   │   └── resume.json    # The core resume data in JSON format
│   ├── img/
│   │   ├── favicon/       # Favicon assets for different platforms
│   │   │   ├── android-chrome-192x192.png
│   │   │   ├── android-chrome-512x512.png
│   │   │   ├── apple-touch-icon.png
│   │   │   ├── favicon-16x16.png
│   │   │   ├── favicon-32x32.png
│   │   │   ├── favicon.ico
│   │   │   └── site.webmanifest
│   │   └── logo.png       # Project logo
│   └── outputs/           # Generated resume outputs (HTML, PDF, PNG)
├── .gitignore             # Specifies intentionally untracked files to ignore
├── README.md              # This file
├── package.json           # Project metadata and dependencies (pnpm)
├── pnpm-lock.yaml         # Exact versions of dependencies
├── postcss.config.js      # Configuration for PostCSS (used by Tailwind)
├── tailwind.config.js     # Configuration for Tailwind CSS
└── tsconfig.json          # TypeScript compiler options
```