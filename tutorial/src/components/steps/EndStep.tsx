import { fr } from '@codegouvfr/react-dsfr';
import { CallOut } from '@codegouvfr/react-dsfr/CallOut';

import { dsfrDocumentationUrl, supportEmail } from '@tutorial/src/config/tutorial';

export function EndStep() {
  return (
    <>
      <h2 className={fr.cx('fr-h4')}>Utiliser le DSFR dans un nouveau fichier</h2>
      <ol>
        <li>Créez ou ouvrez le fichier de votre service dans Penpot.</li>
        <li>
          Dans le panneau de gauche, ouvrez l’onglet <strong>Ressources</strong> (<em>Assets</em>) puis cliquez sur <strong>Bibliothèques</strong> (
          <em>Libraries</em>).
        </li>
        <li>
          Cliquez sur <strong>+</strong> en face des bibliothèques <em>Composants</em>, <em>Fondamentaux</em> et <em>Pictogrammes</em>.
        </li>
        <li>
          Recherchez un composant (par exemple <code>bouton</code>) et glissez-le dans votre maquette. Les composants sont nommés en français : «
          En-tête », « Pied de page »…
        </li>
      </ol>

      <h2 className={fr.cx('fr-h4', 'fr-mt-4w')}>Bonnes pratiques</h2>
      <ul>
        <li>
          Évitez d’ouvrir directement les fichiers <em>Composants</em> et <em>Fondamentaux</em> : utilisez-les comme bibliothèques, Penpot sera bien
          plus fluide.
        </li>
        <li>
          Certains éléments du thème sombre et certaines déclinaisons ont été retirés pour alléger les fichiers. Pour découvrir le DSFR en détail,
          consultez{' '}
          <a href={dsfrDocumentationUrl} target="_blank" rel="noopener noreferrer">
            la documentation du Système de Design de l’État
          </a>
          .
        </li>
      </ul>

      <CallOut title="Une question, un problème ?" iconId="fr-icon-chat-3-line" titleAs="h2">
        Écrivez-nous à <a href={`mailto:${supportEmail}`}>{supportEmail}</a>, vos retours nous aident à améliorer cette expérimentation.
      </CallOut>
    </>
  );
}
