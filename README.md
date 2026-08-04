# qpux-resex-lab

UI mockup playground using Vite + React 19 + TypeScript and QuestionPro's
[WickUI](https://surveyanalyticscorp.github.io/wick-ui/?path=/docs/wick-ui--docs) design system
(`@npm-questionpro/wick-ui-lib`).

It simulates the pre-test setup flow of a usability study: welcome screen, participant details,
a scrollable non-disclosure agreement, a screener, and a device check.

## Prerequisites

- **Node.js** `^20.19.0` or `>=22.12.0` (required by Vite 7). Check with `node --version`.
- **npm** (bundled with Node.js). Check with `npm --version`.

## Clone the repository

```sh
# HTTPS
git clone https://github.com/leonardddog/qpux-resex-lab.git

# or SSH
git clone git@github.com:leonardddog/qpux-resex-lab.git

cd qpux-resex-lab
```

## Install dependencies

The project has two groups of packages:

- **Runtime dependencies** — React 19, the WickUI design system
  (`@npm-questionpro/wick-ui-lib`, `@npm-questionpro/wick-ui-icon`), Base UI, Radix UI primitives,
  and a few utilities.
- **Dev dependencies** — Vite, TypeScript, ESLint and the React plugins.

```sh
npm install
```

This installs both groups (it uses a `package-lock.json` for reproducible installs). The WickUI
compiled CSS and icon font are bundled in their packages, so no extra setup is needed.

## Run the project

```sh
npm run dev        # start the dev server at http://localhost:5173
```

Other useful scripts:

```sh
npm run build      # typecheck (tsc -b) + production build to dist/
npm run preview    # preview the production build locally
npm run lint       # run ESLint
```

## Project structure

- `src/App.tsx` — pre-test setup flow state machine; gates navigation (each step must be completed before continuing)
- `src/components/` — shared shell (`SplitLayout`, `InstructionsPanel`, `Logo`) and the setup steps under `src/components/steps/`
- `src/components/steps/NdaStep.tsx` — NDA step; hosts the lightbox-confined scrollable A4 agreement and unlocks the consent checkbox once the document is fully scrolled
- `src/data/study.ts` — study info, NDA text, screener questions, device checks
- `src/data/instructions.ts` — per-step instruction copy
- `src/types.ts` — flow/step types
- `src/lib/icon.ts` — helper for styling WickUI icons
- `src/main.tsx` — app entry, imports WickUI + icon CSS
- `index.html`, `vite.config.ts`, `tsconfig.*.json` — standard Vite/TS config

### Layout model

Screens are split into two horizontal sections:

- **Left** — a floating instructions panel (`InstructionsPanel`) with the step's instructions and the footer action
- **Right** — the interactive content of the current step

### Current flow (pre-test)

1. **Welcome** — study intro and required permissions → *Get started*
2. **Non-disclosure** — fill in name/email, scroll the agreement to the bottom, then accept the consent checkbox
3. **Screener** — 4 radio questions (all required)
4. **Device setup** — simulated camera/mic + screen-share checks in two groups
5. **Ready** — summary + start-test CTA (placeholder)

Each step's Continue button stays disabled until that step is complete.
