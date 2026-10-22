import { DsfrFileKey, dsfrFileKeys, dsfrFiles } from '@tutorial/src/config/dsfr-files';
import { Release } from '@tutorial/src/config/release';
import { parsePenpotUrl } from '@tutorial/src/utils/penpot-url';

export type FileStepId = `file-${DsfrFileKey}`;
export type StepId = 'welcome' | 'prepare' | 'optional-files' | 'dsfr-ready' | 'figma' | 'end' | FileStepId;

export interface TutorialState {
  stepId: StepId;
  libraryUrls: Partial<Record<DsfrFileKey, string>>;
  optionalFiles: DsfrFileKey[];
  hasFigmaFiles: boolean | null;
  // Figma mockups must use the exact DSFR version converted for Penpot, otherwise their components cannot be bound
  dsfrVersion: string | null;
}

export const initialTutorialState: TutorialState = {
  stepId: 'welcome',
  libraryUrls: {},
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
    'dsfr-ready',
    ...(state.hasFigmaFiles ? (['figma'] as const) : []),
    'end',
  ];
}

export function getLibraryFileIds(libraryUrls: TutorialState['libraryUrls']): Partial<Record<DsfrFileKey, string>> {
  const fileIds: Partial<Record<DsfrFileKey, string>> = {};

  for (const key of dsfrFileKeys) {
    const url = libraryUrls[key];
    const result = url ? parsePenpotUrl(url) : null;

    if (result?.success) {
      fileIds[key] = result.fileId;
    }
  }

  return fileIds;
}

export interface FilePatchPlan {
  fileIdReplacements: Record<string, string>;
  // Libraries referenced by the file that are already in the user workspace
  linkedReferences: DsfrFileKey[];
  // Libraries referenced by the file but not imported yet by the user (their elements will not be bound)
  missingReferences: DsfrFileKey[];
}

export function getFilePatchPlan(key: DsfrFileKey, release: Release, libraryFileIds: Partial<Record<DsfrFileKey, string>>): FilePatchPlan {
  const plan: FilePatchPlan = { fileIdReplacements: {}, linkedReferences: [], missingReferences: [] };

  for (const reference of release.files[key]?.references ?? []) {
    const referencedFile = release.files[reference];
    const userFileId = libraryFileIds[reference];

    if (referencedFile && userFileId) {
      plan.fileIdReplacements[referencedFile.fileId] = userFileId;
      plan.linkedReferences.push(reference);
    } else {
      plan.missingReferences.push(reference);
    }
  }

  return plan;
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
    case 'dsfr-ready':
    case 'figma':
      return 'Maquettes existantes';
    default:
      return 'Conception';
  }
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
    case 'dsfr-ready':
      return 'Le DSFR est installé';
    case 'figma':
      return 'Transférer vos maquettes Figma';
    case 'end':
      return 'Commencer à concevoir';
    default:
      return '';
  }
}
