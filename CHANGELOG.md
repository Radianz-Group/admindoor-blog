# Changelog

All notable changes to `admindoor-blog` are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.0.0] - 2026-11-19

First public release. The package was previously distributed privately as `@radianz-group/next-blog` (0.1.0 to 0.8.0). The API is the same as 0.8.0.

### Changed

- **Breaking:** renamed from `@radianz-group/next-blog` to `admindoor-blog` and published to the public npm registry instead of GitHub Packages.
- **Breaking:** the `react` and `react-dom` peer dependencies now require 19 or later, matching what Next.js 16 needs.
- Released under the Apache License 2.0.

### Fixed

- Share list items stay scrollable from the first item when the row overflows.

### Migrating from `@radianz-group/next-blog`

1. `pnpm remove @radianz-group/next-blog && pnpm add admindoor-blog`
2. Replace `@radianz-group/next-blog` with `admindoor-blog` in imports, `transpilePackages`, CSS `@import` and Tailwind `@source` paths.
3. Remove the `@radianz-group:registry=…` line and GitHub token from your `.npmrc`, and the `NPM_RC` env var on Vercel if it only existed for this package.
4. Coming from a version before 0.8.0: remove `analytics.gtagId` from the config. UTM-tagged share links are now opt-in with `postPage.share.utm.enabled: true`.

[Unreleased]: https://github.com/Radianz-Group/admindoor-blog/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Radianz-Group/admindoor-blog/releases/tag/v1.0.0
