# Contributing

This repository implements **CDA Repository Baseline v1** (maintained in the
`Continuous-DrivenArchitecture` organization's standards documentation;
consult your organization's copy of `docs/standards/` for the full text) —
not the full **CDA npm Library Profile v1**, since this repository does not
publish to npm (see README.md). Most of this file (branching, commits/PRs,
squash-merge, SHA-pinning) still applies unchanged; only the release
mechanics differ from a real `@cda/*` npm package.

## Branching

- **`main`** is the only permanent branch.
- All other branches are short-lived and use one of: `feature/*`, `fix/*`,
  `chore/*`, `docs/*`, `refactor/*`.
- `main` is never written to outside a pull request — not by a contributor,
  not by CI, not by the release workflow (see "Release," below).

Flow:

```
branch from main (feature/*, fix/*, chore/*, docs/*, refactor/*)
  → change
  → pull request targeting main
  → required checks (CI)
  → squash merge
  → main
  → branch deleted automatically
```

## Commits and pull requests

- Title your PR as a [Conventional Commit](https://www.conventionalcommits.org/)
  (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `build:`, `ci:`,
  with `!` or a `BREAKING CHANGE:` footer for breaking changes).
- Merges are **squash-only**. The PR title/squash-merge message — not your
  individual in-branch commits — is what lands on `main` and is what
  `semantic-release` parses to compute the next version. In-branch commit
  hygiene is a courtesy, not load-bearing.
- Keep `npm run typecheck`, `npm run lint`, and `npm test` passing before
  opening a PR.
- Pin every third-party GitHub Action to its **full commit SHA**, never a
  floating tag — see the pinned actions in `.github/workflows/*.yml` for the
  pattern, and resolve a new SHA via
  `gh api repos/<owner>/<action>/git/refs/tags` (or the action's GitHub
  Releases page) before adding or bumping one.
- Don't edit `package.json`'s `version` field or hand-maintain a changelog —
  see "Release," below.

## Tests

Tests live under `tests/`, not `test/`. This template intentionally aligns
with the convention already in use in `adapter-xma` and the current CDA
ecosystem; the CDA npm Library Profile permits either as long as a given
repository is internally consistent. `tests/` is the chosen convention for
every repository derived from this template — don't mix the two.

## Release

This repository is **not published to npm** — see README.md. Releases are
cut only from `main`, automatically, by `semantic-release`:

```
squash-merged PR on main
  → semantic-release
  → next version computed from Conventional Commits since the last release
  → git tag (vX.Y.Z)
  → GitHub Release, with archi-xma-script.bundle.cjs + convert-to-xma.ajs attached
```

`main` is never written to as part of this — there is no `chore(release)`
commit, and `@semantic-release/git` is deliberately not part of this
repository's plugin set. `package.json`'s `version` field on `main` stays at
the fixed development placeholder `0.0.0-development`; the authoritative
record of the latest release is the git tag + the GitHub Release and its
attached files.

A `refactor:`/`docs:`/`chore:`-only PR does not trigger a release under the
`conventionalcommits` preset (no `feat`/`fix`/breaking change since the last
tag) — if a change needs a new release published regardless (e.g. a
dependency bump that must reach the bundle), use `fix:`/`feat:` and say why
in the commit body.

## Package structure

- `src/` — `convertArchiToXma()`, the real public API this repository
  exists to bundle. Tested normally with Vitest against real
  `@cda/archi-semantic-core`/`@cda/adapter-xma` — no mocking.
- `tests/` — tests, run against the source tree during CI.
- `dist/` — build output. Never committed; always produced by `npm run
  build`/`npm run bundle` before it's needed.
- `scripts/build-jarchi-bundle.mjs` — the esbuild config that produces this
  repository's actual deliverable, `dist/jarchi/archi-xma-script.bundle.cjs`
  — see README.md, "Why this needs a bundle" for the full reasoning.
- `scripts/shims/` — pure-JS replacements for the Node built-ins the
  bundled code needs (`node:zlib`, `Buffer`) that jArchi's script engine
  doesn't provide.
- `jarchi/convert-to-xma.ajs` — the script a user actually runs inside
  Archi.
- `scripts/verify-pack.mjs` / `scripts/verify-package-consumption.mjs` —
  kept from the template as general package-hygiene checks (the `dist/`
  build output is structurally a valid, importable package, even though
  this repository never publishes it) — not load-bearing for the jArchi
  bundle itself, which `npm run bundle` builds and CI verifies separately.

All of the above run in CI (see `.github/workflows/ci.yml`) and are
required status checks, via the `ci-required` job.
