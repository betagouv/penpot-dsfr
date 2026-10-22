import { fr } from '@codegouvfr/react-dsfr';
import { Alert } from '@codegouvfr/react-dsfr/Alert';
import { RadioButtons } from '@codegouvfr/react-dsfr/RadioButtons';
import { Table } from '@codegouvfr/react-dsfr/Table';

import { DsfrFileKey, dsfrFiles } from '@tutorial/src/config/dsfr-files';

export interface DsfrReadyStepProps {
  libraryUrls: Partial<Record<DsfrFileKey, string>>;
  importedFileKeys: DsfrFileKey[];
  hasFigmaFiles: boolean | null;
  onHasFigmaFilesChange: (hasFigmaFiles: boolean) => void;
}

export function DsfrReadyStep({ libraryUrls, importedFileKeys, hasFigmaFiles, onHasFigmaFilesChange }: DsfrReadyStepProps) {
  return (
    <>
      <Alert
        severity="success"
        title="Bravo, le DSFR est disponible dans votre espace Penpot"
        description="Les membres de votre équipe peuvent dès à présent utiliser ses composants, couleurs et typographies."
        className={fr.cx('fr-mb-4w')}
      />

      <Table
        caption="Vos bibliothèques DSFR"
        headers={['Fichier', 'Adresse dans Penpot']}
        data={importedFileKeys.map((key) => [
          dsfrFiles[key].label,
          <a key={key} href={libraryUrls[key]} target="_blank" rel="noopener noreferrer">
            Ouvrir dans Penpot
          </a>,
        ])}
      />

      <RadioButtons
        legend="Avez-vous déjà des maquettes sur Figma à transférer vers Penpot ?"
        hintText="Par exemple les maquettes d’un service existant conçues avec les bibliothèques DSFR de Figma."
        options={[
          {
            label: 'Oui, je veux transférer des maquettes Figma',
            nativeInputProps: { checked: hasFigmaFiles === true, onChange: () => onHasFigmaFilesChange(true) },
          },
          {
            label: 'Non, je pars de zéro',
            nativeInputProps: { checked: hasFigmaFiles === false, onChange: () => onHasFigmaFilesChange(false) },
          },
        ]}
      />
    </>
  );
}
