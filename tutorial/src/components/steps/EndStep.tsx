import { fr } from '@codegouvfr/react-dsfr';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { CallOut } from '@codegouvfr/react-dsfr/CallOut';

import { dsfrDocumentationUrl, supportEmail } from '@tutorial/src/config/tutorial';

export interface EndStepProps {
  hasFigmaFiles: boolean | null;
  onChangeSituation: () => void;
}

export function EndStep({ hasFigmaFiles, onChangeSituation }: EndStepProps) {
  return (
    <>
      <h2 className={fr.cx('fr-h4')}>Utiliser le DSFR dans un nouveau fichier</h2>
      <ol>
        <li>Créez ou ouvrez le fichier de votre service dans Penpot.</li>
        <li>
          Dans le panneau de gauche, ouvrez l’onglet <strong>Ressources</strong> puis cliquez sur <strong>Bibliothèques</strong>.
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
          Pour modifier un texte d’un composant (le libellé d’un bouton…), double-cliquez dessus dans la maquette : Penpot n’a pas encore de champ de
          texte dans le panneau des propriétés.
        </li>
        <li>
          Pour changer l’icône d’un bouton, sélectionnez l’icône à l’intérieur du bouton (dans le panneau des calques), puis utilisez{' '}
          <strong>Échanger composant</strong> dans le panneau de droite et choisissez une autre icône de <em>Fondamentaux</em>. Inutile de détacher le
          bouton.
        </li>
      </ul>

      <h2 className={fr.cx('fr-h4', 'fr-mt-4w')}>Limites connues</h2>
      <ul>
        <li>
          Pour rester fluide, le fichier <em>Composants</em> ne contient pas les planches d’exemples présentant chaque composant en contexte (desktop
          et mobile). Il diffère donc du fichier Figma, mais tous les composants, en thème clair comme en thème sombre, sont présents. Pour découvrir
          le DSFR en détail, consultez{' '}
          <a href={dsfrDocumentationUrl} target="_blank" rel="noopener noreferrer">
            la documentation du Système de Design de l’État
          </a>
          .
        </li>
        <li>
          Certaines propriétés des composants Figma (afficher ou masquer un élément, modifier un texte) n’existent pas encore dans Penpot : seules les
          variantes sont proposées.
        </li>
        <li>
          Les textes peuvent parfois passer sur une ligne de plus que dans Figma, et Penpot ne sait pas encore tronquer un texte trop long avec des
          points de suspension.
        </li>
        <li>
          Le passage de vos fichiers à une nouvelle version du DSFR n’est pas encore simple : Penpot ne permet pas encore de remplacer facilement une
          bibliothèque par une autre dans des fichiers existants. Cette étape reste à éprouver, elle sera documentée au fil des évolutions de Penpot.
        </li>
      </ul>

      {/* With mockups to transfer, their step is right before this one */}
      {!hasFigmaFiles && (
        <>
          <h2 className={fr.cx('fr-h4', 'fr-mt-4w')}>Finalement, des maquettes Figma à transférer ?</h2>
          <p>Le DSFR étant déjà installé, il suffit de modifier votre situation pour passer directement au transfert de vos maquettes.</p>
          <Button priority="secondary" iconId="fr-icon-edit-line" className={fr.cx('fr-mb-4w')} onClick={onChangeSituation}>
            Modifier votre situation
          </Button>
        </>
      )}

      <CallOut title="Une question, un problème ?" iconId="fr-icon-chat-3-line" titleAs="h2" className={fr.cx('fr-mt-4w')}>
        Écrivez-nous à <a href={`mailto:${supportEmail}`}>{supportEmail}</a>, vos retours nous aident à améliorer cette expérimentation.
      </CallOut>
    </>
  );
}
