# Agent Guidelines

These instructions apply to the whole repository.

## Project Overview

ZooNavigator is a monorepo for a ZooKeeper web UI:

- `api/` contains the Scala 2.13 backend, split into `core` and Play Framework modules.
- `web/` contains the Angular 7 frontend.
- `e2e/` contains Playwright end-to-end tests and page objects.
- `docs/` contains the Sphinx documentation site.
- `build/` contains Docker and Snap packaging assets.

Prefer the existing Nix/devenv workflow. It wires up Scala, Node.js, ZooKeeper,
documentation tooling, ports, and helper scripts consistently across the repo.

## Development Commands

These commands assume `devenv` is installed and available on `PATH`; the repo's
`.envrc` also expects that. If a restricted agent shell cannot evaluate devenv,
run the equivalent underlying commands from the relevant subproject instead.

- Enter the development environment: `devenv shell`
- Start all local services: `devenv up`
- Start services in the background: `devenv up -d`
- Run the full configured test flow: `devenv test`

Scoped commands are available inside the devenv shell:

- API dev server: `api:dev`
- API formatting: `api:format`
- API formatting check: `api:format:check`
- API tests: `api:test`
- Web dev server: `web:dev`
- Web build: `web:build`
- Web lint: `web:lint`
- Web tests: `web:test --no-watch --no-progress`
- Docs dev server: `docs:dev`
- Docs build: `docs:build`
- Docs link check: `docs:linkcheck`
- E2E lint: `e2e:lint`
- E2E tests: `e2e:test --reporter=list --workers=1`

Default local ports are API `9000`, web `4200`, docs `8000`, and ZooKeeper
`2181`. The Angular dev server proxies API requests to the Play server through
`web/proxy.conf.js`.

## Code Style

- Keep changes focused on the package or feature being touched. Avoid broad
  refactors unless they are needed for the requested change.
- Scala code is formatted with Scalafmt from `api/.scalafmt.conf`; run
  `api:format` or at least `api:format:check` after Scala edits.
- Scala imports are organized by Scalafmt rewrite rules. Do not hand-sort in a
  different style.
- Web TypeScript uses the Angular 7/TSLint setup in `web/tslint.json`: double
  quotes, semicolons, spaces, and the existing `zoo` selector conventions.
- Web UI code should follow the current Angular Material/Covalent component
  patterns already present under `web/src/app`.
- E2E tests should use the existing Playwright fixtures and page objects under
  `e2e/fixtures` and `e2e/pages` instead of duplicating browser setup.
- Documentation is reStructuredText under `docs/`; build it with warnings as
  errors through `docs:build`.

## Testing Expectations

Run the narrowest relevant checks for the files you changed, then broaden when
the change crosses boundaries.

- API-only changes: `api:format:check` and `api:test`
- Web-only changes: `web:lint` and `web:test --no-watch --no-progress`
- Documentation changes: `docs:build`
- E2E changes: `e2e:lint` and `e2e:test --reporter=list --workers=1`
- Cross-cutting changes: prefer `devenv test`

E2E tests expect the local services to be available. Use `devenv up -d` before
running them unless another process already provides the API, web app, and
ZooKeeper. Prefer the serial `--workers=1` run for local agent verification
because the current Playwright suite mutates shared ZooKeeper/UI state and can
flake when fully parallel.

## Dependency And Generated File Hygiene

- Keep `package-lock.json` files in sync when changing dependencies in `web/` or
  `e2e/`.
- Do not commit local runtime output such as `.devenv/state`, Playwright reports,
  coverage output, `node_modules`, or generated docs builds.
- Packaging changes should preserve both Docker and Snap expectations when they
  touch shared runtime configuration.

## Git And Commits

- Do not rewrite or discard user changes unless explicitly asked.
- Commit messages must follow Conventional Commits, for example
  `feat(web): add znode filter` or `fix(api): handle missing acl`.
- Use an appropriate type such as `feat`, `fix`, `docs`, `test`, `refactor`,
  `build`, `ci`, or `chore`, and include a scope when it clarifies the affected
  area.
