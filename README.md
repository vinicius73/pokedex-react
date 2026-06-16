# Pokédex AI

A regional Pokédex browser built with React Router v7. Browse Pokémon by region using [PokeAPI v2](https://pokeapi.co/), filter by type, search by name, and open a detail modal with stats, flavor text, and evolution chain.

This is a client-side SPA (`ssr: false`) — no server-side rendering.

## Stack

- React 19, React Router v7, TypeScript 5.9
- Tailwind CSS v4, Vite 8
- TanStack Query + Ky for data fetching
- Playwright for E2E tests
- [Oxfmt](https://oxc.rs/docs/guide/usage/formatter.html) + [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) for formatting and linting

## Getting Started

Requires **Node.js ≥ 24**.

```bash
npm install
npm run dev
```

The app runs at [http://localhost:5173](http://localhost:5173) and redirects to `/regions/kanto`.

## Scripts

| Script              | Description                           |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Start dev server with HMR             |
| `npm run build`     | Production build                      |
| `npm run start`     | Preview production build on port 3000 |
| `npm run typecheck` | React Router typegen + `tsc`          |
| `npm run fmt`       | Format code with Oxfmt                |
| `npm run fmt:check` | Check formatting (CI)                 |
| `npm run lint`      | Lint with Oxlint                      |
| `npm run lint:fix`  | Lint and apply safe fixes             |
| `npm run test`      | Run Playwright E2E tests              |

## Code Quality

Formatting and linting use the [Oxc toolchain](https://oxc.rs/). Config files:

- `.oxfmtrc.json` — formatting, Tailwind class sorting
- `.oxlintrc.json` — linting with `correctness` at error and `denyWarnings: true`

Run all checks locally:

```bash
npm run fmt:check && npm run lint && npm run typecheck && npm run test
```

CI (`.github/workflows/ci.yaml`) runs formatting, lint, typecheck, build, and E2E on every push and pull request.

### Editor setup (optional)

Install the [Oxc VS Code extension](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode) and add to your settings:

```json
{
  "editor.defaultFormatter": "oxc.oxc-vscode",
  "editor.formatOnSave": true
}
```

## Project Structure

```
app/
  routes/       # Route segments (home redirect, region page)
  components/   # Shared UI (Modal, PokemonCard, RegionTabs, …)
  hooks/        # TanStack Query hooks
  lib/          # HTTP client, PokeAPI client, mappers, utils
  types/        # API and view-model types
tests/          # Playwright E2E specs
```

See `.cursor/rules/project-structure.mdc` for full conventions.

## Deployment

### Docker

```bash
docker build -t pokedex-ai .
docker run -p 3000:3000 pokedex-ai
```

The multi-stage build compiles the client bundle and serves it with Ferron.

### Manual

Build and serve the static client output:

```bash
npm run build
npm run start
```

Production output is in `build/client/`.

## Testing

E2E tests use Playwright against the dev server and the live PokeAPI:

```bash
npm run test
```

Tests cover region tabs, Pokédex switching, search/filter, and modal interactions (keyboard, focus trap, backdrop dismiss).
