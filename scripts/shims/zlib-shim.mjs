// Replaces `node:zlib` in the jArchi bundle (jArchi's GraalVM script engine
// has no Node built-ins -- see README.md, "Why this needs a bundle").
//
// `@cda/archi-semantic-core`'s `zip-utils.ts` only imports `inflateRawSync`
// from `node:zlib`, to decompress the `model.xml` entry of a zip-format
// `.archimate` file (one with embedded images). `fflate`'s `inflateSync` is
// the raw-DEFLATE (no zlib/gzip header) equivalent -- confirmed against
// fflate's own README: "inflateSync(data): Uint8Array -- raw DEFLATE,
// equivalent to Node's inflateRawSync", as opposed to `unzlibSync`
// (zlib-wrapped) or `gunzipSync` (gzip).
//
// This code path is not currently reached by this package's own
// `convertArchiToXma` (it calls `parseArchiModel` directly with already-
// decoded XML text, never `extractArchiModelXml`), so tree-shaking likely
// drops the real `zip-utils.ts` from the bundle entirely. This shim exists
// as a safety net regardless -- aliasing `node:zlib` costs nothing, and
// covers a future version of this package (or of archi-semantic-core) that
// starts calling it.
import { inflateSync } from 'fflate';

export function inflateRawSync(data) {
  return Buffer.from(inflateSync(data));
}
