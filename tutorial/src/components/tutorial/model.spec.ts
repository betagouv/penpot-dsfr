import { describe, expect, it } from 'vitest';

import { Release } from '@tutorial/src/config/release';

import { getPhases, getStepAfterSituation, getSteps, isFirstStepAfterImports } from './model';

const release: Release = {
  repository: 'betagouv/penpot-dsfr',
  tag: 'test',
  name: 'Test',
  publishedAt: '2026-01-01T00:00:00Z',
  htmlUrl: 'https://github.com/betagouv/penpot-dsfr/releases/tag/test',
  files: {
    pictogrammes: {
      assetName: 'p.penpot',
      downloadUrl: '',
      size: 1,
      fileName: 'P',
    },
    fondamentaux: {
      assetName: 'f.penpot',
      downloadUrl: '',
      size: 1,
      fileName: 'F',
    },
    composants: {
      assetName: 'c.penpot',
      downloadUrl: '',
      size: 1,
      fileName: 'C',
    },
    beta: {
      assetName: 'b.penpot',
      downloadUrl: '',
      size: 1,
      fileName: 'B',
    },
  },
};

describe('getSteps()', () => {
  it('should only include available and selected files', () => {
    expect(getSteps({ optionalFiles: [], hasFigmaFiles: null }, release)).toStrictEqual([
      'welcome',
      'prepare',
      'file-pictogrammes',
      'file-fondamentaux',
      'file-composants',
      'optional-files',
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
      'figma',
      'end',
    ]);
  });
});

describe('getStepAfterSituation()', () => {
  it('should lead to the transfer only with mockups', () => {
    expect(getStepAfterSituation({ hasFigmaFiles: true })).toBe('figma');
    expect(getStepAfterSituation({ hasFigmaFiles: false })).toBe('end');
  });

  it('should be a detour outside of the progress', () => {
    expect(getSteps({ optionalFiles: [], hasFigmaFiles: true }, release)).not.toContain('situation');
  });
});

describe('getPhases()', () => {
  it('should fit into the DSFR stepper limit', () => {
    const steps = getSteps({ optionalFiles: ['modeles', 'beta'], hasFigmaFiles: true }, release);

    expect(steps.length).toBeGreaterThan(8);
    expect(isFirstStepAfterImports(steps, 'figma')).toBe(true);
    expect(isFirstStepAfterImports(steps, 'end')).toBe(false);
    expect(isFirstStepAfterImports(steps, 'file-beta')).toBe(false);
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
