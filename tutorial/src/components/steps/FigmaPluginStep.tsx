import { fr } from '@codegouvfr/react-dsfr';
import { Alert } from '@codegouvfr/react-dsfr/Alert';
import { Button, ButtonProps } from '@codegouvfr/react-dsfr/Button';
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

      <h2 className={fr.cx('fr-h4', 'fr-mt-4w')}>1. Vérifier les bibliothèques de vos maquettes</h2>
      <p>
        Dans Figma, ouvrez le fichier de maquettes que vous voulez transférer (celui de votre service, pas un fichier du DSFR), puis le panneau{' '}
        <strong>Bibliothèques</strong> de l’onglet <em>Assets</em>. Les bibliothèques DSFR utilisées par vos maquettes doivent être celles de la
        version installée dans Penpot{latestDsfrVersion && <> (v{latestDsfrVersion})</>}, et aucune ne doit être signalée comme manquante : les
        éléments liés à une autre bibliothèque ne pourront pas être reliés au DSFR dans Penpot.
      </p>

      <h2 className={fr.cx('fr-h4', 'fr-mt-4w')}>2. Exporter avec le plugin Penpot Exporter</h2>
      <p>
        Le bouton ci-dessous ouvre la page du plugin dans Figma : cliquez sur <strong>Open in…</strong> et choisissez votre fichier de maquettes.
        Depuis le fichier, vous le retrouverez ensuite avec le bouton <strong>Actions</strong> de la barre d’outils, onglet <em>Plugins & widgets</em>
        .
      </p>
      <Button
        iconId="fr-icon-external-link-line"
        iconPosition="right"
        priority="secondary"
        className={fr.cx('fr-mb-3w')}
        linkProps={{ href: figmaPluginUrl, target: '_blank', rel: 'noopener noreferrer' }}
      >
        Ouvrir le plugin Penpot Exporter
      </Button>
      <ol>
        <li>
          Dans la section <strong>External Libraries</strong>, le plugin liste les bibliothèques utilisées par vos maquettes.
          {importedFileKeys.length > 0 && (
            <>
              {' '}
              Pour les bibliothèques DSFR, ce sont les fichiers que vous venez d’importer dans Penpot :{' '}
              {formatList(importedFileKeys.map((key) => `« ${release.files[key]?.fileName ?? dsfrFiles[key].label} »`))}.
            </>
          )}
        </li>
        <li>
          Pour chacune, ouvrez le fichier correspondant dans Penpot, copiez l’adresse affichée dans la barre de votre navigateur et collez-la dans le
          champ du plugin.
        </li>
        <li>
          Lancez l’export et enregistrez le fichier <code>.penpot</code> obtenu.
        </li>
      </ol>

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
          Exemple : chaque bibliothèque DSFR détectée par le plugin reçoit l’adresse de son fichier dans Penpot.
        </figcaption>
      </figure>

      {notImportedFileKeys.length > 0 && (
        <Alert
          severity="info"
          small
          className={fr.cx('fr-mb-4w')}
          description={
            <>
              <p className={fr.cx('fr-mb-2w')}>
                Si vos maquettes utilisent des éléments des fichiers ci-dessous, importez-les d’abord, sinon ces éléments seront transférés sans lien
                avec le DSFR.
              </p>
              <ButtonsGroup
                inlineLayoutWhen="sm and up"
                buttonsSize="small"
                className={fr.cx('fr-mb-0')}
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
          }
        />
      )}

      <h2 className={fr.cx('fr-h4', 'fr-mt-4w')}>3. Importer le résultat dans Penpot</h2>
      <p>
        Comme pour les fichiers DSFR, importez le fichier <code>.penpot</code> obtenu dans le projet de votre choix, sur la même instance Penpot que
        vos bibliothèques DSFR. Les composants DSFR qu’il contient pointeront vers elles.
      </p>

      <h2 className={fr.cx('fr-h4', 'fr-mt-4w')}>Vos maquettes utilisent d’autres de vos fichiers Figma ?</h2>
      <p>
        Si votre fichier utilise aussi vos propres bibliothèques Figma (composants maison, maquettes partagées par une autre équipe…), elles
        apparaissent elles aussi dans la section <strong>External Libraries</strong> du plugin. Pour que le lien soit conservé, ces bibliothèques
        doivent déjà se trouver dans votre espace Penpot : transférez donc vos fichiers dans le même ordre que ceux du DSFR, en commençant par ceux
        dont les autres dépendent.
      </p>
      <ol>
        <li>
          Commencez par les fichiers qui n’utilisent aucune autre de vos bibliothèques, seulement le DSFR : par exemple votre bibliothèque de
          composants maison.
        </li>
        <li>
          Une fois chacun importé dans Penpot, faites un clic droit dessus et choisissez <strong>Ajouter en tant que bibliothèque partagée</strong>.
        </li>
        <li>
          Passez ensuite aux fichiers qui les utilisent, en collant dans le plugin l’adresse Penpot de ces bibliothèques comme pour celles du DSFR, et
          ainsi de suite jusqu’à vos maquettes finales.
        </li>
      </ol>
      {isOutdated && (
        <Notice
          className={fr.cx('fr-mb-2w')}
          title={`Vos maquettes utilisent une autre version du DSFR que la v${latestDsfrVersion} installée : vérifiez-les une fois importées, et remplacez à la main les composants qui auraient perdu leur lien (clic droit, « Échanger composant »).`}
        />
      )}
      <p className={fr.cx('fr-text--sm')} style={{ color: fr.colors.decisions.text.mention.grey.default }}>
        Les fichiers très volumineux peuvent prendre du temps à exporter : préférez l’application Figma pour ordinateur, ou demandez l’aide d’une
        personne disposant d’un poste plus puissant. En cas de blocage, <a href={`mailto:${supportEmail}`}>contactez-nous</a>.
      </p>
    </>
  );
}
