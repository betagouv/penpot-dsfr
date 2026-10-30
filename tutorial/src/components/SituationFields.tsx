import { RadioButtons } from '@codegouvfr/react-dsfr/RadioButtons';

import { DsfrVersionSelect } from '@tutorial/src/components/DsfrVersionSelect';

export interface SituationFieldsProps {
  // The version converted for Penpot
  latestDsfrVersion: string | null;
  hasFigmaFiles: boolean | null;
  onHasFigmaFilesChange: (hasFigmaFiles: boolean) => void;
  dsfrVersion: string | null;
  onDsfrVersionChange: (dsfrVersion: string) => void;
}

export function SituationFields({ latestDsfrVersion, hasFigmaFiles, onHasFigmaFilesChange, dsfrVersion, onDsfrVersionChange }: SituationFieldsProps) {
  return (
    <>
      <RadioButtons
        legend="Avez-vous des maquettes Figma à transférer vers Penpot ?"
        hintText="Par exemple les maquettes d’un service existant conçues avec les bibliothèques DSFR de Figma. Le transfert se fait à la fin du parcours, une fois le DSFR installé."
        options={[
          {
            label: 'Non, je pars de zéro',
            nativeInputProps: { checked: hasFigmaFiles === false, onChange: () => onHasFigmaFilesChange(false) },
          },
          {
            label: 'Oui, je veux transférer des maquettes Figma',
            nativeInputProps: { checked: hasFigmaFiles === true, onChange: () => onHasFigmaFilesChange(true) },
          },
        ]}
      />
      {hasFigmaFiles && latestDsfrVersion && (
        <DsfrVersionSelect latestVersion={latestDsfrVersion} value={dsfrVersion} onChange={onDsfrVersionChange} />
      )}
    </>
  );
}
