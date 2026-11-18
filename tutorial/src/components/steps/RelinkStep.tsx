import { fr } from '@codegouvfr/react-dsfr';
import { Alert } from '@codegouvfr/react-dsfr/Alert';
import { Notice } from '@codegouvfr/react-dsfr/Notice';

import { ConsoleScript, OpenConsoleInstructions } from '@tutorial/src/components/ConsoleScript';
import { relinkCopiesScript } from '@tutorial/src/console-scripts';

export interface RelinkStepProps {
  // The version installed in Penpot, and the one of the mockups as given on the welcome step
  latestDsfrVersion: string | null;
  dsfrVersion: string | null;
}

export function RelinkStep({ latestDsfrVersion, dsfrVersion }: RelinkStepProps) {
  const isOutdated = !!latestDsfrVersion && !!dsfrVersion && dsfrVersion !== latestDsfrVersion;

  return (
    <>
      <Alert
        severity="warning"
        as="h2"
        title="Étape temporaire, en attendant l’échange de bibliothèque dans Penpot"
        className={fr.cx('fr-mb-4w')}
        description="Vos maquettes utilisent les composants de votre fichier DSFR dans Figma, qui n’est pas celui converti pour Penpot : une fois importés, leurs composants ont un lien cassé vers le DSFR. Penpot ne sait pas encore rebrancher des maquettes sur une autre bibliothèque."
      />

      <p>
        Pour réparer ces liens, un script retrouve le composant DSFR de chaque élément de vos maquettes, grâce aux identifiants de ses calques
        identiques dans toutes les copies et versions des fichiers DSFR de Figma. Il relie au passage le fichier aux bibliothèques DSFR de votre
        équipe : inutile de les ajouter vous-même dans l’onglet <strong>Ressources</strong>. Il relie aussi les textes à la police Marianne de votre
        équipe. Vos personnalisations (libellés, icônes échangées…) sont conservées.
      </p>
      <Alert
        severity="info"
        small
        className={fr.cx('fr-mb-4w')}
        description="Lancez le script avant d’ouvrir le fichier de maquettes : à la première ouverture, Penpot détache définitivement les composants dont il ne trouve pas la bibliothèque. Si vous l’avez déjà ouvert, supprimez-le et importez-le à nouveau."
      />

      <h2 className={fr.cx('fr-h4', 'fr-mt-4w')}>1. Exécuter le script</h2>
      <ol>
        <li>Dans Penpot, ouvrez le tableau de bord de l’équipe où vous avez importé le DSFR et vos maquettes, sans ouvrir de fichier.</li>
        <OpenConsoleInstructions />
        <li>
          Le navigateur vous demande alors, dans deux fenêtres successives :
          <ul>
            <li>le numéro de votre fichier de maquettes ;</li>
            <li>
              les numéros des bibliothèques à relier, séparés par des virgules. La version la plus récente des fichiers du DSFR est proposée :
              ajoutez-y vos propres bibliothèques si vos maquettes en utilisent.
            </li>
          </ul>
        </li>
        <li>
          Patientez jusqu’au message <strong>« Terminé : vous pouvez ouvrir le fichier »</strong>, en général moins d’une minute : le plus long est le
          chargement des bibliothèques DSFR. Gardez l’onglet ouvert pendant ce temps.
        </li>
      </ol>

      <ConsoleScript script={relinkCopiesScript} />

      <h2 className={fr.cx('fr-h4')}>2. Vérifier le résultat</h2>
      <p>La console indique le nombre de composants reliés, puis signale ceux qui demandent votre attention :</p>
      <ul>
        <li>
          <strong>« relié à … (nom différent) »</strong> ou <strong>« relié par son nom »</strong> : vérifiez dans le fichier que le bon composant a
          été retenu ;
        </li>
        <li>
          les éléments <strong>« 🚫 »</strong> détachés sont des repères internes aux fichiers DSFR de Figma (grilles…), absents du DSFR pour Penpot,
          rien à faire ;
        </li>
        <li>
          <strong>« non relié, détaché »</strong> : ces éléments gardent leur apparence mais ne sont plus des composants, remplacez-les par leur
          équivalent du DSFR si besoin.
        </li>
      </ul>
      <p>
        Ouvrez ensuite le fichier : un clic droit sur un composant DSFR doit proposer <strong>Afficher le composant principal</strong>. Pour remplacer
        un composant par un autre, sélectionnez-le et utilisez <strong>Échanger composant</strong> dans le panneau de droite.
      </p>
      <p>
        Si Penpot affiche « <strong>Il y a des mises à jour dans les Bibliothèques Partagées</strong> », cliquez sur <strong>Mettre à jour</strong>.
      </p>

      <h2 className={fr.cx('fr-h4', 'fr-mt-4w')}>Apparence des composants</h2>
      <p>
        Les composants gardent l’apparence qu’ils avaient dans Figma, même une fois reliés à la version du DSFR installée : Penpot ne met à jour une
        copie de composant que lorsque sa bibliothèque change après coup.
        {isOutdated && (
          <>
            {' '}
            Vos maquettes utilisant la v{dsfrVersion}, leurs composants peuvent donc différer de la v{latestDsfrVersion} installée.
          </>
        )}{' '}
        Pour donner à un composant l’apparence de la version installée, faites un clic droit dessus puis <strong>Annuler les modifications</strong> :
        attention, ses personnalisations (libellé, icône…) sont alors perdues.
      </p>
      {isOutdated && (
        <Notice
          className={fr.cx('fr-mb-2w')}
          title={`Les composants retirés ou fortement remaniés entre la v${dsfrVersion} et la v${latestDsfrVersion} peuvent ne pas être reliés : vérifiez-les une fois le fichier ouvert.`}
        />
      )}
    </>
  );
}
