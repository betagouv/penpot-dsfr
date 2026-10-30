import { fr } from '@codegouvfr/react-dsfr';
import { Alert } from '@codegouvfr/react-dsfr/Alert';
import { ButtonProps } from '@codegouvfr/react-dsfr/Button';
import { ButtonsGroup } from '@codegouvfr/react-dsfr/ButtonsGroup';
import { Stepper } from '@codegouvfr/react-dsfr/Stepper';
import { ReactNode, useMemo, useRef } from 'react';

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
  getPhases,
  getStepPhase,
  getStepTitle,
  getSteps,
  initialTutorialState,
  isFirstStepAfterImports,
  toFileStepId,
} from '@tutorial/src/components/tutorial/model';
import { dsfrFiles } from '@tutorial/src/config/dsfr-files';
import { Release, getDsfrVersion } from '@tutorial/src/config/release';
import { useLocalStorageState } from '@tutorial/src/hooks/useLocalStorageState';

export interface TutorialProps {
  release: Release;
  // Allows Storybook to start from a given state without polluting the browser storage of the real tutorial
  storageKey?: string;
  initialState?: Partial<TutorialState>;
}

export function Tutorial({ release, storageKey = 'penpot-dsfr-tutorial', initialState }: TutorialProps) {
  const [state, setState] = useLocalStorageState<TutorialState>(storageKey, { ...initialTutorialState, ...initialState });
  const titleRef = useRef<HTMLDivElement>(null);

  const availableFileKeys = useMemo(() => getAvailableFileKeys(release), [release]);
  const optionalFileKeys = availableFileKeys.filter((key) => dsfrFiles[key].optional);
  const steps = getSteps(state, release);
  // A stored step may not exist anymore (new release without a file...)
  const stepId: StepId = steps.includes(state.stepId) ? state.stepId : steps[0];
  const stepIndex = steps.indexOf(stepId);
  const phases = getPhases(steps);
  const fileKey = getFileKeyFromStepId(stepId);
  // Required files are always imported, optional ones only when selected
  const importedFileKeys = availableFileKeys.filter((key) => !dsfrFiles[key].optional || state.optionalFiles.includes(key));
  const latestDsfrVersion = getDsfrVersion(release);

  const goTo = (nextStepId: StepId) => {
    setState((previousState) => ({ ...previousState, stepId: nextStepId }));
    // Make sure the user sees the top of the new step, and screen readers announce it
    titleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    titleRef.current?.focus({ preventScroll: true });
  };

  let content: ReactNode;
  let canGoNext = true;

  if (fileKey) {
    content = (
      <ImportFileStep
        file={dsfrFiles[fileKey]}
        releaseFile={release.files[fileKey]!}
        previousFileKeys={availableFileKeys.slice(0, availableFileKeys.indexOf(fileKey)).filter((key) => importedFileKeys.includes(key))}
      />
    );
  } else {
    switch (stepId) {
      case 'welcome':
        // The version only matters for mockups to transfer, and an outdated one does not block (links can be fixed in Penpot)
        canGoNext = state.hasFigmaFiles === false || (state.hasFigmaFiles === true && (!latestDsfrVersion || state.dsfrVersion !== null));
        content = (
          <WelcomeStep
            release={release}
            fileKeys={availableFileKeys}
            hasFigmaFiles={state.hasFigmaFiles}
            onHasFigmaFilesChange={(hasFigmaFiles) => setState((previousState) => ({ ...previousState, hasFigmaFiles }))}
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
      case 'figma':
        content = (
          <FigmaPluginStep
            release={release}
            latestDsfrVersion={latestDsfrVersion}
            dsfrVersion={state.dsfrVersion}
            importedFileKeys={importedFileKeys}
            notImportedFileKeys={availableFileKeys.filter((key) => !importedFileKeys.includes(key))}
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
            setState(initialTutorialState);
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
        {isFirstStepAfterImports(steps, stepId) && (
          <Alert
            severity="success"
            small
            className={fr.cx('fr-mb-4w')}
            description="Bravo, le DSFR est installé : les membres de votre équipe peuvent dès à présent utiliser ses composants, couleurs et typographies."
          />
        )}
        {content}
      </div>
      {!canGoNext && stepId === 'welcome' && (
        <p className={fr.cx('fr-text--sm')} style={{ color: fr.colors.decisions.text.mention.grey.default }}>
          {state.hasFigmaFiles === null
            ? 'Indiquez si vous avez des maquettes Figma à transférer pour commencer.'
            : 'Sélectionnez la version du DSFR de vos maquettes pour commencer.'}
        </p>
      )}
      <ButtonsGroup inlineLayoutWhen="sm and up" alignment="between" buttons={buttons} />
    </div>
  );
}
