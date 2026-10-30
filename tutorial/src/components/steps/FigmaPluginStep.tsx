import { fr } from '@codegouvfr/react-dsfr';
import { ButtonProps } from '@codegouvfr/react-dsfr/Button';
import { ButtonsGroup } from '@codegouvfr/react-dsfr/ButtonsGroup';
import { Notice } from '@codegouvfr/react-dsfr/Notice';

import figmaPluginLibrariesImage from '@tutorial/src/assets/figma-plugin-libraries.png';
import { DsfrFileKey, dsfrFiles } from '@tutorial/src/config/dsfr-files';
import { Release } from '@tutorial/src/config/release';
import { figmaPluginSourceUrl, figmaPluginUrl, supportEmail } from '@tutorial/src/config/tutorial';
import { formatList } from '@tutorial/src/utils/format';

export interface FigmaPluginStepProps {
  release: Release;
  // The version installed in Penpot, and the one of the mockups as given on the welcome step
  latestDsfrVersion: string | null;
  dsfrVersion: string | null;
  importedFileKeys: DsfrFileKey[];
  // Optional DSFR files not imported, mockups using them would lose the link to the DSFR
  notImportedFileKeys: DsfrFileKey[];
  onImportFile: (key: DsfrFileKey) => void;
}

export function FigmaPluginStep({
  release,
  latestDsfrVersion,
  dsfrVersion,
  importedFileKeys,
  notImportedFileKeys,
  onImportFile,
}: FigmaPluginStepProps) {
  const isOutdated = !!latestDsfrVersion && !!dsfrVersion && dsfrVersion !== latestDsfrVersion;

  return (
    <>
      <p>
        Le plugin Figma{' '}
        <a href={figmaPluginUrl} target="_blank" rel="noopener noreferrer">
          Penpot Exporter
        </a>{' '}
        transforme vos maquettes en fichier Penpot. En lui indiquant où se trouvent les bibliothèques DSFR dans votre espace Penpot, les composants
        utilisés dans vos maquettes resteront reliés au DSFR une fois dans Penpot.
      </p>
      <p className={fr.cx('fr-text--sm')}>
        La conversion est réalisée par le plugin dans Figma, sur votre poste, et vous importez vous-même le fichier obtenu. Ce fonctionnement dépend
        toutefois du code réellement publié : pour des maquettes très sensibles, n’hésitez pas à le vérifier, son{' '}
        <a href={figmaPluginSourceUrl} target="_blank" rel="noopener noreferrer">
          code source
        </a>{' '}
        étant ouvert.
      </p>

      <h2 className={fr.cx('fr-h4', 'fr-mt-4w')}>1. Exporter depuis Figma</h2>
      <p>
        Avant l’export, vérifiez dans le panneau <strong>Bibliothèques</strong> de Figma que votre fichier n’utilise que les bibliothèques DSFR de la
        version installée, sans bibliothèque manquante : les éléments liés à une autre version ne pourront pas être reliés.
      </p>
      <ol>
        <li>
          Dans Figma, ouvrez votre fichier puis lancez le plugin <strong>Penpot Exporter</strong> (menu <em>Plugins</em>).
        </li>
        <li>
          Dans la section <strong>External Libraries</strong>, le plugin liste les bibliothèques détectées dans votre fichier. Pour chacune des
          bibliothèques DSFR, ouvrez le fichier correspondant dans Penpot, copiez l’adresse affichée dans la barre de votre navigateur et collez-la
          dans le champ du plugin.
        </li>
        <li>
          Lancez l’export et enregistrez le fichier <code>.penpot</code> obtenu.
        </li>
      </ol>
      {importedFileKeys.length > 0 && (
        <p className={fr.cx('fr-text--sm')}>
          Les bibliothèques DSFR de votre espace Penpot :{' '}
          {formatList(importedFileKeys.map((key) => `« ${release.files[key]?.fileName ?? dsfrFiles[key].label} »`))}.
        </p>
      )}

      <figure className={fr.cx('fr-content-media', 'fr-mt-2w')} role="group" aria-label="© Penpot Exporter">
        <img
          src={figmaPluginLibrariesImage}
          alt="Fenêtre du plugin Penpot Exporter dans Figma : la section External Libraries liste les bibliothèques DSFR du fichier, chacune avec un champ où coller son adresse Penpot."
          style={{
            display: 'block',
            width: '100%',
            maxWidth: 560,
            height: 'auto',
            border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
          }}
        />
        <figcaption className={fr.cx('fr-content-media__caption')}>
          Les adresses de vos bibliothèques DSFR collées dans la section « External Libraries » du plugin. Le message orange rappelle que vos
          maquettes doivent être importées sur la même instance Penpot que les bibliothèques.
        </figcaption>
      </figure>

      {notImportedFileKeys.length > 0 && (
        <>
          <Notice
            className={fr.cx('fr-mb-2w')}
            title="Si vos maquettes utilisent des éléments des fichiers ci-dessous, importez-les d’abord, sinon ces éléments seront transférés sans lien avec le DSFR."
          />
          <ButtonsGroup
            inlineLayoutWhen="sm and up"
            buttonsSize="small"
            // Only rendered when there is at least one file
            buttons={
              notImportedFileKeys.map((key): ButtonProps => ({
                children: `Importer « ${dsfrFiles[key].label} »`,
                priority: 'secondary',
                iconId: 'fr-icon-download-line',
                onClick: () => onImportFile(key),
              })) as [ButtonProps, ...ButtonProps[]]
            }
          />
        </>
      )}

      <h2 className={fr.cx('fr-h4', 'fr-mt-4w')}>2. Importer le résultat dans Penpot</h2>
      <p>
        Comme pour les fichiers DSFR, importez le fichier <code>.penpot</code> obtenu dans le projet de votre choix. Les composants DSFR qu’il
        contient pointeront vers vos bibliothèques.
      </p>
      {isOutdated && (
        <Notice
          className={fr.cx('fr-mb-2w')}
          title={`Vos maquettes utilisent une autre version du DSFR que la v${latestDsfrVersion} installée : vérifiez-les une fois importées, et remplacez à la main les composants qui auraient perdu leur lien (clic droit, « Échanger composant »).`}
        />
      )}
      <p className={fr.cx('fr-text--sm')} style={{ color: fr.colors.decisions.text.mention.grey.default }}>
        Les fichiers très volumineux peuvent prendre du temps à exporter : préférez l’application Figma pour ordinateur, ne sélectionnez que certaines
        pages dans le plugin, ou demandez l’aide d’une personne disposant d’un poste plus puissant. En cas de blocage,{' '}
        <a href={`mailto:${supportEmail}`}>contactez-nous</a>.
      </p>
    </>
  );
}
