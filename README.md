# GENIT Front

Single-page app for **GENIT**, an academic records system for a university department running
the LMD scheme (L1 to M2). It handles students, teaching units and subjects, score entry, report
cards and end-of-year decisions.

Built with Vue 3, TypeScript and Vite. All academic rules (ECTS thresholds, compensation, annual
decision) are computed by the [GENIT Back](https://github.com/a2htech/genit-back) API — this app
displays and formats them.

## Stack

|              |                                                              |
| ------------ | ------------------------------------------------------------ |
| Framework    | Vue 3 (Composition API, `<script setup>`), Vue Router, Pinia |
| Build        | Vite, TypeScript, `vue-tsc`                                  |
| Server state | TanStack Query (`@tanstack/vue-query`)                       |
| HTTP         | axios                                                        |
| UI           | shadcn-vue + Tailwind CSS v4, themed neo-brutalist           |
| Auth         | Clerk (`@clerk/vue`)                                         |
| Tooling      | Bun, oxlint, ESLint, Prettier, Husky                         |

## Requirements

- [Bun](https://bun.sh) 1.3+
- Node 22.18+ or 24.12+
- A running [GENIT Back](https://github.com/a2htech/genit-back) instance
- A Clerk application (publishable key)

## Setup

```sh
bun install
cp .env.example .env
```

Fill in `.env`:

| Variable                                                       | Description                                    |
| -------------------------------------------------------------- | ---------------------------------------------- |
| `VITE_API_URL`                                                 | API base URL, e.g. `http://localhost:8080/api` |
| `VITE_CLERK_PUBLISHABLE_KEY`                                   | from the Clerk dashboard, API Keys             |
| `VITE_CLERK_SIGN_IN_URL` / `VITE_CLERK_SIGN_UP_URL`            | in-app auth routes, `/sign-in` and `/sign-up`  |
| `VITE_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` / `..._SIGN_UP_...` | where to land after auth                       |

## Scripts

| Command         | What it does                                                                      |
| --------------- | --------------------------------------------------------------------------------- |
| `bun dev`       | dev server with hot reload                                                        |
| `bun run build` | type-check (`vue-tsc`) then production build                                      |
| `bun preview`   | serve the production build locally                                                |
| `bun check`     | oxlint + ESLint + Prettier, read-only, then the unit tests — this is what CI runs |
| `bun test`      | unit tests with Bun's built-in runner, add `--watch` to rerun on save             |
| `bun lint`      | oxlint then ESLint, with `--fix`                                                  |
| `bun format`    | Prettier over `src/`                                                              |

A Husky pre-commit hook runs `lint-staged` (oxlint, ESLint, Prettier) on staged files.

## Project structure

```
src/
├── app/             router, plugins, layouts, cross-feature pages, styles, dev-only pages
├── design-system/   shadcn-vue components — depends on nothing else in the project
├── shared/          api client, error helpers, pagination, formatting, utils
└── features/        academic-year, auth, dashboard, student, teaching-unit, score, transcript
```

Dependencies flow one way only: `features -> shared -> design-system`. A feature imports another
feature through its `index.ts` and nothing else.

Each feature keeps flat, prefixed files: `<name>.types.ts`, `<name>.api.ts`, `<name>.api.spec.ts`,
`<name>.queries.ts`, `<name>.routes.ts`, `index.ts`, plus its `.vue` pages and components.

## Design system

Components come from the [shadcn-vue](https://www.shadcn-vue.com) CLI into
`src/design-system/ui/`, themed through CSS tokens in `src/app/styles/main.css`. There is no
Storybook: a dev-only `/ds` route renders every component in its states.

```sh
npx shadcn-vue@latest add <component>
```

## Testing

Unit tests (`bun test`) cover only the HTTP contract with the API. Each `<name>.api.spec.ts` has one
line per call: the request it sends (`METHOD /url?query body`) and what it returns. When a back-end
route changes, update its line first, then the `.api.ts` file.

Everything else is checked by hand in `bun dev`, and on `/ds` for design system work.
`bun check` (which runs the tests) and `bun run build` must both pass.

## License

MIT — see [LICENSE](LICENSE).
