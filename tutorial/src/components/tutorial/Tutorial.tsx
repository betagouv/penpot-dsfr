import { fr } from '@codegouvfr/react-dsfr';
import { ButtonProps } from '@codegouvfr/react-dsfr/Button';
import { ButtonsGroup } from '@codegouvfr/react-dsfr/ButtonsGroup';
import { Stepper } from '@codegouvfr/react-dsfr/Stepper';
import { ReactNode, useEffect, useMemo, useRef } from 'react';

import { DsfrReadyStep } from '@tutorial/src/components/steps/DsfrReadyStep';
import { EndStep } from '@tutorial/src/components/steps/EndStep';
import { FigmaPluginStep } from '@tutorial/src/components/steps/FigmaPluginStep';
import { ImportFileStep } from '@tutorial/src/components/steps/ImportFileStep';
import { OptionalFilesStep } from '@tutorial/src/components/steps/OptionalFilesStep';
import { PrepareWorkspaceStep } from '@tutorial/src/components/steps/PrepareWorkspaceStep';
import { WelcomeStep } from '@tutorial/src/components/steps/WelcomeStep';
import {
  StepId,
  TutorialState,
  getAvailableFileKeys,
  getFileKeyFromStepId,
  getFilePatchPlan,
  getLibraryFileIds,
  getPhases,
  getStepPhase,
  getStepTitle,
  getSteps,
  initialTutorialState,
  toFileStepId,
} from '@tutorial/src/components/tutorial/model';
import { DsfrFileKey, dsfrFiles } from '@tutorial/src/config/dsfr-files';
import { Release, getDsfrVersion } from '@tutorial/src/config/release';
import { linkLibrariesAtImport } from '@tutorial/src/config/tutorial';
import { useArchivePreparation } from '@tutorial/src/hooks/useArchivePreparation';
import { useLocalStorageState } from '@tutorial/src/hooks/useLocalStorageState';
import { parsePenpotUrl } from '@tutorial/src/utils/penpot-url';

export interface TutorialProps {
  release: Release;
  // Allows Storybook to start from a given state without polluting the browser storage of the real tutorial
  storageKey?: string;
  initialState?: Partial<TutorialState>;
}

