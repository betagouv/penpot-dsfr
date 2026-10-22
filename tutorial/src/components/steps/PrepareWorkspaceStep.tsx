import { fr } from '@codegouvfr/react-dsfr';
import { Notice } from '@codegouvfr/react-dsfr/Notice';

import { marianneFontUrl } from '@tutorial/src/config/tutorial';

export function PrepareWorkspaceStep() {
  return (
    <>
      <h2 className={fr.cx('fr-h4')}>1. Ajouter la police Marianne</h2>
      <p>Les fichiers du DSFR utilisent la police officielle Marianne. Elle doit être connue de votre équipe Penpot pour un affichage correct.</p>
      <ol>
        <li>
          Téléchargez les variantes de la police au format TTF en bas de la page{' '}
          <a href={marianneFontUrl} target="_blank" rel="noopener noreferrer">
            « La typographie » de la marque de l’État
          </a>
          , puis décompressez l’archive.
        </li>
        <li>
          Dans Penpot, depuis le tableau de bord de votre équipe, ouvrez la section <strong>Polices</strong> (<em>Fonts</em>) du panneau de gauche.
        </li>
        <li>
          Cliquez sur <strong>Ajouter une police personnalisée</strong> (<em>Add custom font</em>) et sélectionnez les 12 variantes.
        </li>
        <li>
          Une fois les variantes listées comme « en attente », cliquez sur <strong>Tout téléverser</strong> (<em>Upload all</em>).
        </li>
      </ol>

      <h2 className={fr.cx('fr-h4', 'fr-mt-4w')}>2. Créer un projet dédié</h2>
      <p>
        Dans la section <strong>Projets</strong>, créez un nouveau projet nommé par exemple <code>DSFR</code>. Il accueillera les fichiers que vous
        allez importer.
      </p>

      <Notice
        className={fr.cx('fr-mt-4w')}
        title="Toutes les personnes de votre équipe Penpot profiteront de cette installation, elle n’est à faire qu’une seule fois par équipe."
      />
    </>
  );
}
