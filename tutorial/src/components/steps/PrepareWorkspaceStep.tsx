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
          Dans Penpot, depuis le tableau de bord de votre équipe, ouvrez la section <strong>Polices</strong> du panneau de gauche.
        </li>
        <li>
          Cliquez sur <strong>Ajouter une police personnalisée</strong> et sélectionnez les 12 variantes.
        </li>
        <li>
          Une fois les variantes listées comme « en attente », cliquez sur <strong>Tout téléverser</strong>.
        </li>
      </ol>

      <h2 className={fr.cx('fr-h4', 'fr-mt-4w')}>2. Créer un projet dédié</h2>
      <p>
        Dans la section <strong>Projets</strong>, créez un nouveau projet nommé par exemple <code>DSFR</code>. Il accueillera les fichiers que vous
        allez importer.
      </p>
      <Notice
        className={fr.cx('fr-mt-2w')}
        title="La police, le projet et les fichiers du DSFR sont partagés par toute votre équipe Penpot : cette installation n’est à faire qu’une seule fois par équipe."
      />

      <h2 className={fr.cx('fr-h4', 'fr-mt-4w')}>3. Activer le nouveau moteur de rendu</h2>
      <p>
        Penpot propose un nouveau moteur de rendu, bien plus fluide sur les fichiers volumineux comme ceux du DSFR. Il est aussi nécessaire pour
        afficher certains éléments correctement, par exemple les bordures d’un seul côté des champs de formulaire.
      </p>
      <ol>
        <li>
          Depuis le tableau de bord de votre instance Penpot, ouvrez le menu de votre profil en bas à gauche, puis <strong>Votre compte</strong>.
        </li>
        <li>
          Allez dans <strong>Configuration</strong>, section <strong>Rendu WebGL</strong>, et activez-le.
        </li>
      </ol>
      <p className={fr.cx('fr-text--sm')}>
        Contrairement aux étapes précédentes, ce réglage est propre à chaque personne : invitez les membres de votre équipe à l’activer aussi.
      </p>
    </>
  );
}
