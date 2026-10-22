import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { DsfrReadyStep } from '@tutorial/src/components/steps/DsfrReadyStep';
import { EndStep } from '@tutorial/src/components/steps/EndStep';
import { FigmaPluginStep } from '@tutorial/src/components/steps/FigmaPluginStep';
import { ImportFileStep, ImportFileStepProps } from '@tutorial/src/components/steps/ImportFileStep';
import { OptionalFilesStep } from '@tutorial/src/components/steps/OptionalFilesStep';
import { PrepareWorkspaceStep } from '@tutorial/src/components/steps/PrepareWorkspaceStep';
import { WelcomeStep } from '@tutorial/src/components/steps/WelcomeStep';
import { getFilePatchPlan, getLibraryFileIds } from '@tutorial/src/components/tutorial/model';
import { dsfrFiles } from '@tutorial/src/config/dsfr-files';
import { releaseFixture, userLibraryUrlsFixture } from '@tutorial/src/fixtures/release';

const meta = {
  title: 'Steps',
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Welcome: Story = {
  render: () => (
    <WelcomeStep
      release={releaseFixture}
      fileKeys={['pictogrammes', 'fondamentaux', 'composants', 'modeles', 'beta']}
      dsfrVersion={null}
      onDsfrVersionChange={fn()}
    />
  ),
};

export const WelcomeOutdatedVersion: Story = {
  render: () => (
    <WelcomeStep
      release={releaseFixture}
      fileKeys={['pictogrammes', 'fondamentaux', 'composants', 'modeles', 'beta']}
      dsfrVersion="1.12"
      onDsfrVersionChange={fn()}
    />
  ),
};

export const PrepareWorkspace: Story = {
  render: () => <PrepareWorkspaceStep />,
};

const importComposantsProps: ImportFileStepProps = {
  file: dsfrFiles.composants,
  releaseFile: releaseFixture.files.composants!,
  plan: getFilePatchPlan('composants', releaseFixture, getLibraryFileIds(userLibraryUrlsFixture)),
  linkLibraries: true,
  preparation: { status: 'idle' },
  onPrepare: fn(),
  url: '',
  onUrlChange: fn(),
};

export const ImportFirstFile: Story = {
  render: () => (
    <ImportFileStep
      {...importComposantsProps}
      file={dsfrFiles.pictogrammes}
      releaseFile={releaseFixture.files.pictogrammes!}
      plan={getFilePatchPlan('pictogrammes', releaseFixture, {})}
    />
  ),
};

export const ImportDependentFile: Story = {
  render: () => <ImportFileStep {...importComposantsProps} />,
};

export const ImportDownloading: Story = {
  render: () => <ImportFileStep {...importComposantsProps} preparation={{ status: 'downloading', progress: 0.42 }} />,
};

export const ImportPatching: Story = {
  render: () => <ImportFileStep {...importComposantsProps} preparation={{ status: 'patching', progress: 0.8 }} />,
};

export const ImportReady: Story = {
  render: () => (
    <ImportFileStep
      {...importComposantsProps}
      preparation={{ status: 'ready', downloadUrl: '#', fileName: 'dsfr_composants_v1-14.penpot', replacedReferences: 37697, linkedLibraries: 2 }}
      url={userLibraryUrlsFixture.composants}
    />
  ),
};

export const ImportError: Story = {
  render: () => (
    <ImportFileStep
      {...importComposantsProps}
      preparation={{ status: 'error', message: 'le téléchargement a échoué (404 Not Found)' }}
      url="not an url"
    />
  ),
};

export const ImportWithExtraFont: Story = {
  render: () => (
    <ImportFileStep
      {...importComposantsProps}
      file={dsfrFiles.modeles}
      releaseFile={releaseFixture.files.modeles!}
      plan={getFilePatchPlan('modeles', releaseFixture, getLibraryFileIds(userLibraryUrlsFixture))}
    />
  ),
};

export const OptionalFiles: Story = {
  render: () => <OptionalFilesStep release={releaseFixture} fileKeys={['modeles', 'beta']} selectedFileKeys={['beta']} onChange={fn()} />,
};

export const DsfrReady: Story = {
  render: () => (
    <DsfrReadyStep
      libraryUrls={userLibraryUrlsFixture}
      importedFileKeys={['pictogrammes', 'fondamentaux', 'composants']}
      hasFigmaFiles={null}
      onHasFigmaFilesChange={fn()}
    />
  ),
};

export const FigmaPlugin: Story = {
  render: () => (
    <FigmaPluginStep
      release={releaseFixture}
      availableFileKeys={['pictogrammes', 'fondamentaux', 'composants', 'modeles', 'beta']}
      libraryUrls={userLibraryUrlsFixture}
      onLibraryUrlChange={fn()}
      onImportFile={fn()}
    />
  ),
};

export const End: Story = {
  render: () => <EndStep />,
};