export function Tutorial({ release, storageKey = 'penpot-dsfr-tutorial', initialState }: TutorialProps) {
  const [state, setState] = useLocalStorageState<TutorialState>(storageKey, { ...initialTutorialState, ...initialState });
  const { preparation, prepare, reset } = useArchivePreparation();
  const titleRef = useRef<HTMLDivElement>(null);

  const availableFileKeys = useMemo(() => getAvailableFileKeys(release), [release]);
  const optionalFileKeys = availableFileKeys.filter((key) => dsfrFiles[key].optional);
  const steps = getSteps(state, release);
  // A stored step may not exist anymore (new release without a file...)
  const stepId: StepId = steps.includes(state.stepId) ? state.stepId : steps[0];
  const stepIndex = steps.indexOf(stepId);
  const phases = getPhases(steps);
  const fileKey = getFileKeyFromStepId(stepId);
  const libraryFileIds = getLibraryFileIds(state.libraryUrls);
  const importedFileKeys = availableFileKeys.filter((key) => !!libraryFileIds[key]);
  const latestDsfrVersion = getDsfrVersion(release);

  // The preparation is specific to a file step
  useEffect(() => {
    reset();
  }, [stepId, reset]);

  const goTo = (nextStepId: StepId) => {
    setState((previousState) => ({ ...previousState, stepId: nextStepId }));
    // Make sure the user sees the top of the new step, and screen readers announce it
    titleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    titleRef.current?.focus({ preventScroll: true });
  };

  const setLibraryUrl = (key: DsfrFileKey, url: string) => {
    setState((previousState) => ({ ...previousState, libraryUrls: { ...previousState.libraryUrls, [key]: url } }));
  };

  const getUrlWarning = (key: DsfrFileKey) => (fileId: string, teamId: string | null, origin: string) => {
    for (const otherKey of availableFileKeys) {
      if (otherKey === key) {
        continue;
      }

      const otherResult = parsePenpotUrl(state.libraryUrls[otherKey] ?? '');
      if (!otherResult.success) {
        continue;
      }

      if (otherResult.fileId === fileId) {
        return `Cette adresse est déjà celle du fichier « ${dsfrFiles[otherKey].label} », vérifiez que vous avez ouvert le bon fichier.`;
      } else if (otherResult.origin !== origin || (otherResult.teamId && teamId && otherResult.teamId !== teamId)) {
        return `Ce fichier ne semble pas être dans la même équipe Penpot que « ${dsfrFiles[otherKey].label} » : les bibliothèques ne pourront pas être reliées entre elles.`;
      }
    }

    return null;
  };

  let content: ReactNode;
  let canGoNext = true;

  if (fileKey) {
    const releaseFile = release.files[fileKey]!;
    const plan = getFilePatchPlan(fileKey, release, libraryFileIds);

    canGoNext = !!libraryFileIds[fileKey];
    content = (
      <ImportFileStep
        file={dsfrFiles[fileKey]}
        releaseFile={releaseFile}
        plan={plan}
        linkLibraries={linkLibrariesAtImport}
        preparation={preparation}
        onPrepare={() =>
          prepare({
            url: releaseFile.path,
            fileName: releaseFile.assetName,
            fileIdReplacements: plan.fileIdReplacements,
            linkLibraries: linkLibrariesAtImport,
          })
        }
        url={state.libraryUrls[fileKey] ?? ''}
        onUrlChange={(url) => setLibraryUrl(fileKey, url)}
        getUrlWarning={getUrlWarning(fileKey)}
      />
    );
  } else {
    switch (stepId) {
      case 'welcome':
        // When the version cannot be read from the release, there is nothing to compare with
        canGoNext = !latestDsfrVersion || state.dsfrVersion === latestDsfrVersion;
        content = (
          <WelcomeStep
            release={release}
            fileKeys={availableFileKeys}
            dsfrVersion={state.dsfrVersion}
            onDsfrVersionChange={(dsfrVersion) => setState((previousState) => ({ ...previousState, dsfrVersion }))}
          />
        );
        break;
      case 'prepare':
        content = <PrepareWorkspaceStep />;
        break;
      case 'optional-files':
        content = (
          <OptionalFilesStep
            release={release}
            fileKeys={optionalFileKeys}
            selectedFileKeys={state.optionalFiles}
            onChange={(optionalFiles) => setState((previousState) => ({ ...previousState, optionalFiles }))}
          />
        );
        break;
      case 'dsfr-ready':
        canGoNext = state.hasFigmaFiles !== null;
        content = (
          <DsfrReadyStep
            libraryUrls={state.libraryUrls}
            importedFileKeys={importedFileKeys}
            hasFigmaFiles={state.hasFigmaFiles}
            onHasFigmaFilesChange={(hasFigmaFiles) => setState((previousState) => ({ ...previousState, hasFigmaFiles }))}
          />
        );
        break;
      case 'figma':
        content = (
          <FigmaPluginStep
            release={release}
            availableFileKeys={availableFileKeys}
            libraryUrls={state.libraryUrls}
            onLibraryUrlChange={setLibraryUrl}
            onImportFile={(key) => {
              setState((previousState) => ({
                ...previousState,
                optionalFiles: dsfrFiles[key].optional ? Array.from(new Set([...previousState.optionalFiles, key])) : previousState.optionalFiles,
              }));
              goTo(toFileStepId(key));
            }}
          />
        );
        break;
      default:
        content = <EndStep />;
    }
  }

  const isLastStep = stepIndex === steps.length - 1;
  const buttons: [ButtonProps, ...ButtonProps[]] = [
    isLastStep
      ? {
          children: 'Recommencer le parcours',
          priority: 'secondary',
          iconId: 'fr-icon-refresh-line',
          onClick: () => {
            // Addresses are kept since the libraries are still in the Penpot workspace
            setState((previousState) => ({ ...initialTutorialState, libraryUrls: previousState.libraryUrls }));
            goTo('welcome');
          },
        }
      : {
          children: stepId === 'welcome' ? 'Commencer' : 'Étape suivante',
          iconId: 'fr-icon-arrow-right-line',
          iconPosition: 'right',
          disabled: !canGoNext,
          onClick: () => goTo(steps[stepIndex + 1]),
        },
  ];

  if (stepIndex > 0) {
    buttons.unshift({
      children: 'Étape précédente',
      priority: 'secondary',
      iconId: 'fr-icon-arrow-left-line',
      onClick: () => goTo(steps[stepIndex - 1]),
    });
  }

  return (
    <div>
      <div ref={titleRef} tabIndex={-1} style={{ outline: 'none', scrollMarginTop: '1rem' }}>
        <Stepper
          currentStep={phases.indexOf(getStepPhase(stepId)) + 1}
          stepCount={phases.length}
          title={getStepTitle(stepId)}
          nextTitle={!isLastStep ? getStepTitle(steps[stepIndex + 1]) : undefined}
        />
      </div>
      {/* The key resets the internal state of fields when switching from one file step to another */}
      <div key={stepId} className={fr.cx('fr-mb-4w')}>
        {content}
      </div>
      {!canGoNext && (fileKey || (stepId === 'welcome' && state.dsfrVersion === null)) && (
        <p className={fr.cx('fr-text--sm')} style={{ color: fr.colors.decisions.text.mention.grey.default }}>
          {fileKey ? 'Indiquez l’adresse du fichier importé pour passer à l’étape suivante.' : 'Sélectionnez votre version du DSFR pour commencer.'}
        </p>
      )}
      <ButtonsGroup inlineLayoutWhen="sm and up" alignment="between" buttons={buttons} />
    </div>
  );
}
