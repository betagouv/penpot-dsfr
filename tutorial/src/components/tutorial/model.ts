import { DsfrFileKey, dsfrFileKeys, dsfrFiles } from '@tutorial/src/config/dsfr-files';
import { Release } from '@tutorial/src/config/release';

export type FileStepId = `file-${DsfrFileKey}`;
// `situation` is a detour from the last step to change the answer given at the start, so it is not part of the progress
export type StepId = 'welcome' | 'prepare' | 'optional-files' | 'fonts' | 'figma' | 'relink' | 'end' | 'situation' | FileStepId;

export interface TutorialState {
  stepId: StepId;
  optionalFiles: DsfrFileKey[];
  // Asked first: starting from scratch needs no version check, transferring Figma mockups does
  hasFigmaFiles: boolean | null;
  // DSFR version of the Figma mockups to transfer, components of another version than the converted one may lose their link
  dsfrVersion: string | null;
}

export const initialTutorialState: TutorialState = {
  stepId: 'welcome',
  optionalFiles: [],
  hasFigmaFiles: null,
  dsfrVersion: null,
};

export function toFileStepId(key: DsfrFileKey): FileStepId {
  return `file-${key}`;
}

export function getFileKeyFromStepId(stepId: StepId): DsfrFileKey | null {
  return stepId.startsWith('file-') ? (stepId.slice('file-'.length) as DsfrFileKey) : null;
}

export function getAvailableFileKeys(release: Release): DsfrFileKey[] {
  return dsfrFileKeys.filter((key) => !!release.files[key]);
}

export function getSteps(state: Pick<TutorialState, 'optionalFiles' | 'hasFigmaFiles'>, release: Release): StepId[] {
  const availableFileKeys = getAvailableFileKeys(release);
  const requiredFileSteps = availableFileKeys.filter((key) => !dsfrFiles[key].optional).map(toFileStepId);
  const optionalFileKeys = availableFileKeys.filter((key) => dsfrFiles[key].optional);
  // Keep the definition order whatever the selection order is
  const optionalFileSteps = optionalFileKeys.filter((key) => state.optionalFiles.includes(key)).map(toFileStepId);

  return [
    'welcome',
    'prepare',
    ...requiredFileSteps,
    ...(optionalFileKeys.length > 0 ? (['optional-files'] as const) : []),
    ...optionalFileSteps,
    // Once all the files are imported, since it relinks the fonts of every file of the team at once (temporary, until Penpot does it)
    'fonts',
    // Relinking the mockups is temporary, until Penpot can swap the library of a file
    ...(state.hasFigmaFiles ? (['figma', 'relink'] as const) : []),
    'end',
  ];
}

// Where the detour leads once the answer is changed, the DSFR is already installed
export function getStepAfterSituation(state: Pick<TutorialState, 'hasFigmaFiles'>): StepId {
  return state.hasFigmaFiles ? 'figma' : 'end';
}

// The DSFR stepper only supports up to 8 steps, so it displays phases grouping the detailed steps
export function getStepPhase(stepId: StepId): string {
  const fileKey = getFileKeyFromStepId(stepId);
  if (fileKey) {
    return dsfrFiles[fileKey].optional ? 'Compléments' : dsfrFiles[fileKey].label;
  }

  switch (stepId) {
    case 'welcome':
    case 'prepare':
      return 'Préparation';
    case 'optional-files':
      return 'Compléments';
    case 'fonts':
      return 'Police';
    case 'figma':
    case 'relink':
      return 'Maquettes existantes';
    default:
      return 'Conception';
  }
}

// Step right after the DSFR is installed (files imported and their fonts relinked), it displays a success message
export function isFirstStepAfterImports(steps: StepId[], stepId: StepId): boolean {
  const index = steps.indexOf(stepId);

  return index > 0 && steps[index - 1] === 'fonts';
}

export function getPhases(steps: StepId[]): string[] {
  return Array.from(new Set(steps.map(getStepPhase)));
}

export function getStepTitle(stepId: StepId): string {
  const fileKey = getFileKeyFromStepId(stepId);
  if (fileKey) {
    return `Importer le fichier « ${dsfrFiles[fileKey].label} »`;
  }

  switch (stepId) {
    case 'welcome':
      return 'Bienvenue';
    case 'prepare':
      return 'Préparer votre espace Penpot';
    case 'optional-files':
      return 'Fichiers complémentaires';
    case 'fonts':
      return 'Relier la police Marianne';
    case 'figma':
      return 'Transférer vos maquettes Figma';
    case 'relink':
      return 'Relier vos maquettes au DSFR';
    case 'end':
      return 'Commencer à concevoir';
    case 'situation':
      return 'Modifier votre situation';
    default:
      return '';
  }
}
