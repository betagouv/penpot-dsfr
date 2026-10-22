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
}

export function DsfrVersionSelect({ latestVersion, value, onChange }: DsfrVersionSelectProps) {
  const previousVersions = getPreviousMinorVersions(latestVersion, previousVersionsCount);
  const isOutdated = value !== null && value !== latestVersion;

  return (
    <>
      <Select
        label="Quelle version du DSFR utilisez-vous ?"
        hint={`Pour des maquettes Figma existantes, la version figure dans le nom des bibliothèques DSFR utilisées (onglet « Assets » > « Libraries »). Pour un nouveau projet, choisissez la dernière version.`}
        state={isOutdated ? 'error' : 'default'}
        stateRelatedMessage={isOutdated ? `Seule la version v${latestVersion} est disponible pour Penpot.` : undefined}
        nativeSelectProps={{ value: value ?? '', onChange: (event) => onChange(event.currentTarget.value) }}
      >
        <option value="" disabled hidden>
          Sélectionnez une version
        </option>
        <option value={latestVersion}>v{latestVersion} (dernière version)</option>
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
          title={`Mettez d’abord à jour vos maquettes vers la version v${latestVersion} dans Figma`}
          className={fr.cx('fr-mb-4w')}
          description={
            <>
              <p>
                Seule la dernière version du DSFR est convertie pour Penpot. Transférer des maquettes reposant sur une autre version les
                déconnecterait du DSFR.
              </p>
              <ol>
                <li>
                  Suivez{' '}
                  <a href={figmaLibraryUpdateGuideUrl} target="_blank" rel="noopener noreferrer">
                    le guide officiel de mise à jour du DSFR sur Figma
                  </a>{' '}
                  pour passer vos bibliothèques DSFR en version v{latestVersion}, en conservant les liens entre elles (<em>Composants</em> s’appuie
                  sur <em>Fondamentaux</em> et <em>Pictogrammes</em>).
                </li>
                <li>Dans chacun de vos fichiers d’application, basculez sur ces bibliothèques à jour et acceptez la mise à jour des composants.</li>
                <li>Vérifiez que vos maquettes s’affichent correctement.</li>
              </ol>
              <p className={fr.cx('fr-mb-0')}>Revenez ensuite à ce parcours et sélectionnez la version v{latestVersion}.</p>
            </>
          }
        />
      )}
    </>
  );
}
