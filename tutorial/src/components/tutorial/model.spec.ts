import { describe, expect, it } from 'vitest';

import { Release } from '@tutorial/src/config/release';

import { getFilePatchPlan, getLibraryFileIds, getPhases, getSteps } from './model';

const release: Release = {
  repository: 'betagouv/penpot-dsfr',
  tag: 'test',
  name: 'Test',
  publishedAt: '2026-01-01T00:00:00Z',
  htmlUrl: 'https://github.com/betagouv/penpot-dsfr/releases/tag/test',
  files: {
    pictogrammes: {
      assetName: 'p.penpot',
      path: 'releases/test/p.penpot',
      downloadUrl: '',
      size: 1,
      fileId: '00000000-0000-0000-0000-00000000000a',
      fileName: 'P',
      references: ['fondamentaux'],
    },
    fondamentaux: {
      assetName: 'f.penpot',
      path: 'releases/test/f.penpot',
      downloadUrl: '',
      size: 1,
      fileId: '00000000-0000-0000-0000-00000000000b',
      fileName: 'F',
      references: ['pictogrammes'],
    },
    composants: {
      assetName: 'c.penpot',
      path: 'releases/test/c.penpot',
      downloadUrl: '',
      size: 1,
      fileId: '00000000-0000-0000-0000-00000000000c',
      fileName: 'C',
      references: ['pictogrammes', 'fondamentaux'],
    },
    beta: {
      assetName: 'b.penpot',
      path: 'releases/test/b.penpot',
      downloadUrl: '',
      size: 1,
      fileId: '00000000-0000-0000-0000-00000000000d',
      fileName: 'B',
      references: ['pictogrammes', 'fondamentaux', 'composants'],
    },
  },
};

const userUrl = (fileId: string) => `https://design.penpot.app/#/workspace?team-id=3d04e89b-bff0-8115-8004-bc137de720b4&file-id=${fileId}`;

describe('getSteps()', () => {
  it('should only include available and selected files', () => {
    expect(getSteps({ optionalFiles: [], hasFigmaFiles: null }, release)).toStrictEqual([
      'welcome',
      'prepare',
      'file-pictogrammes',
      'file-fondamentaux',
      'file-composants',
      'optional-files',
      'dsfr-ready',
      'end',
    ]);

    expect(getSteps({ optionalFiles: ['beta', 'modeles'], hasFigmaFiles: true }, release)).toStrictEqual([
      'welcome',
      'prepare',
      'file-pictogrammes',
      'file-fondamentaux',
      'file-composants',
      'optional-files',
      'file-beta',
      'dsfr-ready',
      'figma',
      'end',
    ]);
  });
});

describe('getPhases()', () => {
  it('should fit into the DSFR stepper limit', () => {
    const steps = getSteps({ optionalFiles: ['modeles', 'beta'], hasFigmaFiles: true }, release);

    expect(steps.length).toBeGreaterThan(8);
    expect(getPhases(steps)).toStrictEqual([
      'Préparation',
      'Pictogrammes',
      'Fondamentaux',
      'Composants',
      'Compléments',
      'Maquettes existantes',
      'Conception',
    ]);
  });
});

describe('getFilePatchPlan()', () => {
  const libraryFileIds = getLibraryFileIds({
    pictogrammes: userUrl('10000000-0000-0000-0000-00000000000a'),
    fondamentaux: userUrl('10000000-0000-0000-0000-00000000000b'),
    composants: 'not an url',
  });

  it('should only replace imported libraries', () => {
    expect(libraryFileIds).toStrictEqual({
      pictogrammes: '10000000-0000-0000-0000-00000000000a',
      fondamentaux: '10000000-0000-0000-0000-00000000000b',
    });

    expect(getFilePatchPlan('beta', release, libraryFileIds)).toStrictEqual({
      fileIdReplacements: {
        '00000000-0000-0000-0000-00000000000a': '10000000-0000-0000-0000-00000000000a',
        '00000000-0000-0000-0000-00000000000b': '10000000-0000-0000-0000-00000000000b',
      },
      linkedReferences: ['pictogrammes', 'fondamentaux'],
      missingReferences: ['composants'],
    });
  });

  it('should report circular references not imported yet', () => {
    expect(getFilePatchPlan('pictogrammes', release, {})).toStrictEqual({
      fileIdReplacements: {},
      linkedReferences: [],
      missingReferences: ['fondamentaux'],
    });
  });
});
