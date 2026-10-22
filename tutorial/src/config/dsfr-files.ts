export const dsfrFileKeys = ['pictogrammes', 'fondamentaux', 'composants', 'modeles', 'beta'] as const;

export type DsfrFileKey = (typeof dsfrFileKeys)[number];

export interface DsfrFileDefinition {
  key: DsfrFileKey;
  label: string;
  description: string;
  // Optional files are not libraries used by product teams, they only present structures (pages, patterns...)
  optional: boolean;
  // Used to find the right asset into a GitHub release (`dsfr_composants_v1-14.penpot`...)
  assetPattern: RegExp;
  // Fonts needed in the Penpot team so the file renders correctly
  extraFonts?: string[];
}

// The order matters: a file can only reference libraries imported in previous steps
export const dsfrFiles: Record<DsfrFileKey, DsfrFileDefinition> = {
  pictogrammes: {
    key: 'pictogrammes',
    label: 'Pictogrammes',
    description: 'Les pictogrammes illustratifs du DSFR.',
    optional: false,
    assetPattern: /pictogramme/i,
  },
  fondamentaux: {
    key: 'fondamentaux',
    label: 'Fondamentaux',
    description: 'Les couleurs, typographies, icônes, grilles et autres éléments de base.',
    optional: false,
    assetPattern: /fondamentaux/i,
  },
  composants: {
    key: 'composants',
    label: 'Composants',
    description: 'Les composants d’interface (boutons, en-tête, formulaires…) à utiliser dans vos maquettes.',
    optional: false,
    assetPattern: /composants/i,
  },
  modeles: {
    key: 'modeles',
    label: 'Modèles',
    description: 'Des exemples de pages et de parcours construits avec les composants.',
    optional: true,
    assetPattern: /mod[eè]les/i,
    extraFonts: ['Arial'],
  },
  beta: {
    key: 'beta',
    label: 'Bêta',
    description: 'Les composants en cours de conception, pas encore stabilisés.',
    optional: true,
    assetPattern: /b[eê]ta/i,
  },
};

export const requiredDsfrFileKeys = dsfrFileKeys.filter((key) => !dsfrFiles[key].optional);
export const optionalDsfrFileKeys = dsfrFileKeys.filter((key) => dsfrFiles[key].optional);
