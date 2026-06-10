# Contributing

Thanks for taking the time to improve ZooNavigator.

## Development Setup

The preferred workflow uses `devenv` from the repository root:

```bash
devenv shell
devenv up
devenv test
```

If `devenv` is not available, use the equivalent commands from the relevant subproject:

- API: `cd api && sbt scalafmtCheckAll test`
- Web: `cd web && npm ci && npm run lint && npm run test:ci`
- Docs: `cd docs && pip install -r requirements.txt && sphinx-build -W -b html . _build/html`
- E2E: `cd e2e && npm ci && npm run lint && npm test`

## Pull Requests

- Keep changes focused and explain the user-facing behavior or maintenance value.
- Add or update tests for behavior changes.
- Keep `package-lock.json` files in sync when changing Node dependencies.
- Use Conventional Commit style for commit messages, for example `fix(api): handle missing acl`.

## Documentation

Configuration and user-facing behavior changes should update the Sphinx docs under `docs/`.
