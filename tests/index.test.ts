import { describe, expect, it } from 'vitest';
import { convertArchiToXma, ArchiModelParseError } from '../src/index.js';

const MINIMAL_MODEL = `<?xml version="1.0" encoding="UTF-8"?>
<archimate:model xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:archimate="http://www.archimatetool.com/archimate" name="Minimal Model" id="model-minimal" version="5.0.0">
  <folder name="Business" id="folder-business" type="business">
    <element xsi:type="archimate:BusinessActor" name="Customer" id="element-customer"/>
  </folder>
</archimate:model>
`;

describe('convertArchiToXma', () => {
  it('converts a minimal real Archi model to an XMA document', () => {
    const result = convertArchiToXma(MINIMAL_MODEL);
    expect(result.xma).toContain('Customer');
    expect(result.diagnostics).toEqual([]);
  });

  it('throws ArchiModelParseError for text that is not an Archi model', () => {
    expect(() => convertArchiToXma('not xml at all')).toThrow(ArchiModelParseError);
  });
});
