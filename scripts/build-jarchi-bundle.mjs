// Bundles this package's public API (@cda/archi-semantic-core +
// @cda/adapter-xma, transitively) into a single, dependency-free CommonJS
// file that jArchi's `require()` can load -- see README.md, "Why this
// needs a bundle" for the full reasoning (jArchi has no real npm, and its
// GraalVM script engine has no Node built-ins).
//
// `platform: 'browser'` is deliberate, not a copy-paste default: it makes
// esbuild REFUSE to bundle any Node built-in it doesn't know how to handle,
// instead of silently assuming one exists at runtime (which `platform:
// 'node'` would do). Only `node:zlib` is aliased -- confirmed via a repo-wide
// grep that it is the ONLY Node built-in either dependency imports.
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(scriptsDir, '..');

await build({
  entryPoints: [path.join(rootDir, 'src/index.ts')],
  bundle: true,
  platform: 'browser',
  format: 'cjs',
  target: 'es2020',
  outfile: path.join(rootDir, 'dist/jarchi/archi-xma-script.bundle.cjs'),
  alias: {
    'node:zlib': path.join(scriptsDir, 'shims/zlib-shim.mjs'),
  },
  inject: [path.join(scriptsDir, 'shims/buffer-shim.mjs')],
  legalComments: 'none',
  logLevel: 'info',
});
