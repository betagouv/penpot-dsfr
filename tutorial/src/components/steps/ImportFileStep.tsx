import { fr } from '@codegouvfr/react-dsfr';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { Notice } from '@codegouvfr/react-dsfr/Notice';

import { DsfrFileDefinition, DsfrFileKey, dsfrFiles } from '@tutorial/src/config/dsfr-files';
import { ReleaseFile } from '@tutorial/src/config/release';
import { formatFileSize, formatList } from '@tutorial/src/utils/format';

export interface ImportFileStepProps {
  file: DsfrFileDefinition;
  releaseFile: ReleaseFile;
  // DSFR files imported in previous steps, the new file is linked to them by Penpot
  previousFileKeys: DsfrFileKey[];
}

export function ImportFileStep({ file, releaseFile, previousFileKeys }: ImportFileStepProps) {
  const previousLabels = formatList(previousFileKeys.map((key) => `« ${dsfrFiles[key].label} »`));

  return (
    <>
      <p>{file.description}</p>
      {file.note && <p className={fr.cx('fr-text--sm')}>{file.note}</p>}

      <h2 className={fr.cx('fr-h4', 'fr-mt-4w')}>1. Télécharger le fichier</h2>
      <Button
        iconId="fr-icon-download-line"
        iconPosition="left"
        // A new tab so the tutorial is never replaced (in its iframe too), browsers close it once the download starts
        linkProps={{ href: releaseFile.downloadUrl, download: releaseFile.assetName, target: '_blank', rel: 'noopener noreferrer' }}
      >
        Télécharger « {file.label} » ({formatFileSize(releaseFile.size)})
      </Button>

      <h2 className={fr.cx('fr-h4', 'fr-mt-4w')}>2. L’importer dans Penpot</h2>
      <ol>
        <li>
          Dans Penpot, survolez votre projet <code>DSFR</code> et cliquez sur le bouton d’options <strong>…</strong> qui apparaît.
        </li>
        <li>
          Choisissez <strong>Importer des fichiers Penpot</strong>, sélectionnez le fichier téléchargé et validez.
          {releaseFile.size > 50 * 1024 * 1024 && ' Ce fichier est volumineux, l’import peut prendre plusieurs minutes.'}
        </li>
        <li>
          Une fois importé, faites un clic droit sur le fichier <strong>{releaseFile.fileName}</strong> et choisissez{' '}
          <strong>Ajouter en tant que bibliothèque partagée</strong>.
        </li>
      </ol>

      {previousFileKeys.length > 0 ? (
        <p>
          À l’import, Penpot relie automatiquement ce fichier aux bibliothèques {previousLabels} déjà partagées dans votre équipe, en les retrouvant
          par leur nom : ne renommez pas les fichiers du DSFR. Si plusieurs bibliothèques portent le même nom dans votre équipe, Penpot vous demandera
          laquelle utiliser.
        </p>
      ) : (
        <p>Ce premier fichier ne dépend d’aucun autre. Le partager comme bibliothèque permettra aux fichiers suivants de s’y relier.</p>
      )}

      <Notice
        className={fr.cx('fr-mb-2w')}
        title="Importez un seul fichier à la fois et attendez la fin de l’import : plusieurs imports simultanés peuvent échouer. Le partage en bibliothèque est indispensable pour que les fichiers suivants puissent s’y relier."
      />
      {file.extraFonts && file.extraFonts.length > 0 && (
        <Notice
          className={fr.cx('fr-mb-2w')}
          title={`Ce fichier utilise aussi la police ${formatList(file.extraFonts)}. Propriétaire, elle ne peut pas être fournie : si elle est installée sur votre ordinateur (c’est généralement le cas sous Windows et macOS), ajoutez-la à votre équipe depuis votre dossier de polices (variantes Regular, Italic, Bold et Bold Italic). Sinon, Penpot affichera ces textes avec une police de remplacement.`}
        />
      )}
    </>
  );
}
