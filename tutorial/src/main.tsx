import { startReactDsfr } from '@codegouvfr/react-dsfr/spa';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@tutorial/src/App';

startReactDsfr({ defaultColorScheme: 'system' });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
