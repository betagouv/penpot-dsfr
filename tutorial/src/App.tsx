import { fr } from '@codegouvfr/react-dsfr';
import { Footer } from '@codegouvfr/react-dsfr/Footer';
import { Header } from '@codegouvfr/react-dsfr/Header';

import { Tutorial } from '@tutorial/src/components/tutorial/Tutorial';
import { release } from '@tutorial/src/config/release';

// The tutorial is meant to be displayed into a modal of https://www.systeme-de-design.gouv.fr/ (through an iframe),
// in this case the website already provides the header and footer
const isEmbedded = (() => {
  try {
    return window.self !== window.top || new URLSearchParams(window.location.search).has('embedded');
  } catch {
    // Accessing `window.top` can throw with some cross-origin configurations, it means we are embedded
    return true;
  }
})();

export function App() {
  const tutorial = (
    <main id="contenu" className={fr.cx('fr-container', isEmbedded ? 'fr-py-2w' : 'fr-py-6w')}>
      <div className={fr.cx('fr-grid-row', 'fr-grid-row--center')}>
        <div className={fr.cx('fr-col-12', !isEmbedded && 'fr-col-lg-10')}>
          {!isEmbedded && <h1>Installer le DSFR sur Penpot</h1>}
          <Tutorial release={release} />
        </div>
      </div>
    </main>
  );

  if (isEmbedded) {
    return tutorial;
  }

  return (
    <>
      <Header
        brandTop={
          <>
            République
            <br />
            Française
          </>
        }
        homeLinkProps={{ href: './', title: 'Accueil - DSFR pour Penpot' }}
        serviceTitle="DSFR pour Penpot"
        serviceTagline="Installer les bibliothèques du Système de Design de l’État dans Penpot"
      />
      {tutorial}
      <Footer
        accessibility="non compliant"
        contentDescription="Expérimentation portée par beta.gouv.fr pour faciliter l’usage du Système de Design de l’État avec l’outil de conception libre Penpot."
        bottomItems={[
          {
            text: 'Code source',
            linkProps: { href: 'https://github.com/betagouv/penpot-dsfr', target: '_blank', rel: 'noopener noreferrer' },
          },
        ]}
      />
    </>
  );
}
