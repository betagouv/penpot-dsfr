// Describe the `.penpot` assets of a GitHub release into `src/generated/release.json`
//
// The tutorial links to the release assets directly (a plain download needs no CORS headers), but it needs the name each
// file will have once imported into Penpot (shown to the user, and used by Penpot to link the libraries), which is only
// in the archive manifest. So assets are downloaded into a cache folder to read it, they are not served by the tutorial.
//
// Usage: `npm run release:prepare` (latest release) or `RELEASE_TAG=release-04102025 npm run release:prepare`
import { createWriteStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { ReadableStream } from 'node:stream/web';

import { dsfrFileKeys, dsfrFiles } from '@tutorial/src/config/dsfr-files';
import { Release, ReleaseFile } from '@tutorial/src/config/release';
import { readPenpotManifest } from '@tutorial/src/utils/penpot-archive';

const repository = process.env.RELEASE_REPOSITORY || 'betagouv/penpot-dsfr';
const tag = process.env.RELEASE_TAG;
const rootDirectory = path.resolve(import.meta.dirname, '..');
const cacheDirectory = path.resolve(rootDirectory, 'node_modules/.cache/penpot-dsfr-releases');
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

async function main() {
  const githubRelease = await fetchRelease();
  console.log(`using the release "${githubRelease.tag_name}" of ${repository}`);

  const releaseCacheDirectory = path.join(cacheDirectory, githubRelease.tag_name);
  mkdirSync(releaseCacheDirectory, { recursive: true });

  const files: Release['files'] = {};

  for (const key of dsfrFileKeys) {
    const asset = githubRelease.assets.find((asset) => asset.name.endsWith('.penpot') && dsfrFiles[key].assetPattern.test(asset.name));

    if (!asset) {
      console.warn(`no asset found for "${key}", it will be skipped by the tutorial`);
      continue;
    }

    console.log(`- ${asset.name} (${Math.round(asset.size / 1024 / 1024)} MB)`);

    const archivePath = path.join(releaseCacheDirectory, asset.name);
    await download(asset.browser_download_url, archivePath, asset.size);

    const manifest = readPenpotManifest(new Uint8Array(readFileSync(archivePath)));

    if (manifest.files.length !== 1) {
      throw new Error(`the asset "${asset.name}" should contain exactly one Penpot file`);
    }

    files[key] = {
      assetName: asset.name,
      downloadUrl: asset.browser_download_url,
      size: asset.size,
      fileName: manifest.files[0].name,
    } satisfies ReleaseFile;
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
