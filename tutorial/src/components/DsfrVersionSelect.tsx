import { fr } from '@codegouvfr/react-dsfr';
import { Alert } from '@codegouvfr/react-dsfr/Alert';
import { Select } from '@codegouvfr/react-dsfr/Select';

import { getPreviousMinorVersions } from '@tutorial/src/config/release';
import { figmaLibraryUpdateGuideUrl } from '@tutorial/src/config/tutorial';

const previousVersionsCount = 10;
const olderVersionValue = 'older';

export interface DsfrVersionSelectProps {
  // The version converted for Penpot
  latestVersion: string;
  value: string | null;
  onChange: (version: string) => void;
  // Without mockups to transfer, the installed version is the one used and there is nothing to choose
  disabled?: boolean;
}

export function DsfrVersionSelect({ latestVersion, value, onChange, disabled = false }: DsfrVersionSelectProps) {
  const previousVersions = getPreviousMinorVersions(latestVersion, previousVersionsCount);
  const isOutdated = !disabled && value !== null && value !== latestVersion;

  return (
    <>
      <Select
        label="Version du DSFR de vos maquettes"
        hint={
          disabled
            ? 'Sans maquettes à transférer, vous concevrez directement avec la version installée dans Penpot, la plus récente disponible.'
            : 'Elle figure dans le nom des bibliothèques DSFR de vos fichiers (onglet « Assets » puis « Libraries » dans Figma).'
        }
        disabled={disabled}
        nativeSelectProps={{ value: disabled ? latestVersion : (value ?? ''), onChange: (event) => onChange(event.currentTarget.value) }}
      >
        <option value="" disabled hidden>
          Sélectionnez une version
        </option>
        <option value={latestVersion}>v{latestVersion} (version installée dans Penpot)</option>
        {previousVersions.map((version) => (
          <option key={version} value={version}>
            v{version}
          </option>
        ))}
        <option value={olderVersionValue}>Version antérieure</option>
      </Select>

      {isOutdated && (
        <Alert
          severity="warning"
          title={`Vos maquettes n’utilisent pas la version v${latestVersion} installée dans Penpot`}
          className={fr.cx('fr-mb-4w')}
          description={
            <>
              <p>
                Une fois vos maquettes transférées, certains de leurs composants risquent de perdre leur lien avec le DSFR ou de s’afficher
                différemment. Deux possibilités :
              </p>
              <ul>
                <li>
                  <strong>Idéalement</strong>, passez d’abord vos maquettes en version v{latestVersion} dans Figma en suivant{' '}
                  <a href={figmaLibraryUpdateGuideUrl} target="_blank" rel="noopener noreferrer">
                    le guide « Premiers pas sur Figma » du DSFR
                  </a>{' '}
                  (partie sur la mise à jour des bibliothèques), puis revenez à ce parcours.
                </li>
                <li>
                  <strong>Sinon</strong>, continuez avec votre version actuelle : vérifiez vos maquettes une fois dans Penpot et ajustez à la main les
                  éléments concernés, par exemple en échangeant un composant contre son équivalent du DSFR installé.
                </li>
              </ul>
            </>
          }
        />
      )}
    </>
  );
}
