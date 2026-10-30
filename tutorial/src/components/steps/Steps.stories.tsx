import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { EndStep } from '@tutorial/src/components/steps/EndStep';
import { FigmaPluginStep } from '@tutorial/src/components/steps/FigmaPluginStep';
import { ImportFileStep } from '@tutorial/src/components/steps/ImportFileStep';
import { OptionalFilesStep } from '@tutorial/src/components/steps/OptionalFilesStep';
import { PrepareWorkspaceStep } from '@tutorial/src/components/steps/PrepareWorkspaceStep';
import { WelcomeStep } from '@tutorial/src/components/steps/WelcomeStep';
import { dsfrFiles } from '@tutorial/src/config/dsfr-files';
import { releaseFixture } from '@tutorial/src/fixtures/release';

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
      hasFigmaFiles={null}
      onHasFigmaFilesChange={fn()}
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
      hasFigmaFiles={true}
      onHasFigmaFilesChange={fn()}
      dsfrVersion="1.12"
      onDsfrVersionChange={fn()}
    />
  ),
};

export const PrepareWorkspace: Story = {
  render: () => <PrepareWorkspaceStep />,
};

export const ImportFirstFile: Story = {
  render: () => <ImportFileStep file={dsfrFiles.pictogrammes} releaseFile={releaseFixture.files.pictogrammes!} previousFileKeys={[]} />,
};

export const ImportDependentFile: Story = {
  render: () => (
    <ImportFileStep file={dsfrFiles.composants} releaseFile={releaseFixture.files.composants!} previousFileKeys={['pictogrammes', 'fondamentaux']} />
  ),
};

export const ImportWithExtraFont: Story = {
  render: () => (
    <ImportFileStep
      file={dsfrFiles.modeles}
      releaseFile={releaseFixture.files.modeles!}
      previousFileKeys={['pictogrammes', 'fondamentaux', 'composants']}
    />
  ),
};

export const OptionalFiles: Story = {
  render: () => <OptionalFilesStep release={releaseFixture} fileKeys={['modeles', 'beta']} selectedFileKeys={['beta']} onChange={fn()} />,
};

export const FigmaPlugin: Story = {
  render: () => (
    <FigmaPluginStep
      release={releaseFixture}
      latestDsfrVersion="1.15"
      dsfrVersion="1.15"
      importedFileKeys={['pictogrammes', 'fondamentaux', 'composants', 'beta']}
      notImportedFileKeys={['modeles']}
      onImportFile={fn()}
    />
  ),
};

export const FigmaPluginOutdatedVersion: Story = {
  render: () => (
    <FigmaPluginStep
      release={releaseFixture}
      latestDsfrVersion="1.15"
      dsfrVersion="1.12"
      importedFileKeys={['pictogrammes', 'fondamentaux', 'composants']}
      notImportedFileKeys={[]}
      onImportFile={fn()}
    />
  ),
};

export const End: Story = {
  render: () => <EndStep />,
};
