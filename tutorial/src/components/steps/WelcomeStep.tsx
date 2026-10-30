import { fr } from '@codegouvfr/react-dsfr';
import { CallOut } from '@codegouvfr/react-dsfr/CallOut';
import { RadioButtons } from '@codegouvfr/react-dsfr/RadioButtons';

import { DsfrVersionSelect } from '@tutorial/src/components/DsfrVersionSelect';
import { DsfrFileKey, dsfrFiles } from '@tutorial/src/config/dsfr-files';
import { Release, getDsfrVersion } from '@tutorial/src/config/release';
import { minimumPenpotVersion, penpotSaasUrl, penpotSigUrl, penpotUrl } from '@tutorial/src/config/tutorial';
import { formatFileSize } from '@tutorial/src/utils/format';

export interface WelcomeStepProps {
  release: Release;
  fileKeys: DsfrFileKey[];
  hasFigmaFiles: boolean | null;
  onHasFigmaFilesChange: (hasFigmaFiles: boolean) => void;
  dsfrVersion: string | null;
  onDsfrVersionChange: (dsfrVersion: string) => void;
}

export function WelcomeStep({ release, fileKeys, hasFigmaFiles, onHasFigmaFilesChange, dsfrVersion, onDsfrVersionChange }: WelcomeStepProps) {
  const latestDsfrVersion = getDsfrVersion(release);

  return (
    <>
      <p>
        Ce parcours vous accompagne pour installer les bibliothèques du Système de Design de l’État (DSFR) dans votre espace Penpot. Comptez une
        quinzaine de minutes.{' '}
        <a href={penpotUrl} target="_blank" rel="noopener noreferrer">
          Penpot
        </a>{' '}
        est un outil de conception d’interfaces libre et open source, alternative à Figma.
      </p>
      <p>
        Penpot ne permet pas encore de partager une bibliothèque d’une équipe à une autre. Les fichiers du DSFR doivent donc être importés dans votre
        propre équipe, l’un après l’autre car ils dépendent les uns des autres. En les partageant comme bibliothèques au fur et à mesure, Penpot relie
        automatiquement chaque nouveau fichier à ceux déjà importés.
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

      <h2 className={fr.cx('fr-h4', 'fr-mt-4w')}>Quelle instance Penpot utiliser ?</h2>
      <ul>
        <li>
          <strong>
            <a href={penpotSigUrl} target="_blank" rel="noopener noreferrer">
              L’instance du Service d’information du Gouvernement (SIG)
            </a>
          </strong>
          , qui gère le Système de Design de l’État : c’est l’instance proposée par défaut aux administrations.
        </li>
        <li>
          <strong>L’instance interne de votre administration</strong>, si elle en dispose : utilisez-la en priorité.
        </li>
        <li>
          <strong>Une instance installée sur votre propre infrastructure</strong>, si vos maquettes sont très confidentielles.
        </li>
      </ul>
      <p className={fr.cx('fr-text--sm')}>
        L’instance publique{' '}
        <a href={penpotSaasUrl} target="_blank" rel="noopener noreferrer">
          design.penpot.app
        </a>{' '}
        de l’éditeur de Penpot n’est pas destinée aux maquettes de l’administration, réservez-la à des cas particuliers.
      </p>

      <CallOut title="Avant de commencer" iconId="fr-icon-information-line" titleAs="h2" bodyAs="div">
        <ul className={fr.cx('fr-mb-0')}>
          <li>Disposez d’un compte sur l’instance Penpot choisie, dans l’équipe où vous concevrez vos maquettes.</li>
          <li>
            L’instance doit être en version {minimumPenpotVersion} ou plus récente : c’est à partir de cette version que Penpot relie automatiquement
            les fichiers importés entre eux.
          </li>
          <li>
            Les fichiers Figma du DSFR restent la référence : l’installation va de Figma vers Penpot uniquement, ce que vous modifiez dans Penpot ne
            revient pas dans Figma.
          </li>
          <li>Utilisez de préférence un navigateur basé sur Chromium (Chrome, Edge…), mieux supporté par Penpot pour les fichiers volumineux.</li>
          <li>Gardez cette page ouverte à côté de Penpot le temps de l’installation, votre progression est conservée sur ce navigateur.</li>
        </ul>
      </CallOut>

      <h2 className={fr.cx('fr-h4', 'fr-mt-4w')}>Votre situation</h2>
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

      <p className={fr.cx('fr-text--sm')} style={{ color: fr.colors.decisions.text.mention.grey.default }}>
        Version proposée :{' '}
        <a href={release.htmlUrl} target="_blank" rel="noopener noreferrer">
          {release.name}
        </a>
      </p>
    </>
  );
}
