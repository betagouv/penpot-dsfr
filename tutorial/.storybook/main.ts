import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  // Serves the DSFR assets copied by `react-dsfr copy-static-assets` (not the whole `public` folder that contains heavy release files)
  staticDirs: [{ from: '../public/dsfr', to: '/dsfr' }],
  // The Vite configuration of the application would otherwise copy the whole `public` folder too
  viteFinal: (config) => ({ ...config, publicDir: false }),
};

export default config;
