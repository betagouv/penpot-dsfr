import releaseJson from '@tutorial/src/generated/release.json';

import { DsfrFileKey } from './dsfr-files';

export interface ReleaseFile {
  assetName: string;
  // Direct download from the GitHub release (a plain download needs no CORS headers, the file is not read by the tutorial)
  downloadUrl: string;
  size: number;
  // Name of the file once imported into Penpot, also used by Penpot 2.19+ to link the libraries of the next imported files
  fileName: string;
}

export interface Release {
  repository: string;
  tag: string;
  name: string;
  publishedAt: string;
  htmlUrl: string;
  files: Partial<Record<DsfrFileKey, ReleaseFile>>;
}

export const release = releaseJson as Release;

// Version of the DSFR the files were converted from (e.g. `1.15`), read from the file names since they follow the Figma ones
export function getDsfrVersion(release: Release): string | null {
  for (const file of Object.values(release.files)) {
    const match = file?.fileName.match(/\bv(\d+(?:\.\d+)+)/i);

    if (match) {
      return match[1];
    }
  }

  return null;
}

// Previous minor versions are listed so users explicitly say which one their mockups use, only the released one is converted
export function getPreviousMinorVersions(version: string, count: number): string[] {
  const [major, minor] = version.split('.').map((part) => parseInt(part, 10));
  const versions: string[] = [];

  for (let previousMinor = minor - 1; previousMinor >= 0 && versions.length < count; previousMinor--) {
    versions.push(`${major}.${previousMinor}`);
  }

  return versions;
}
