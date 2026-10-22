import { fr } from '@codegouvfr/react-dsfr';
import { startReactDsfr } from '@codegouvfr/react-dsfr/spa';
import type { Preview } from '@storybook/react-vite';

startReactDsfr({ defaultColorScheme: 'light' });

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className={fr.cx('fr-container', 'fr-py-4w')}>
        <Story />
      </div>
    ),
  ],
};

export default preview;
