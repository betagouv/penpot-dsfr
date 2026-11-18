import { inflateSync, strFromU8 } from 'fflate';

// A `.penpot` file (binfile v3) is a ZIP archive containing a `manifest.json`, one JSON entry per file/page/shape
// and binary storage objects (images, fonts...). Big DSFR files contain more than 65535 entries so ZIP64 has to be supported.
//
// Only reading is needed: the release script takes the name of each file from its manifest

const LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50;
const CENTRAL_DIRECTORY_HEADER_SIGNATURE = 0x02014b50;
const END_OF_CENTRAL_DIRECTORY_SIGNATURE = 0x06054b50;
const ZIP64_END_OF_CENTRAL_DIRECTORY_SIGNATURE = 0x06064b50;
const ZIP64_END_OF_CENTRAL_DIRECTORY_LOCATOR_SIGNATURE = 0x07064b50;
const ZIP64_EXTRA_FIELD_ID = 0x0001;
const UINT16_MAX = 0xffff;
const UINT32_MAX = 0xffffffff;

const METHOD_STORED = 0;
const METHOD_DEFLATED = 8;

export const MANIFEST_ENTRY_NAME = 'manifest.json';

export interface ZipEntry {
  name: string;
  method: number;
  compressedSize: number;
  uncompressedSize: number;
  localHeaderOffset: number;
}

export interface PenpotManifest {
  type: string;
  version: number;
  files: { id: string; name: string; features?: string[] }[];
  [key: string]: unknown;
}

export class InvalidPenpotArchiveError extends Error {}

function readZip64ExtraField(extra: DataView, entry: Pick<ZipEntry, 'compressedSize' | 'uncompressedSize' | 'localHeaderOffset'>) {
  let position = 0;

  while (position + 4 <= extra.byteLength) {
    const headerId = extra.getUint16(position, true);
    const dataSize = extra.getUint16(position + 2, true);
    let cursor = position + 4;

    if (headerId === ZIP64_EXTRA_FIELD_ID) {
      // Values are only present when the corresponding 32 bits field is saturated, and always in this order
      if (entry.uncompressedSize === UINT32_MAX) {
        entry.uncompressedSize = Number(extra.getBigUint64(cursor, true));
        cursor += 8;
      }
      if (entry.compressedSize === UINT32_MAX) {
        entry.compressedSize = Number(extra.getBigUint64(cursor, true));
        cursor += 8;
      }
      if (entry.localHeaderOffset === UINT32_MAX) {
        entry.localHeaderOffset = Number(extra.getBigUint64(cursor, true));
      }

      return;
    }

    position += 4 + dataSize;
  }
}

export function readZipEntries(archive: Uint8Array): ZipEntry[] {
  const view = new DataView(archive.buffer, archive.byteOffset, archive.byteLength);

  // The end of central directory record is at the end, possibly followed by a comment (max 65535 bytes)
  let eocdOffset = -1;
  for (let i = archive.length - 22; i >= Math.max(0, archive.length - 22 - UINT16_MAX); i--) {
    if (view.getUint32(i, true) === END_OF_CENTRAL_DIRECTORY_SIGNATURE) {
      eocdOffset = i;
      break;
    }
  }

  if (eocdOffset === -1) {
    throw new InvalidPenpotArchiveError('the file is not a valid ZIP archive');
  }

  let entriesCount = view.getUint16(eocdOffset + 10, true);
  let centralDirectoryOffset = view.getUint32(eocdOffset + 16, true);

  if (entriesCount === UINT16_MAX || centralDirectoryOffset === UINT32_MAX) {
    const locatorOffset = eocdOffset - 20;

    if (locatorOffset < 0 || view.getUint32(locatorOffset, true) !== ZIP64_END_OF_CENTRAL_DIRECTORY_LOCATOR_SIGNATURE) {
      throw new InvalidPenpotArchiveError('the ZIP64 end of central directory locator is missing');
    }

    const zip64EocdOffset = Number(view.getBigUint64(locatorOffset + 8, true));

    if (view.getUint32(zip64EocdOffset, true) !== ZIP64_END_OF_CENTRAL_DIRECTORY_SIGNATURE) {
      throw new InvalidPenpotArchiveError('the ZIP64 end of central directory record is invalid');
    }

    entriesCount = Number(view.getBigUint64(zip64EocdOffset + 32, true));
    centralDirectoryOffset = Number(view.getBigUint64(zip64EocdOffset + 48, true));
  }

  const entries: ZipEntry[] = [];
  let position = centralDirectoryOffset;

  for (let i = 0; i < entriesCount; i++) {
    if (view.getUint32(position, true) !== CENTRAL_DIRECTORY_HEADER_SIGNATURE) {
      throw new InvalidPenpotArchiveError('the ZIP central directory is corrupted');
    }

    const nameLength = view.getUint16(position + 28, true);
    const extraLength = view.getUint16(position + 30, true);
    const commentLength = view.getUint16(position + 32, true);
    const nameBytes = archive.subarray(position + 46, position + 46 + nameLength);

    const entry: ZipEntry = {
      name: strFromU8(nameBytes),
      method: view.getUint16(position + 10, true),
      compressedSize: view.getUint32(position + 20, true),
      uncompressedSize: view.getUint32(position + 24, true),
      localHeaderOffset: view.getUint32(position + 42, true),
    };

    readZip64ExtraField(new DataView(archive.buffer, archive.byteOffset + position + 46 + nameLength, extraLength), entry);

    entries.push(entry);
    position += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
}

export function getEntryCompressedData(archive: Uint8Array, entry: ZipEntry): Uint8Array {
  const view = new DataView(archive.buffer, archive.byteOffset, archive.byteLength);

  if (view.getUint32(entry.localHeaderOffset, true) !== LOCAL_FILE_HEADER_SIGNATURE) {
    throw new InvalidPenpotArchiveError(`the local header of "${entry.name}" is corrupted`);
  }

  // Name and extra field lengths of the local header can differ from the central directory ones
  const localNameLength = view.getUint16(entry.localHeaderOffset + 26, true);
  const localExtraLength = view.getUint16(entry.localHeaderOffset + 28, true);
  const dataStart = entry.localHeaderOffset + 30 + localNameLength + localExtraLength;

  return archive.subarray(dataStart, dataStart + entry.compressedSize);
}

export function getEntryData(archive: Uint8Array, entry: ZipEntry): Uint8Array {
  const compressedData = getEntryCompressedData(archive, entry);

  if (entry.method === METHOD_STORED) {
    return compressedData;
  } else if (entry.method === METHOD_DEFLATED) {
    return inflateSync(compressedData, { out: new Uint8Array(entry.uncompressedSize) });
  }

  throw new InvalidPenpotArchiveError(`the compression method ${entry.method} of "${entry.name}" is not supported`);
}

export function readPenpotManifest(archive: Uint8Array, entries: ZipEntry[] = readZipEntries(archive)): PenpotManifest {
  const manifestEntry = entries.find((entry) => entry.name === MANIFEST_ENTRY_NAME);

  if (!manifestEntry) {
    throw new InvalidPenpotArchiveError('the archive has no manifest, it is not a Penpot file');
  }

  const manifest = JSON.parse(strFromU8(getEntryData(archive, manifestEntry))) as PenpotManifest;

  if (manifest.type !== 'penpot/export-files' || !Array.isArray(manifest.files)) {
    throw new InvalidPenpotArchiveError('the manifest is not the one of a Penpot export');
  }

  return manifest;
}
