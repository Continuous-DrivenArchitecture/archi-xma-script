// Injected via esbuild's `inject` option so any bare reference to the
// global `Buffer` identifier in the bundle resolves to this real,
// spec-compatible implementation (the `buffer` npm package -- the same one
// browser bundlers use to polyfill Node's Buffer) instead of assuming a
// Node runtime provides it. jArchi's GraalVM script engine does not.
export { Buffer } from 'buffer';
