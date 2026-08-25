# archi-xma-script

A [jArchi](https://github.com/archimatetool/archi-scripting-plugin) script
that converts an Archi model to XMA **from inside Archi itself** — no
Node.js, no Docker, no separate CLI tool. It reuses
[`@cda/archi-semantic-core`](https://github.com/Continuous-DrivenArchitecture/archi-semantic-core)
(parsing) and
[`@cda/adapter-xma`](https://github.com/Continuous-DrivenArchitecture/adapter-xma)
(mapping, geometry, and XMA serialization) exactly as they are — this
repository adds no conversion logic of its own, only the plumbing needed to
run that existing, tested logic inside jArchi's script engine.

## Why this needs a bundle

jArchi scripts run on a GraalVM JavaScript engine embedded in Archi, not on
Node.js. Two concrete incompatibilities rule out installing
`@cda/archi-semantic-core`/`@cda/adapter-xma` as ordinary dependencies:

- **jArchi has no real npm.** Its own docs are explicit: modules must be
  placed manually under a `node_modules` folder next to your scripts — there
  is no dependency resolution.
- **`@cda/archi-semantic-core` is ESM-only**, and jArchi's `require()`
  only supports CommonJS. It also imports `node:zlib` (for the rare
  zip-format `.archimate` file with embedded images) — a real Node built-in
  jArchi's engine does not provide.

So this repository compiles both packages (plus a pure-JS `node:zlib`
substitute, via [`fflate`](https://github.com/101arrowz/fflate), and a
`Buffer` polyfill, via the [`buffer`](https://github.com/feross/buffer)
package) into one self-contained CommonJS file with `esbuild`
(`scripts/build-jarchi-bundle.mjs`). Nothing about *how* a model gets
converted changes — it's the exact same `parseArchiModel` +
`serializeXma`/`inspectXmaSupport` pipeline `app-model-converter` runs in
Node, just packaged differently.

## Installing

1. Download `archi-xma-script.bundle.cjs` and `convert-to-xma.ajs` from the
   [latest Release](https://github.com/Continuous-DrivenArchitecture/archi-xma-script/releases/latest)
   — always download both from the **same** release; the bundle's public
   API can change between versions.
2. Put both files in the **same folder** inside your jArchi Scripts Manager
   (e.g. a `Scripts/xma/` folder). The script loads the bundle by relative
   path, not through `node_modules`.

## Using it

1. Open (and save, at least once) the Archi model you want to convert.
2. Select it in the Models Tree.
3. Run `convert-to-xma.ajs` from the Scripts Manager.
4. The `.xma` file is written next to the source `.archimate` file. Any
   diagnostics (warnings or errors from the conversion) print to the jArchi
   Console.

## Repository layout

```
src/index.ts                    convertArchiToXma() -- the public API this
                                 package exists to bundle. Tested normally
                                 with Vitest against real Node.
scripts/build-jarchi-bundle.mjs esbuild config that produces the jArchi
                                 bundle (dist/jarchi/archi-xma-script.bundle.cjs)
scripts/shims/                  pure-JS replacements for the two Node
                                 built-ins archi-semantic-core needs
                                 (node:zlib, Buffer) -- see their own
                                 comments for exactly why each exists
jarchi/convert-to-xma.ajs       the actual script you run inside Archi
```

`npm run bundle` builds the jArchi artifact locally; CI builds and attaches
both files to every GitHub Release (see `.releaserc.json`). This package is
**not published to npm** — the deliverable is the release attachment, not
an installable library, though `src/index.ts` is still exported/tested like
one so its logic stays independently verifiable.

## Governance contracts implemented

This repository follows **CDA Repository Standard v1** (branching, PR,
merge, Actions-security, and hygiene rules common to every CDA repository)
via the `repository-baseline` profile — not the full **CDA npm Library
Profile v1** used by `@cda/*` packages that actually publish to npm, since
this repository's deliverable is a release attachment, not a published
package. See `CONTRIBUTING.md`.
