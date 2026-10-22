import type { Meta, StoryObj } from '@storybook/react-vite';

import { Tutorial } from '@tutorial/src/components/tutorial/Tutorial';
import { releaseFixture, userLibraryUrlsFixture } from '@tutorial/src/fixtures/release';

const meta = {
  title: 'Tutorial',
  component: Tutorial,
  args: {
    release: releaseFixture,
  },
} satisfies Meta<typeof Tutorial>;

export default meta;

type Story = StoryObj<typeof meta>;

// Each story uses its own storage key so the navigation done in one does not leak into the others
export const Start: Story = {
  args: { storageKey: 'storybook-tutorial-start' },
};

export const ImportComposants: Story = {
  args: {
    storageKey: 'storybook-tutorial-import-composants',
    initialState: {
      stepId: 'file-composants',
      libraryUrls: { pictogrammes: userLibraryUrlsFixture.pictogrammes, fondamentaux: userLibraryUrlsFixture.fondamentaux },
    },
  },
};

export const DsfrReady: Story = {
  args: {
    storageKey: 'storybook-tutorial-dsfr-ready',
    initialState: { stepId: 'dsfr-ready', libraryUrls: userLibraryUrlsFixture },
  },
};

export const FigmaPlugin: Story = {
  args: {
    storageKey: 'storybook-tutorial-figma',
    initialState: { stepId: 'figma', libraryUrls: userLibraryUrlsFixture, hasFigmaFiles: true },
  },
};
