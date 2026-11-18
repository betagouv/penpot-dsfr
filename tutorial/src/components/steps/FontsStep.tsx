import { fr } from '@codegouvfr/react-dsfr';
import { Alert } from '@codegouvfr/react-dsfr/Alert';

import { ConsoleScript, OpenConsoleInstructions } from '@tutorial/src/components/ConsoleScript';
import { relinkFontsScript } from '@tutorial/src/console-scripts';

export function FontsStep() {
  return (
    <>
      <Alert
        severity="warning"
        as="h2"
        title="Étape temporaire, en attendant une correction dans Penpot"
        className={fr.cx('fr-mb-4w')}
        description="Chaque équipe Penpot a sa propre police Marianne : une fois importés, les textes des fichiers du DSFR ont donc un lien cassé vers la police et s’affichent en « Police supprimée ». Penpot ne répare ce lien qu’au fil de l’ouverture de chaque page, jamais dans les bibliothèques que vous n’ouvrez pas."
      />

      <p>
        Pour réparer ces liens, un script relie en une fois tous les textes et typographies des fichiers de votre équipe à sa propre police Marianne.
        Il s’exécute dans votre navigateur, avec votre session Penpot, et ne remplace que l’identifiant de la police : le contenu, les styles et les
        personnalisations de vos composants sont conservés.
      </p>

      <h2 className={fr.cx('fr-h4', 'fr-mt-4w')}>1. Exécuter le script</h2>
      <ol>
        <li>Fermez les onglets où des fichiers du DSFR sont ouverts dans Penpot.</li>
        <li>Dans Penpot, ouvrez le tableau de bord de l’équipe où vous avez importé le DSFR.</li>
        <OpenConsoleInstructions />
        <li>
          Patientez jusqu’au message <strong>« Terminé : vous pouvez ouvrir vos fichiers »</strong>, 2 à 3 minutes : chaque fichier est chargé puis
          enregistré par lots, le fichier <em>Composants</em> étant le plus long. Gardez l’onglet ouvert pendant ce temps.
        </li>
      </ol>

      <ConsoleScript script={relinkFontsScript} />

      <h2 className={fr.cx('fr-h4')}>2. Vérifier le résultat</h2>
      <p>
        La console affiche, pour chaque fichier, le nombre d’éléments reliés. Si une ligne indique des <strong>polices absentes de l’équipe</strong>,
        ajoutez-les à votre équipe puis relancez le script : sans <em>Arial</em>, par exemple, seuls quelques textes des pages d’erreur du fichier{' '}
        <em>Modèles</em> s’afficheront avec une police de remplacement. Rouvrez ensuite vos fichiers : les textes du DSFR doivent utiliser la police
        Marianne.
      </p>
      <p>
        Si Penpot signale malgré tout des mises à jour des typographies de <em>Fondamentaux</em> à la réouverture d’un fichier («{' '}
        <strong>Il y a des mises à jour dans les Bibliothèques Partagées</strong> »), vous pouvez les accepter sans risque.
      </p>

      <h2 className={fr.cx('fr-h4', 'fr-mt-4w')}>À relancer si besoin</h2>
      <p>Le script peut être relancé sans risque, il ne modifie que ce qui doit l’être. Relancez-le après :</p>
      <ul>
        <li>le déplacement de fichiers vers une autre équipe ;</li>
        <li>la suppression puis le nouvel ajout de la police Marianne dans votre équipe.</li>
      </ul>
    </>
  );
}
