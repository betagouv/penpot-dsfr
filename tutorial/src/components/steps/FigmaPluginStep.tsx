import { fr } from '@codegouvfr/react-dsfr';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { Notice } from '@codegouvfr/react-dsfr/Notice';
import { Table } from '@codegouvfr/react-dsfr/Table';

import { CopyButton } from '@tutorial/src/components/CopyButton';
import { PenpotUrlInput } from '@tutorial/src/components/PenpotUrlInput';
import { DsfrFileKey, dsfrFiles } from '@tutorial/src/config/dsfr-files';
import { Release } from '@tutorial/src/config/release';
import { figmaPluginUrl } from '@tutorial/src/config/tutorial';
import { parsePenpotUrl } from '@tutorial/src/utils/penpot-url';

export interface FigmaPluginStepProps {
  release: Release;
  availableFileKeys: DsfrFileKey[];
  libraryUrls: Partial<Record<DsfrFileKey, string>>;
  onLibraryUrlChange: (key: DsfrFileKey, url: string) => void;
  onImportFile: (key: DsfrFileKey) => void;
}

export function FigmaPluginStep({ release, availableFileKeys, libraryUrls, onLibraryUrlChange, onImportFile }: FigmaPluginStepProps) {
  const isLinked = (key: DsfrFileKey) => parsePenpotUrl(libraryUrls[key] ?? '').success;
  const linkedFileKeys = availableFileKeys.filter(isLinked);
  const missingFileKeys = availableFileKeys.filter((key) => !isLinked(key));

  return (
    <>
      <p>
        Le plugin Figma{' '}
        <a href={figmaPluginUrl} target="_blank" rel="noopener noreferrer">
          Penpot Exporter
        </a>{' '}
        transforme vos maquettes en fichier Penpot. En lui indiquant où se trouvent les bibliothèques DSFR dans votre espace, les composants utilisés
        dans vos maquettes resteront reliés au DSFR une fois dans Penpot.
      </p>

      <h2 className={fr.cx('fr-h4', 'fr-mt-4w')}>1. Exporter depuis Figma</h2>
      <ol>
        <li>
          Dans Figma, ouvrez votre fichier puis lancez le plugin <strong>Penpot Exporter</strong> (menu <em>Plugins</em>).
        </li>
        <li>
          Dans la section <strong>External Libraries</strong>, le plugin liste les bibliothèques détectées dans votre fichier. Pour chaque
          bibliothèque DSFR, collez l’adresse correspondante du tableau ci-dessous.
        </li>
        <li>
          Lancez l’export et enregistrez le fichier <code>.penpot</code> obtenu.
        </li>
      </ol>

      {linkedFileKeys.length > 0 && (
        <Table
          caption="Adresses à indiquer au plugin"
          headers={['Bibliothèque DSFR', 'Adresse dans Penpot', '']}
          data={linkedFileKeys.map((key) => [
            <>
              <strong>{dsfrFiles[key].label}</strong>
              <br />
              <span className={fr.cx('fr-text--xs')} style={{ color: fr.colors.decisions.text.mention.grey.default }}>
                {release.files[key]!.fileName}
              </span>
            </>,
            <code key={`${key}-url`} style={{ wordBreak: 'break-all' }}>
              {libraryUrls[key]}
            </code>,
            <CopyButton key={`${key}-copy`} value={libraryUrls[key]!} />,
          ])}
        />
      )}

      {missingFileKeys.length > 0 && (
        <>
          <Notice
            className={fr.cx('fr-mb-2w')}
            title="Si vos maquettes utilisent des éléments des fichiers ci-dessous, importez-les d’abord, sinon ces éléments seront transférés sans lien avec le DSFR."
          />
          {missingFileKeys.map((key) => (
            <div key={key} className={fr.cx('fr-mb-3w')}>
              <PenpotUrlInput
                label={`Adresse du fichier « ${dsfrFiles[key].label} » si vous l’avez déjà importé`}
                value={libraryUrls[key] ?? ''}
                onChange={(url) => onLibraryUrlChange(key, url)}
              />
              <Button priority="secondary" size="small" iconId="fr-icon-download-line" onClick={() => onImportFile(key)}>
                Importer « {dsfrFiles[key].label} » maintenant
              </Button>
            </div>
          ))}
        </>
      )}

      <h2 className={fr.cx('fr-h4', 'fr-mt-4w')}>2. Importer le résultat dans Penpot</h2>
      <p>
        Comme pour les fichiers DSFR, importez le fichier <code>.penpot</code> obtenu dans le projet de votre choix. Les composants DSFR qu’il
        contient pointeront vers vos bibliothèques.
      </p>
      <p className={fr.cx('fr-text--sm')} style={{ color: fr.colors.decisions.text.mention.grey.default }}>
        Les fichiers très volumineux peuvent prendre du temps à exporter : n’hésitez pas à ne sélectionner que certaines pages dans le plugin.
      </p>
    </>
  );
}
