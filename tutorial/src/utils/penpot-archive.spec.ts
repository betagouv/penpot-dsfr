import { strFromU8, strToU8, zipSync } from 'fflate';
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { getEntryData, readPenpotManifest, readZipEntries } from './penpot-archive';

const fileId = '11111111-1111-1111-1111-111111111111';

function buildArchive(): Uint8Array {
  return zipSync({
    'manifest.json': strToU8(JSON.stringify({ type: 'penpot/export-files', version: 1, files: [{ id: fileId, name: 'DSFR - Test - v1.15' }] })),
    [`files/${fileId}.json`]: strToU8(JSON.stringify({ id: fileId, name: 'DSFR - Test - v1.15' })),
    'objects/image.png': [new Uint8Array([137, 80, 78, 71, 1, 2, 3]), { level: 0 }],
  });
}

describe('readPenpotManifest()', () => {
  it('should read the files of the archive', () => {
    expect(readPenpotManifest(buildArchive()).files).toStrictEqual([{ id: fileId, name: 'DSFR - Test - v1.15' }]);
  });

  it('should reject a non-Penpot archive', () => {
    expect(() => readPenpotManifest(zipSync({ 'hello.txt': strToU8('hello') }))).toThrow(/no manifest/);
    expect(() => readPenpotManifest(strToU8('not a zip file'))).toThrow(/not a valid ZIP/);
  });
});

describe('getEntryData()', () => {
  it('should read stored and deflated entries', () => {
    const archive = buildArchive();
    const entries = readZipEntries(archive);

    expect(
      JSON.parse(
        strFromU8(
          getEntryData(
            archive,
            entries.find((entry) => entry.name === `files/${fileId}.json`)!
          )
        )
      )
    ).toStrictEqual({
      id: fileId,
      name: 'DSFR - Test - v1.15',
    });
    expect(
      Array.from(
        getEntryData(
          archive,
          entries.find((entry) => entry.name === 'objects/image.png')!
        )
      )
    ).toStrictEqual([137, 80, 78, 71, 1, 2, 3]);
  });
});

// Big real files are not committed, set `PENPOT_ARCHIVE_SAMPLE` to a local `.penpot` file (with ZIP64 ideally) to run this one
it.runIf(process.env.PENPOT_ARCHIVE_SAMPLE && existsSync(process.env.PENPOT_ARCHIVE_SAMPLE))(
  'should read the manifest of a real archive',
  () => {
    const archive = new Uint8Array(readFileSync(process.env.PENPOT_ARCHIVE_SAMPLE!));

    expect(readPenpotManifest(archive).files).toHaveLength(1);
  },
  120_000
);
