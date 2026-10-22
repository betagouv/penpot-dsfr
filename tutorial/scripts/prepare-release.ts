// Mirror the `.penpot` assets of a GitHub release into `public/releases/` and describe them into `src/generated/release.json`
//
// GitHub release downloads cannot be fetched from a browser (no CORS headers on the storage redirect), so the files
// are served by the tutorial itself. The script also reads each archive to know its Penpot file ID, which is the
// one the tutorial replaces in dependent files.
//
// Usage: `npm run release:prepare` (latest release) or `RELEASE_TAG=release-04102025 npm run release:prepare`
import { strFromU8 } from 'fflate';
import { createWriteStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { ReadableStream } from 'node:stream/web';

import { DsfrFileKey, dsfrFileKeys, dsfrFiles } from '@tutorial/src/config/dsfr-files';
import { Release, ReleaseFile } from '@tutorial/src/config/release';
import { getEntryData, readPenpotManifest, readZipEntries } from '@tutorial/src/utils/penpot-archive';

const repository = process.env.RELEASE_REPOSITORY || 'betagouv/penpot-dsfr';
const tag = process.env.RELEASE_TAG;
const rootDirectory = path.resolve(import.meta.dirname, '..');
const publicDirectory = path.resolve(rootDirectory, 'public');
const outputFile = path.resolve(rootDirectory, 'src/generated/release.json');

interface GitHubRelease {
  tag_name: string;
  name: string | null;
  published_at: string;
  html_url: string;
  assets: { name: string; size: number; browser_download_url: string }[];
}

async function fetchRelease(): Promise<GitHubRelease> {
  const url = `https://api.github.com/repos/${repository}/releases/${tag ? `tags/${encodeURIComponent(tag)}` : 'latest'}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`unable to fetch the release from ${url} (${response.status} ${response.statusText})`);
  }

  return (await response.json()) as GitHubRelease;
}

async function download(url: string, destination: string, expectedSize: number) {
  if (existsSync(destination) && statSync(destination).size === expectedSize) {
    console.log(`  already downloaded`);

    return;
  }

  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`unable to download ${url} (${response.status} ${response.statusText})`);
  }

  await pipeline(Readable.fromWeb(response.body as ReadableStream), createWriteStream(destination));
}

function findReferences(archive: Uint8Array, ownFileId: string, fileIds: Map<string, DsfrFileKey>): DsfrFileKey[] {
  const references = new Set<DsfrFileKey>();
  const searchedIds = Array.from(fileIds.keys()).filter((fileId) => fileId !== ownFileId);

  for (const entry of readZipEntries(archive)) {
    if (!entry.name.endsWith('.json')) {
      continue;
    }

    const content = strFromU8(getEntryData(archive, entry));

    for (const fileId of searchedIds) {
      if (content.includes(fileId)) {
        references.add(fileIds.get(fileId)!);
      }
    }
  }

  return dsfrFileKeys.filter((key) => references.has(key));
}

async function main() {
  const githubRelease = await fetchRelease();
  console.log(`using the release "${githubRelease.tag_name}" of ${repository}`);

  const releaseDirectory = path.join('releases', githubRelease.tag_name);
  mkdirSync(path.join(publicDirectory, releaseDirectory), { recursive: true });

  const files: Release['files'] = {};
  const archives = new Map<DsfrFileKey, Uint8Array>();

  for (const key of dsfrFileKeys) {
    const asset = githubRelease.assets.find((asset) => asset.name.endsWith('.penpot') && dsfrFiles[key].assetPattern.test(asset.name));

    if (!asset) {
      console.warn(`no asset found for "${key}", it will be skipped by the tutorial`);
      continue;
    }

    console.log(`- ${asset.name} (${Math.round(asset.size / 1024 / 1024)} MB)`);

    const relativePath = path.posix.join('releases', githubRelease.tag_name, asset.name);
    await download(asset.browser_download_url, path.join(publicDirectory, relativePath), asset.size);

    const archive = new Uint8Array(readFileSync(path.join(publicDirectory, relativePath)));
    const manifest = readPenpotManifest(archive);

    if (manifest.files.length !== 1) {
      throw new Error(`the asset "${asset.name}" should contain exactly one Penpot file`);
    }

    archives.set(key, archive);
    files[key] = {
      assetName: asset.name,
      path: relativePath,
      downloadUrl: asset.browser_download_url,
      size: asset.size,
      fileId: manifest.files[0].id,
      fileName: manifest.files[0].name,
      references: [],
    } satisfies ReleaseFile;
  }

  const fileIds = new Map(Object.entries(files).map(([key, file]) => [file.fileId, key as DsfrFileKey]));

  for (const [key, archive] of archives) {
    files[key]!.references = findReferences(archive, files[key]!.fileId, fileIds);
    console.log(`- ${key} references: ${files[key]!.references.join(', ') || 'none'}`);
  }

  const release: Release = {
    repository: repository,
    tag: githubRelease.tag_name,
    name: githubRelease.name || githubRelease.tag_name,
    publishedAt: githubRelease.published_at,
    htmlUrl: githubRelease.html_url,
    files: files,
  };

  writeFileSync(outputFile, `${JSON.stringify(release, null, 2)}\n`);
  console.log(`release description written to ${path.relative(rootDirectory, outputFile)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
