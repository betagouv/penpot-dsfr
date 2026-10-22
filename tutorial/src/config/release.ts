import releaseJson from '@tutorial/src/generated/release.json';

import { DsfrFileKey } from './dsfr-files';

export interface ReleaseFile {
  assetName: string;
  // Relative to the tutorial root, assets are mirrored next to the application since GitHub release downloads have no CORS headers
  path: string;
  // Direct download from GitHub, used as a fallback link
  downloadUrl: string;
  size: number;
  // File ID inside the `.penpot` archive (the one of our Penpot workspace, the one to be replaced)
  fileId: string;
  fileName: string;
  // Other DSFR files whose IDs appear inside this file
  references: DsfrFileKey[];
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

// Version of the DSFR the files were converted from (e.g. `1.14`), read from the file names since they follow the Figma ones
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
