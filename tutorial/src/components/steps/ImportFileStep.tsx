import { fr } from '@codegouvfr/react-dsfr';
import { Alert } from '@codegouvfr/react-dsfr/Alert';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { Notice } from '@codegouvfr/react-dsfr/Notice';

import { PenpotUrlInput, PenpotUrlInputProps } from '@tutorial/src/components/PenpotUrlInput';
import { ProgressBar } from '@tutorial/src/components/ProgressBar';
import { FilePatchPlan } from '@tutorial/src/components/tutorial/model';
import { DsfrFileDefinition, dsfrFiles } from '@tutorial/src/config/dsfr-files';
import { ReleaseFile } from '@tutorial/src/config/release';
import { ArchivePreparation } from '@tutorial/src/hooks/useArchivePreparation';
import { formatFileSize, formatList } from '@tutorial/src/utils/format';

export interface ImportFileStepProps {
  file: DsfrFileDefinition;
  releaseFile: ReleaseFile;
  plan: FilePatchPlan;
  linkLibraries: boolean;
  preparation: ArchivePreparation;
  onPrepare: () => void;
  url: string;
  onUrlChange: (url: string) => void;
  getUrlWarning?: PenpotUrlInputProps['getWarning'];
}

const labels = (keys: FilePatchPlan['linkedReferences']) => formatList(keys.map((key) => `« ${dsfrFiles[key].label} »`));

function DownloadSection({ file, releaseFile, plan, preparation, onPrepare }: ImportFileStepProps) {
  const size = formatFileSize(releaseFile.size);

  switch (preparation.status) {
    case 'downloading':
      return <ProgressBar label={`Téléchargement du fichier « ${file.label} » (${size})`} value={preparation.progress} />;
    case 'patching':
      return <ProgressBar label="Adaptation du fichier à votre espace Penpot" value={preparation.progress} />;
    case 'ready':
      return (
        <Alert
          severity="success"
          small
          description={
            <>
              Le téléchargement de <code>{preparation.fileName}</code> a démarré.{' '}
              {preparation.replacedReferences > 0 &&
                `${preparation.replacedReferences.toLocaleString('fr-FR')} références ont été reliées à vos fichiers. `}
              Si rien ne se passe,{' '}
              <a href={preparation.downloadUrl} download={preparation.fileName}>
                téléchargez-le à nouveau
              </a>
              .
            </>
          }
        />
      );
    case 'error':
      return (
        <Alert
          severity="error"
          title="Le fichier n’a pas pu être préparé"
          description={
            <>
              <p>Détail : {preparation.message}</p>
              <p>
                Vous pouvez réessayer, ou{' '}
                <a href={releaseFile.downloadUrl} target="_blank" rel="noopener noreferrer">
                  télécharger le fichier d’origine
                </a>{' '}
                : il fonctionnera mais ses éléments ne seront pas reliés à vos autres bibliothèques.
              </p>
              <Button priority="secondary" size="small" iconId="fr-icon-refresh-line" onClick={onPrepare}>
                Réessayer
              </Button>
            </>
          }
        />
      );
    default:
      return (
        <Button iconId="fr-icon-download-line" iconPosition="left" onClick={onPrepare}>
          {plan.linkedReferences.length > 0 ? `Préparer et télécharger « ${file.label} »` : `Télécharger « ${file.label} »`} ({size})
        </Button>
      );
  }
}

export function ImportFileStep(props: ImportFileStepProps) {
  const { file, releaseFile, plan, linkLibraries, url, onUrlChange, getUrlWarning } = props;

  return (
    <>
      <p>{file.description}</p>

      <h2 className={fr.cx('fr-h4', 'fr-mt-4w')}>1. Télécharger le fichier</h2>
      {plan.linkedReferences.length > 0 ? (
        <p>
          Ce fichier utilise des éléments de {labels(plan.linkedReferences)}. Il va être adapté directement dans votre navigateur pour pointer vers
          les fichiers de votre espace Penpot{linkLibraries && ', qui seront aussi connectés automatiquement comme bibliothèques'}.
        </p>
      ) : (
        <p>Ce fichier peut être importé tel quel.</p>
      )}
      {plan.missingReferences.length > 0 && (
        <Notice
          className={fr.cx('fr-mb-2w')}
          title={`Ce fichier utilise aussi ${labels(plan.missingReferences)}, pas encore importé : les éléments concernés resteront visibles mais sans lien vers cette bibliothèque.`}
        />
      )}
      <DownloadSection {...props} />

      <h2 className={fr.cx('fr-h4', 'fr-mt-4w')}>2. L’importer dans Penpot</h2>
      <ol>
        <li>
          Dans Penpot, survolez votre projet <code>DSFR</code> et cliquez sur le bouton d’options <strong>…</strong> qui apparaît.
        </li>
        <li>
          Choisissez <strong>Importer des fichiers Penpot</strong> (<em>Import Penpot files</em>), sélectionnez le fichier téléchargé et validez.
          {releaseFile.size > 50 * 1024 * 1024 && ' Ce fichier est volumineux, l’import peut prendre plusieurs minutes.'}
        </li>
        <li>
          Une fois importé, faites un clic droit sur le fichier <strong>{releaseFile.fileName}</strong> et choisissez{' '}
          <strong>Ajouter en tant que bibliothèque partagée</strong> (<em>Add as Shared Library</em>).
        </li>
      </ol>
      {file.extraFonts && file.extraFonts.length > 0 && (
        <Notice
          className={fr.cx('fr-mb-2w')}
          title={`Ce fichier utilise aussi la police ${formatList(file.extraFonts)}. Ajoutez-la à votre équipe depuis les polices de votre ordinateur (variantes Regular, Italic, Bold et Bold Italic) pour un affichage correct.`}
        />
      )}

      <h2 className={fr.cx('fr-h4', 'fr-mt-4w')}>3. Nous indiquer son adresse</h2>
      <p>
        Ouvrez le fichier importé dans Penpot et copiez l’adresse affichée dans la barre de votre navigateur. Elle permettra de relier les prochains
        fichiers à celui-ci.
      </p>
      <PenpotUrlInput label={`Adresse du fichier « ${file.label} » dans Penpot`} value={url} onChange={onUrlChange} getWarning={getUrlWarning} />
    </>
  );
}
