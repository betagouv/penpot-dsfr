import { fr } from '@codegouvfr/react-dsfr';
import { Checkbox } from '@codegouvfr/react-dsfr/Checkbox';

import { DsfrFileKey, dsfrFiles } from '@tutorial/src/config/dsfr-files';
import { Release } from '@tutorial/src/config/release';
import { formatFileSize } from '@tutorial/src/utils/format';

export interface OptionalFilesStepProps {
  release: Release;
  fileKeys: DsfrFileKey[];
  selectedFileKeys: DsfrFileKey[];
  onChange: (selectedFileKeys: DsfrFileKey[]) => void;
}

export function OptionalFilesStep({ release, fileKeys, selectedFileKeys, onChange }: OptionalFilesStepProps) {
  return (
    <>
      <p>
        Les bibliothèques essentielles sont installées. D’autres fichiers du DSFR peuvent vous servir d’inspiration : ils ne sont pas nécessaires pour
        concevoir vos maquettes, mais permettent de partir de pages déjà construites.
      </p>
      <p className={fr.cx('fr-text--sm')}>
        Si vos maquettes Figma utilisent des éléments de ces fichiers, importez-les aussi : leurs éléments pourront alors être reliés lors du
        transfert vers Penpot.
      </p>
      <Checkbox
        legend="Quels fichiers souhaitez-vous importer en plus ?"
        hintText="Vous pouvez n’en sélectionner aucun."
        options={fileKeys.map((key) => ({
          label: `${dsfrFiles[key].label} (${formatFileSize(release.files[key]!.size)})`,
          hintText: dsfrFiles[key].description,
          nativeInputProps: {
            name: 'optional-files',
            value: key,
            checked: selectedFileKeys.includes(key),
            onChange: (event) =>
              onChange(event.target.checked ? [...selectedFileKeys, key] : selectedFileKeys.filter((selectedKey) => selectedKey !== key)),
          },
        }))}
      />
    </>
  );
}
