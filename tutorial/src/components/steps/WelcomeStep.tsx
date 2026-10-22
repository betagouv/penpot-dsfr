import { fr } from '@codegouvfr/react-dsfr';
import { CallOut } from '@codegouvfr/react-dsfr/CallOut';

import { DsfrVersionSelect } from '@tutorial/src/components/DsfrVersionSelect';
import { DsfrFileKey, dsfrFiles } from '@tutorial/src/config/dsfr-files';
import { Release, getDsfrVersion } from '@tutorial/src/config/release';
import { penpotSaasUrl } from '@tutorial/src/config/tutorial';
import { formatFileSize } from '@tutorial/src/utils/format';

export interface WelcomeStepProps {
  release: Release;
  fileKeys: DsfrFileKey[];
  dsfrVersion: string | null;
  onDsfrVersionChange: (dsfrVersion: string) => void;
}

export function WelcomeStep({ release, fileKeys, dsfrVersion, onDsfrVersionChange }: WelcomeStepProps) {
  const latestDsfrVersion = getDsfrVersion(release);

  return (
    <>
      <p>
        Ce parcours vous accompagne pour installer les bibliothèques du Système de Design de l’État (DSFR) dans votre espace{' '}
        <a href={penpotSaasUrl} target="_blank" rel="noopener noreferrer">
          Penpot
        </a>
        , l’outil de conception libre et open source. Comptez une quinzaine de minutes.
      </p>
      <p>
        Penpot ne permet pas encore de partager une bibliothèque d’une équipe à une autre. Les fichiers du DSFR doivent donc être importés dans votre
        propre équipe, l’un après l’autre, car ils dépendent les uns des autres. À chaque étape, nous vous fournissons un fichier déjà relié à ceux
        que vous avez importés précédemment.
      </p>

      <h2 className={fr.cx('fr-h4', 'fr-mt-4w')}>Ce que vous allez importer</h2>
      <ul>
        {fileKeys.map((key) => (
          <li key={key}>
            <strong>{dsfrFiles[key].label}</strong>
            {dsfrFiles[key].optional && ' (facultatif)'} : {dsfrFiles[key].description}{' '}
            <span className={fr.cx('fr-text--sm')} style={{ color: fr.colors.decisions.text.mention.grey.default }}>
              {formatFileSize(release.files[key]!.size)}
            </span>
          </li>
        ))}
      </ul>

      <CallOut title="Avant de commencer" iconId="fr-icon-information-line" titleAs="h2" bodyAs="div">
        <ul className={fr.cx('fr-mb-0')}>
          <li>
            Disposez d’un compte sur{' '}
            <a href={penpotSaasUrl} target="_blank" rel="noopener noreferrer">
              design.penpot.app
            </a>{' '}
            ou sur l’instance Penpot de votre administration.
          </li>
          <li>Utilisez de préférence un navigateur basé sur Chromium (Chrome, Edge…), mieux supporté par Penpot pour les fichiers volumineux.</li>
          <li>Gardez cette page ouverte à côté de Penpot, votre progression est conservée sur ce navigateur.</li>
        </ul>
      </CallOut>

      {latestDsfrVersion && (
        <>
          <h2 className={fr.cx('fr-h4', 'fr-mt-4w')}>Votre version du DSFR</h2>
          <DsfrVersionSelect latestVersion={latestDsfrVersion} value={dsfrVersion} onChange={onDsfrVersionChange} />
        </>
      )}

      <p className={fr.cx('fr-text--sm')} style={{ color: fr.colors.decisions.text.mention.grey.default }}>
        Version proposée :{' '}
        <a href={release.htmlUrl} target="_blank" rel="noopener noreferrer">
          {release.name}
        </a>
      </p>
    </>
  );
}
