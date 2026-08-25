import { parseArchiModel } from '@cda/archi-semantic-core';
import { serializeXma, inspectXmaSupport, XmaSerializationError, type XmaDiagnostic } from '@cda/adapter-xma';

export class ArchiModelParseError extends Error {}

export interface ConvertToXmaResult {
  xma: string;
  /** Every diagnostic `inspectXmaSupport` reported for this model, including warnings that did not block conversion. */
  diagnostics: XmaDiagnostic[];
}

export class XmaConversionError extends Error {
  readonly diagnostics: XmaDiagnostic[];

  constructor(message: string, diagnostics: XmaDiagnostic[]) {
    super(message);
    this.diagnostics = diagnostics;
  }
}

/**
 * Converts an Archi model's raw XML text (the exact bytes of a `.archimate`
 * file) to an XMA document, plus the full diagnostics list.
 *
 * This is the single function this package exists to bundle for jArchi —
 * see `jarchi/convert-to-xma.ajs`. It does nothing this repository owns:
 * parsing is `@cda/archi-semantic-core`'s `parseArchiModel`, mapping and
 * geometry are `@cda/adapter-xma`'s `serializeXma`/`inspectXmaSupport`. This
 * function only sequences the two calls and turns their thrown errors into
 * this package's own error types, so a jArchi caller gets one consistent
 * shape to catch regardless of which stage failed.
 *
 * `language` matches `@cda/adapter-xma`'s own `XmaSerializeOptions.language`
 * (BCP 47 tag used for XMA's language-tagged text fields).
 */
export function convertArchiToXma(xmlText: string, language = 'en'): ConvertToXmaResult {
  let model;
  try {
    model = parseArchiModel(xmlText);
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    throw new ArchiModelParseError(`This file could not be read as an Archi model: ${detail}`);
  }

  const diagnostics = inspectXmaSupport(model);

  try {
    const xma = serializeXma(model, { language });
    return { xma, diagnostics };
  } catch (cause) {
    if (cause instanceof XmaSerializationError) {
      throw new XmaConversionError('The model could not be converted to XMA.', cause.diagnostics);
    }
    throw cause;
  }
}
