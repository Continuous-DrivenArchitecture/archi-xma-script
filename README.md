# archi-xma-script

Convierte un modelo de Archi a formato XMA **sin salir de Archi** — no
necesitas instalar Node.js, Docker, ni ninguna herramienta de línea de
comandos. Es un script que corre dentro del propio editor.

## Requisitos

- Tener **Archi** instalado.
- Tener instalado el **plugin de scripting jArchi** dentro de Archi (es un
  plugin aparte, no viene instalado por defecto — se instala una sola vez
  desde el menú *Help → Manage Plug-ins...* de Archi; el archivo del plugin
  se descarga desde [archimatetool.com/plugins](https://www.archimatetool.com/plugins/)).
- El modelo que quieras convertir debe estar **guardado en disco** (el
  script lee el archivo `.archimate` real, no solo lo que está abierto sin
  guardar).

## Instalación (una sola vez)

1. Ve a la página de [**Releases**](https://github.com/Continuous-DrivenArchitecture/archi-xma-script/releases/latest)
   de este repositorio y descarga estos dos archivos de la versión más
   reciente:
   - `archi-xma-script.bundle.cjs`
   - `convert-to-xma.ajs`

   **Importante:** descarga siempre los dos del mismo release — no mezcles
   archivos de versiones distintas.

2. Abre Archi y abre el panel **Scripts Manager** (si no lo ves, en el menú
   *Window* elige *Reset Window Layout*, o revisa el menú *Tools*).

3. Arrastra los dos archivos descargados directamente a ese panel (Archi te
   preguntará si quieres copiarlos o solo enlazarlos — cualquiera de las
   dos opciones funciona, pero ambos archivos deben quedar juntos, en la
   misma carpeta dentro del Scripts Manager).

## Cómo usarlo

1. Abre el modelo que quieres convertir y **guárdalo** (si tiene cambios sin
   guardar, guárdalo primero).
2. Selecciónalo en el árbol de modelos (Models Tree), a la izquierda.
3. En el Scripts Manager, busca `convert-to-xma.ajs` y haz doble clic para
   correrlo (o clic derecho → *Run Script*).
4. Cuando termine, aparece un mensaje indicando dónde quedó el archivo
   convertido: se guarda **en la misma carpeta que tu archivo original**,
   con el mismo nombre, terminando en `.xma` en vez de `.archimate`.

## Si algo sale mal

Abre la **Consola** de scripts (botón *Show Console* en el Scripts Manager)
antes de volver a correr el script — ahí aparece el detalle exacto de
cualquier error o advertencia. Si necesitas ayuda, copia el mensaje
completo de la consola.

---

## For developers

Everything below is for people modifying this repository's code — not
needed to just use the script.

This repository adds no XMA conversion logic of its own. It reuses
[`@cda/archi-semantic-core`](https://github.com/Continuous-DrivenArchitecture/archi-semantic-core)
(parsing) and
[`@cda/adapter-xma`](https://github.com/Continuous-DrivenArchitecture/adapter-xma)
(mapping, geometry, and XMA serialization) exactly as they are, and bundles
them so jArchi can load them.

### Why this needs a bundle

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

### Repository layout

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
jarchi/convert-to-xma.ajs       the actual script an end user runs inside
                                 Archi -- see the user-facing section above
```

`npm run bundle` builds the jArchi artifact locally; CI builds and attaches
both files to every GitHub Release (see `.releaserc.json`). This package is
**not published to npm** — the deliverable is the release attachment, not
an installable library, though `src/index.ts` is still exported/tested like
one so its logic stays independently verifiable.

### Governance contracts implemented

This repository follows **CDA Repository Standard v1** (branching, PR,
merge, Actions-security, and hygiene rules common to every CDA repository)
via the `repository-baseline` profile — not the full **CDA npm Library
Profile v1** used by `@cda/*` packages that actually publish to npm, since
this repository's deliverable is a release attachment, not a published
package. See `CONTRIBUTING.md`.
