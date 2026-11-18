import type { Meta, StoryObj } from '@storybook/react-vite';

import { Tutorial } from '@tutorial/src/components/tutorial/Tutorial';
import { releaseFixture } from '@tutorial/src/fixtures/release';

const meta = {
  title: 'Tutorial',
  component: Tutorial,
  args: {
    release: releaseFixture,
    askToResume: false,
  },
} satisfies Meta<typeof Tutorial>;

export default meta;

type Story = StoryObj<typeof meta>;

// Each story uses its own storage key so the navigation done in one does not leak into the others
export const Start: Story = {
  args: { storageKey: 'storybook-tutorial-start' },
};

// What someone coming back to the tutorial with a progress sees first
export const Resume: Story = {
  args: {
    storageKey: 'storybook-tutorial-resume',
    initialState: { stepId: 'file-fondamentaux' },
    askToResume: true,
  },
};

export const ImportComposants: Story = {
  args: {
    storageKey: 'storybook-tutorial-import-composants',
    initialState: { stepId: 'file-composants' },
  },
};

// The success message of the installation is displayed on the first step after the imports
export const DsfrInstalled: Story = {
  args: {
    storageKey: 'storybook-tutorial-dsfr-installed',
    initialState: { stepId: 'end', hasFigmaFiles: false },
  },
};

export const FigmaPlugin: Story = {
  args: {
    storageKey: 'storybook-tutorial-figma',
    initialState: { stepId: 'figma', hasFigmaFiles: true, dsfrVersion: '1.15' },
  },
};
