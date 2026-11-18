import { fr } from '@codegouvfr/react-dsfr';
import { Accordion } from '@codegouvfr/react-dsfr/Accordion';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { useEffect, useRef, useState } from 'react';

export interface ConsoleScriptProps {
  // Source code of the script to paste into the browser console
  script: string;
}

// Copy button and readable source of a script the user pastes into the browser console
export function ConsoleScript({ script }: ConsoleScriptProps) {
  const codeRef = useRef<HTMLPreElement>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  // Incremented on each successful copy, so a new click shows the confirmation for the full duration again
  const [copyCount, setCopyCount] = useState(0);
  const [isCodeExpanded, setIsCodeExpanded] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(script);
      setCopyState('copied');
      setCopyCount((count) => count + 1);
    } catch {
      // The clipboard can be refused (iframe without the permission, old browser): the code is shown and selected to be copied by hand
      setCopyState('failed');
      setIsCodeExpanded(true);
    }
  };

  // The confirmation is only a short feedback next to the button
  useEffect(() => {
    if (copyState !== 'copied') return;
    const timeout = setTimeout(() => setCopyState('idle'), 4000);
    return () => clearTimeout(timeout);
  }, [copyState, copyCount]);

  useEffect(() => {
    const selection = window.getSelection();
    if (copyState === 'failed' && isCodeExpanded && codeRef.current && selection) {
      selection.selectAllChildren(codeRef.current);
    }
  }, [copyState, isCodeExpanded]);

  return (
    <>
      <div className={fr.cx('fr-mt-2w', 'fr-mb-3w')} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem 1rem' }}>
        <Button iconId="fr-icon-clipboard-line" priority="secondary" onClick={copy}>
          Copier le script
        </Button>
        {/* Always rendered so screen readers announce its changes */}
        <span role="status" className={fr.cx('fr-text--sm', 'fr-mb-0')}>
          {copyState === 'copied' && (
            <span style={{ color: fr.colors.decisions.text.default.success.default }}>
              <span className={fr.cx('fr-icon-check-line', 'fr-icon--sm', 'fr-mr-1v')} aria-hidden="true" />
              Script copié, collez-le dans la console
            </span>
          )}
          {copyState === 'failed' &&
            'La copie automatique n’est pas disponible : le script est sélectionné ci-dessous, copiez-le avec Ctrl + C (Cmd + C sous macOS).'}
        </span>
      </div>

      <Accordion
        label="Voir le script"
        className={fr.cx('fr-mb-4w')}
        expanded={isCodeExpanded}
        onExpandedChange={(expanded) => setIsCodeExpanded(expanded)}
      >
        <p className={fr.cx('fr-text--sm')}>
          Coller du code dans la console donne accès à votre compte : ne le faites qu’avec un code de confiance. Celui-ci n’échange qu’avec votre
          instance Penpot, et vous pouvez le relire ci-dessous.
        </p>
        <pre
          ref={codeRef}
          style={{
            maxHeight: '24rem',
            overflow: 'auto',
            padding: '1rem',
            fontSize: '0.75rem',
            background: fr.colors.decisions.background.alt.grey.default,
          }}
        >
          <code>{script}</code>
        </pre>
      </Accordion>
    </>
  );
}

// Shared instructions to open the console and paste a script
export function OpenConsoleInstructions() {
  return (
    <>
      <li>
        Ouvrez la console de votre navigateur : <kbd>F12</kbd> puis l’onglet <strong>Console</strong>. Sous macOS, utilisez{' '}
        <kbd style={{ whiteSpace: 'nowrap' }}>Cmd + Option + J</kbd> avec les navigateurs Chrome et Edge, ou{' '}
        <kbd style={{ whiteSpace: 'nowrap' }}>Cmd + Option + K</kbd> avec Firefox.
      </li>
      <li>
        Copiez le script avec le bouton ci-dessous, collez-le dans la console et appuyez sur <kbd>Entrée</kbd>. La première fois, le navigateur peut
        bloquer le collage et demander de saisir une phrase (par exemple <code>autoriser le collage</code> ou <code>allow pasting</code>) : saisissez
        celle indiquée, puis collez à nouveau.
      </li>
    </>
  );
}
