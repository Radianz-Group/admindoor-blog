# Contributing

Thanks for your interest in improving `admindoor-blog`. Bug reports, fixes, docs and feature ideas are all welcome.

## Before you start

- For a bug, open an issue with a minimal reproduction (a config snippet and the route file that fails is usually enough).
- For a new feature or a behavior change, open an issue first so we can agree on the approach before you write code.
- For security problems, do not open a public issue. Follow [SECURITY.md](./SECURITY.md).

Everyone taking part is expected to follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

## Development setup

Requirements: Node 20 or later and pnpm 9.

```bash
git clone https://github.com/Radianz-Group/admindoor-blog.git
cd admindoor-blog
pnpm install
```

| Command              | What it does                                            |
| -------------------- | ------------------------------------------------------- |
| `pnpm build`         | Builds the package into `dist/` with tsup               |
| `pnpm dev`           | Rebuilds on change                                      |
| `pnpm typecheck`     | Runs `tsc --noEmit`                                     |
| `pnpm test`          | Runs the Vitest suite once                              |
| `pnpm lint`          | Runs ESLint                                             |
| `pnpm format:check`  | Checks Prettier formatting (`pnpm format` to fix)       |
| `pnpm build:example` | Builds the package, then the example app in `examples/` |

The example app in [`examples/minimal-next-app`](./examples/minimal-next-app) uses the package through `workspace:*` and serves sample posts from a local API route, so it runs without any external service. Copy its `.env.example` to `.env.local` if you want to point it at a real content API.

## Making a change

1. Fork the repo and create a branch from `master`.
2. Keep the change focused. Unrelated refactors are easier to review as separate pull requests.
3. Add or update tests in [`tests/`](./tests) for any behavior change.
4. Update [README.md](./README.md) or [`docs/`](./docs) when you change config options, exports or host setup.
5. Add an entry under `## [Unreleased]` in [CHANGELOG.md](./CHANGELOG.md).
6. Make sure these pass locally, since CI runs them:

   ```bash
   pnpm build && pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build:example
   ```

## Commit messages

Commits follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(search): add tag filter to listing search
fix(seo): use absolute URLs in Organization logo
docs: explain custom content sources
```

Common types are `feat`, `fix`, `docs`, `refactor`, `test` and `chore`. Mark breaking changes with `!` after the type (for example `feat(share)!: …`) and describe the migration in the commit body.

## Design principles

- **Config-driven and site-agnostic.** No brand names, copy or site-specific values in package source. Anything a host might want to change belongs in the config or a `classNames` / slot override.
- **Static first.** Pages must prerender at build time. Avoid anything that requires a server at request time.
- **Safe content.** Post HTML is sanitized. Do not loosen the sanitizer allowlist without a clear reason and a test.
- **Small client bundles.** Code under `"use client"` should not import server-only dependencies such as zod, TipTap or sanitize-html.

## Releases

Maintainers handle versioning and publishing. To cut a release:

1. Bump `version` in `package.json` and move the `Unreleased` changelog entries under the new version.
2. Merge to `master`, then push a matching tag (`v1.2.0` for `"version": "1.2.0"`).
3. The [Publish workflow](./.github/workflows/publish.yml) builds, tests and publishes to npm through [trusted publishing](https://docs.npmjs.com/trusted-publishers) with provenance. No npm token is stored in the repo. Publishing from a laptop is not supported.

## License

By contributing, you agree that your contributions are licensed under the [Apache License 2.0](./LICENSE).
