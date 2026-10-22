import { deflateSync, inflateSync, strFromU8, strToU8 } from 'fflate';

import { crc32 } from './crc32';

// A `.penpot` file (binfile v3) is a ZIP archive containing a `manifest.json`, one JSON entry per file/page/shape
// and binary storage objects (images, fonts...). Big DSFR files contain more than 65535 entries so ZIP64 has to be supported.
//
// To keep the patching fast in the browser, entries that do not need changes are copied as-is (still compressed),
// only JSON entries referencing a replaced identifier are inflated, modified and deflated again.

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
const FLAG_DATA_DESCRIPTOR = 0x0008;

export const MANIFEST_ENTRY_NAME = 'manifest.json';

export interface ZipEntry {
  name: string;
  nameBytes: Uint8Array;
  flags: number;
  method: number;
  modificationTime: number;
  modificationDate: number;
  crc: number;
  compressedSize: number;
  uncompressedSize: number;
  localHeaderOffset: number;
}

export interface PenpotManifest {
  type: string;
  version: number;
  files: { id: string; name: string; features?: string[] }[];
  relations?: [string, string][];
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
      nameBytes: nameBytes,
      flags: view.getUint16(position + 8, true),
      method: view.getUint16(position + 10, true),
      modificationTime: view.getUint16(position + 12, true),
      modificationDate: view.getUint16(position + 14, true),
      crc: view.getUint32(position + 16, true),
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

interface OutputEntry {
  entry: ZipEntry;
  method: number;
  crc: number;
  compressedSize: number;
  uncompressedSize: number;
  data: Uint8Array;
}

function writeArchive(outputEntries: OutputEntry[]): Blob {
  const parts: BlobPart[] = [];
  const centralDirectoryParts: Uint8Array[] = [];
  let offset = 0;

  for (const outputEntry of outputEntries) {
    const { entry } = outputEntry;
    const nameLength = entry.nameBytes.length;
    // Sizes are known in advance so the data descriptor is not needed anymore
    const flags = entry.flags & ~FLAG_DATA_DESCRIPTOR;

    const localHeader = new Uint8Array(30 + nameLength);
    const localView = new DataView(localHeader.buffer);
    localView.setUint32(0, LOCAL_FILE_HEADER_SIGNATURE, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, flags, true);
    localView.setUint16(8, outputEntry.method, true);
    localView.setUint16(10, entry.modificationTime, true);
    localView.setUint16(12, entry.modificationDate, true);
    localView.setUint32(14, outputEntry.crc, true);
    localView.setUint32(18, outputEntry.compressedSize, true);
    localView.setUint32(22, outputEntry.uncompressedSize, true);
    localView.setUint16(26, nameLength, true);
    localView.setUint16(28, 0, true);
    localHeader.set(entry.nameBytes, 30);

    const needsZip64Offset = offset >= UINT32_MAX;
    const centralHeader = new Uint8Array(46 + nameLength + (needsZip64Offset ? 12 : 0));
    const centralView = new DataView(centralHeader.buffer);
    centralView.setUint32(0, CENTRAL_DIRECTORY_HEADER_SIGNATURE, true);
    centralView.setUint16(4, needsZip64Offset ? 45 : 20, true);
    centralView.setUint16(6, needsZip64Offset ? 45 : 20, true);
    centralView.setUint16(8, flags, true);
    centralView.setUint16(10, outputEntry.method, true);
    centralView.setUint16(12, entry.modificationTime, true);
    centralView.setUint16(14, entry.modificationDate, true);
    centralView.setUint32(16, outputEntry.crc, true);
    centralView.setUint32(20, outputEntry.compressedSize, true);
    centralView.setUint32(24, outputEntry.uncompressedSize, true);
    centralView.setUint16(28, nameLength, true);
    centralView.setUint16(30, needsZip64Offset ? 12 : 0, true);
    centralView.setUint32(42, needsZip64Offset ? UINT32_MAX : offset, true);
    centralHeader.set(entry.nameBytes, 46);

    if (needsZip64Offset) {
      centralView.setUint16(46 + nameLength, ZIP64_EXTRA_FIELD_ID, true);
      centralView.setUint16(46 + nameLength + 2, 8, true);
      centralView.setBigUint64(46 + nameLength + 4, BigInt(offset), true);
    }

    parts.push(localHeader as Uint8Array<ArrayBuffer>, outputEntry.data as Uint8Array<ArrayBuffer>);
    centralDirectoryParts.push(centralHeader);
    offset += localHeader.length + outputEntry.data.length;
  }

  const centralDirectoryOffset = offset;
  const centralDirectorySize = centralDirectoryParts.reduce((size, part) => size + part.length, 0);
  const entriesCount = outputEntries.length;
  const needsZip64 = entriesCount >= UINT16_MAX || centralDirectoryOffset >= UINT32_MAX || centralDirectorySize >= UINT32_MAX;

  // Not using the spread operator since big files have too many entries for the browser call stack
  for (const centralDirectoryPart of centralDirectoryParts) {
    parts.push(centralDirectoryPart as Uint8Array<ArrayBuffer>);
  }

  if (needsZip64) {
    const zip64EocdOffset = centralDirectoryOffset + centralDirectorySize;

    const zip64Eocd = new Uint8Array(56);
    const zip64EocdView = new DataView(zip64Eocd.buffer);
    zip64EocdView.setUint32(0, ZIP64_END_OF_CENTRAL_DIRECTORY_SIGNATURE, true);
    zip64EocdView.setBigUint64(4, BigInt(56 - 12), true);
    zip64EocdView.setUint16(12, 45, true);
    zip64EocdView.setUint16(14, 45, true);
    zip64EocdView.setUint32(16, 0, true);
    zip64EocdView.setUint32(20, 0, true);
    zip64EocdView.setBigUint64(24, BigInt(entriesCount), true);
    zip64EocdView.setBigUint64(32, BigInt(entriesCount), true);
    zip64EocdView.setBigUint64(40, BigInt(centralDirectorySize), true);
    zip64EocdView.setBigUint64(48, BigInt(centralDirectoryOffset), true);

    const locator = new Uint8Array(20);
    const locatorView = new DataView(locator.buffer);
    locatorView.setUint32(0, ZIP64_END_OF_CENTRAL_DIRECTORY_LOCATOR_SIGNATURE, true);
    locatorView.setUint32(4, 0, true);
    locatorView.setBigUint64(8, BigInt(zip64EocdOffset), true);
    locatorView.setUint32(16, 1, true);

    parts.push(zip64Eocd, locator);
  }

  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  eocdView.setUint32(0, END_OF_CENTRAL_DIRECTORY_SIGNATURE, true);
  eocdView.setUint16(8, Math.min(entriesCount, UINT16_MAX), true);
  eocdView.setUint16(10, Math.min(entriesCount, UINT16_MAX), true);
  eocdView.setUint32(12, Math.min(centralDirectorySize, UINT32_MAX), true);
  eocdView.setUint32(16, Math.min(centralDirectoryOffset, UINT32_MAX), true);
  parts.push(eocd);

  return new Blob(parts, { type: 'application/zip' });
}

export interface PatchPenpotArchiveOptions {
  // Keys are the library file IDs as written in the published `.penpot` file, values are the ones of the user workspace
  fileIdReplacements: Record<string, string>;
  // Create the library relations in the manifest so Penpot connects the libraries at import time
  linkLibraries: boolean;
  onProgress?: (processedEntries: number, totalEntries: number) => void;
}

export interface PatchPenpotArchiveResult {
  archive: Blob;
  fileId: string;
  // Number of replaced occurrences per original library file ID
  replacements: Record<string, number>;
  linkedLibraries: string[];
}

function countAndReplace(content: string, search: string, replacement: string): [string, number] {
  const parts = content.split(search);

  return [parts.join(replacement), parts.length - 1];
}

export function patchPenpotArchive(archive: Uint8Array, options: PatchPenpotArchiveOptions): PatchPenpotArchiveResult {
  const entries = readZipEntries(archive);
  const manifest = readPenpotManifest(archive, entries);

  if (manifest.files.length !== 1) {
    throw new InvalidPenpotArchiveError('the archive is expected to contain exactly one Penpot file');
  }

  const fileId = manifest.files[0].id;
  const replacementPairs = Object.entries(options.fileIdReplacements)
    .map(([from, to]) => [from.toLowerCase(), to.toLowerCase()] as const)
    // Replacing the file ID of the archive itself would make no sense (Penpot assigns a new one at import time)
    .filter(([from, to]) => from !== to && from !== fileId);

  const replacements: Record<string, number> = Object.fromEntries(replacementPairs.map(([from]) => [from, 0]));
  const outputEntries: OutputEntry[] = [];
  // Its existence has been checked when reading the manifest
  const manifestEntry = entries.find((entry) => entry.name === MANIFEST_ENTRY_NAME)!;

  for (const [index, entry] of entries.entries()) {
    if (entry === manifestEntry) {
      // Written at the end once we know which libraries are really used
    } else {
      let patchedContent: string | null = null;

      if (replacementPairs.length > 0 && entry.name.endsWith('.json')) {
        let content = strFromU8(getEntryData(archive, entry));
        let modified = false;

        for (const [from, to] of replacementPairs) {
          if (content.includes(from)) {
            const [newContent, count] = countAndReplace(content, from, to);

            content = newContent;
            replacements[from] += count;
            modified = true;
          }
        }

        if (modified) {
          patchedContent = content;
        }
      }

      if (patchedContent !== null) {
        const data = strToU8(patchedContent);
        const compressedData = deflateSync(data, { level: 6 });

        outputEntries.push({
          entry,
          method: METHOD_DEFLATED,
          crc: crc32(data),
          compressedSize: compressedData.length,
          uncompressedSize: data.length,
          data: compressedData,
        });
      } else {
        outputEntries.push({
          entry,
          method: entry.method,
          crc: entry.crc,
          compressedSize: entry.compressedSize,
          uncompressedSize: entry.uncompressedSize,
          data: getEntryCompressedData(archive, entry),
        });
      }
    }

    if (options.onProgress && (index % 500 === 0 || index === entries.length - 1)) {
      options.onProgress(index + 1, entries.length);
    }
  }

  const linkedLibraries: string[] = [];

  if (options.linkLibraries) {
    const relations = new Map((manifest.relations ?? []).map(([from, to]) => [`${from}:${to}`, [from, to] as [string, string]]));

    for (const [from, to] of replacementPairs) {
      if (replacements[from] > 0) {
        relations.set(`${fileId}:${to}`, [fileId, to]);
        linkedLibraries.push(to);
      }
    }

    manifest.relations = Array.from(relations.values());
  }

  // The manifest could also reference library IDs (for example `externalLibraries` from Penpot "link later" exports)
  let manifestContent = JSON.stringify(manifest, null, 2);
  for (const [from, to] of replacementPairs) {
    manifestContent = countAndReplace(manifestContent, from, to)[0];
  }

  const manifestData = strToU8(manifestContent);
  const manifestCompressedData = deflateSync(manifestData, { level: 6 });

  // Penpot does not require the manifest to be the first entry, but keeping it first eases debugging with `unzip -l`
  outputEntries.unshift({
    entry: manifestEntry,
    method: METHOD_DEFLATED,
    crc: crc32(manifestData),
    compressedSize: manifestCompressedData.length,
    uncompressedSize: manifestData.length,
    data: manifestCompressedData,
  });

  return {
    archive: writeArchive(outputEntries),
    fileId,
    replacements,
    linkedLibraries,
  };
}
