import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { patchPenpotArchive, readPenpotManifest, readZipEntries } from './penpot-archive';

const ownFileId = '11111111-1111-1111-1111-111111111111';
const libraryFileId = '22222222-2222-2222-2222-222222222222';
const userLibraryFileId = '33333333-3333-3333-3333-333333333333';

function buildArchive(): Uint8Array {
  return zipSync({
    'manifest.json': strToU8(
      JSON.stringify({ type: 'penpot/export-files', version: 1, files: [{ id: ownFileId, name: 'DSFR - Test' }], relations: [] })
    ),
    [`files/${ownFileId}.json`]: strToU8(JSON.stringify({ id: ownFileId, name: 'DSFR - Test' })),
    [`files/${ownFileId}/pages/a/b.json`]: strToU8(JSON.stringify({ componentFile: libraryFileId, fillColorRefFile: ownFileId })),
    [`files/${ownFileId}/pages/a/c.json`]: strToU8(JSON.stringify({ typographyRefFile: libraryFileId, strokeColorRefFile: libraryFileId })),
    'objects/image.png': new Uint8Array([137, 80, 78, 71, 1, 2, 3]),
  });
}

async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}

describe('patchPenpotArchive()', () => {
  it('should replace library identifiers and link libraries', async () => {
    const result = patchPenpotArchive(buildArchive(), {
      fileIdReplacements: { [libraryFileId]: userLibraryFileId, [ownFileId]: userLibraryFileId },
      linkLibraries: true,
    });

    expect(result.fileId).toBe(ownFileId);
    expect(result.replacements).toStrictEqual({ [libraryFileId]: 3 });
    expect(result.linkedLibraries).toStrictEqual([userLibraryFileId]);

    const files = unzipSync(await blobToUint8Array(result.archive));

    expect(Object.keys(files)[0]).toBe('manifest.json');
    expect(JSON.parse(strFromU8(files['manifest.json'])).relations).toStrictEqual([[ownFileId, userLibraryFileId]]);
    expect(JSON.parse(strFromU8(files[`files/${ownFileId}/pages/a/b.json`]))).toStrictEqual({
      componentFile: userLibraryFileId,
      fillColorRefFile: ownFileId,
    });
    expect(strFromU8(files[`files/${ownFileId}/pages/a/c.json`])).not.toContain(libraryFileId);
    expect(Array.from(files['objects/image.png'])).toStrictEqual([137, 80, 78, 71, 1, 2, 3]);
  });

  it('should not link libraries when not asked to', async () => {
    const result = patchPenpotArchive(buildArchive(), {
      fileIdReplacements: { [libraryFileId]: userLibraryFileId },
      linkLibraries: false,
    });

    expect(result.linkedLibraries).toStrictEqual([]);

    const files = unzipSync(await blobToUint8Array(result.archive));

    expect(JSON.parse(strFromU8(files['manifest.json'])).relations).toStrictEqual([]);
  });

  it('should not link unused libraries', async () => {
    const result = patchPenpotArchive(buildArchive(), {
      fileIdReplacements: { '44444444-4444-4444-4444-444444444444': userLibraryFileId },
      linkLibraries: true,
    });

    expect(result.linkedLibraries).toStrictEqual([]);
  });

  it('should reject a non-Penpot archive', () => {
    expect(() => readPenpotManifest(zipSync({ 'hello.txt': strToU8('hello') }))).toThrow(/no manifest/);
  });

  // Big real files are not committed, set `PENPOT_ARCHIVE_SAMPLE` to a local `.penpot` file (with ZIP64 ideally) to run this one
  it.runIf(process.env.PENPOT_ARCHIVE_SAMPLE && existsSync(process.env.PENPOT_ARCHIVE_SAMPLE))(
    'should keep a real archive readable',
    async () => {
      const archive = new Uint8Array(readFileSync(process.env.PENPOT_ARCHIVE_SAMPLE!));
      const originalEntries = readZipEntries(archive);
      const originalManifest = readPenpotManifest(archive, originalEntries);

      const result = patchPenpotArchive(archive, {
        fileIdReplacements: { [originalManifest.files[0].id]: userLibraryFileId },
        linkLibraries: true,
      });

      const patchedArchive = await blobToUint8Array(result.archive);
      const patchedEntries = readZipEntries(patchedArchive);

      expect(patchedEntries.length).toBe(originalEntries.length);
      expect(readPenpotManifest(patchedArchive, patchedEntries).files[0].id).toBe(originalManifest.files[0].id);
    },
    120_000
  );
});
