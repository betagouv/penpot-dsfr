import { Release } from '@tutorial/src/config/release';

// Release as it is expected once files are synchronized with figpot v2 (files referencing each other)
export const releaseFixture: Release = {
  repository: 'betagouv/penpot-dsfr',
  tag: 'release-fixture',
  name: 'DSFR on Penpot - v1.14',
  publishedAt: '2026-05-28T19:10:22Z',
  htmlUrl: 'https://github.com/betagouv/penpot-dsfr/releases',
  files: {
    pictogrammes: {
      assetName: 'dsfr_pictogrammes_v1-14.penpot',
      path: 'releases/release-fixture/dsfr_pictogrammes_v1-14.penpot',
      downloadUrl: 'https://github.com/betagouv/penpot-dsfr/releases',
      size: 2409140,
      fileId: '8580c946-af19-8023-8008-171977f0f785',
      fileName: 'DSFR - Pictogrammes - V1.14 (Community)',
      references: ['fondamentaux'],
    },
    fondamentaux: {
      assetName: 'dsfr_fondamentaux_v1-14.penpot',
      path: 'releases/release-fixture/dsfr_fondamentaux_v1-14.penpot',
      downloadUrl: 'https://github.com/betagouv/penpot-dsfr/releases',
      size: 35512349,
      fileId: '8580c946-af19-8023-8008-17197d548299',
      fileName: 'DSFR - Fondamentaux - v1.14 (Community)',
      references: ['pictogrammes'],
    },
    composants: {
      assetName: 'dsfr_composants_v1-14.penpot',
      path: 'releases/release-fixture/dsfr_composants_v1-14.penpot',
      downloadUrl: 'https://github.com/betagouv/penpot-dsfr/releases',
      size: 93188371,
      fileId: '8580c946-af19-8023-8008-1719801c9ba4',
      fileName: 'DSFR - Composants - v1.14 (Community)',
      references: ['pictogrammes', 'fondamentaux'],
    },
    modeles: {
      assetName: 'dsfr_modeles_v1-14.penpot',
      path: 'releases/release-fixture/dsfr_modeles_v1-14.penpot',
      downloadUrl: 'https://github.com/betagouv/penpot-dsfr/releases',
      size: 16548891,
      fileId: '8580c946-af19-8023-8008-1719846a7415',
      fileName: 'DSFR - Modèles - V1.14 (Community)',
      references: ['pictogrammes', 'fondamentaux', 'composants'],
    },
    beta: {
      assetName: 'dsfr_beta_v1-14.penpot',
      path: 'releases/release-fixture/dsfr_beta_v1-14.penpot',
      downloadUrl: 'https://github.com/betagouv/penpot-dsfr/releases',
      size: 6001417,
      fileId: '8580c946-af19-8023-8008-171982393cf2',
      fileName: 'DSFR - Bêta - V1.14 (Community)',
      references: ['pictogrammes', 'fondamentaux', 'composants'],
    },
  },
};

export const penpotUrlFixture = (fileId: string) =>
  `https://design.penpot.app/#/workspace?team-id=3d04e89b-bff0-8115-8004-bc137de720b4&file-id=${fileId}&page-id=019e6f71-1018-7447-ae08-c1a1ea99d419`;

export const userLibraryUrlsFixture = {
  pictogrammes: penpotUrlFixture('019e8a00-0000-7000-8000-00000000000a'),
  fondamentaux: penpotUrlFixture('019e8a00-0000-7000-8000-00000000000b'),
  composants: penpotUrlFixture('019e8a00-0000-7000-8000-00000000000c'),
};
