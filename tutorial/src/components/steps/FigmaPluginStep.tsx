import { fr } from '@codegouvfr/react-dsfr';
import { Alert } from '@codegouvfr/react-dsfr/Alert';
import { Button, ButtonProps } from '@codegouvfr/react-dsfr/Button';
import { ButtonsGroup } from '@codegouvfr/react-dsfr/ButtonsGroup';

import figmaPluginExportDoneImage from '@tutorial/src/assets/figma-plugin-export-done.png';
import figmaPluginLibrariesImage from '@tutorial/src/assets/figma-plugin-libraries.png';
import { Screenshot } from '@tutorial/src/components/Screenshot';
import { DsfrFileKey, dsfrFiles } from '@tutorial/src/config/dsfr-files';
import { figmaPluginSourceUrl, figmaPluginUrl, supportEmail } from '@tutorial/src/config/tutorial';

export interface FigmaPluginStepProps {
  // Optional DSFR files not imported, mockups using them would lose the link to the DSFR
  notImportedFileKeys: DsfrFileKey[];
  onImportFile: (key: DsfrFileKey) => void;
}

export function FigmaPluginStep({ notImportedFileKeys, onImportFile }: FigmaPluginStepProps) {
  return (
    <>
      <p>
        Le plugin Figma{' '}
        <a href={figmaPluginUrl} target="_blank" rel="noopener noreferrer">
          Penpot Exporter
        </a>{' '}
        transforme vos maquettes en fichier Penpot. Les composants du DSFR qu’elles utilisent seront ensuite reliés aux bibliothèques DSFR de votre
        équipe à l’étape suivante.
      </p>
      <p className={fr.cx('fr-text--sm')}>
        La conversion est réalisée par le plugin dans Figma, sur votre poste, et vous importez vous-même le fichier obtenu. Ce fonctionnement dépend
        toutefois du code réellement publié : pour des maquettes très sensibles, n’hésitez pas à le vérifier, son{' '}
        <a href={figmaPluginSourceUrl} target="_blank" rel="noopener noreferrer">
          code source
        </a>{' '}
        étant ouvert.
      </p>

      <h2 className={fr.cx('fr-h4', 'fr-mt-4w')}>1. Exporter avec le plugin Penpot Exporter</h2>
      <p>
        Le bouton ci-dessous ouvre la page du plugin dans Figma : cliquez sur <strong>Open in…</strong> et choisissez votre fichier de maquettes
        (celui de votre service, pas un fichier du DSFR). Depuis le fichier, vous le retrouverez ensuite avec le bouton <strong>Actions</strong> de la
        barre d’outils, onglet <strong>Plugins & widgets</strong>.
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
          Dans la section <strong>External Libraries</strong>, le plugin liste les bibliothèques utilisées par vos maquettes, chacune avec un champ
          pour son adresse dans Penpot.
        </li>
        <li>
          <strong>Laissez vides les champs des bibliothèques du DSFR</strong> : l’étape suivante relie vos maquettes au DSFR, quelle que soit la copie
          ou la version du DSFR utilisée dans Figma.
        </li>
        <li>
          Pour vos autres bibliothèques (composants maison…), collez l’adresse de leur fichier dans Penpot : voir{' '}
          <a href="#autres-bibliotheques">plus bas</a>.
        </li>
        <li>
          Lancez l’export avec <strong>Start Export</strong>, puis enregistrez le fichier <code>.penpot</code> obtenu avec{' '}
          <strong>Download File</strong>. Le plugin peut signaler la police Marianne : elle est déjà ajoutée à votre équipe, il n’y a rien à faire.
        </li>
      </ol>

      <Screenshot
        src={figmaPluginLibrariesImage}
        alt="Fenêtre du plugin Penpot Exporter dans Figma : la section External Libraries liste les bibliothèques du fichier, chacune avec un champ où coller son adresse Penpot."
        maxWidth={560}
        copyright="Penpot Exporter"
        caption={
          <>
            La section <strong>External Libraries</strong> du plugin : les champs des bibliothèques DSFR peuvent rester vides.
          </>
        }
      />

      <Screenshot
        src={figmaPluginExportDoneImage}
        alt="Fenêtre du plugin Penpot Exporter une fois l’export terminé : nom et taille du fichier .penpot, police Marianne détectée, et bouton Download File pour l’enregistrer."
        maxWidth={290}
        copyright="Penpot Exporter"
        caption={
          <>
            Une fois l’export terminé, le bouton <strong>Download File</strong> enregistre le fichier à importer dans Penpot.
          </>
        }
      />

      {notImportedFileKeys.length > 0 && (
        <Alert
          severity="info"
          small
          className={fr.cx('fr-mb-4w')}
          description={
            <>
              <p className={fr.cx('fr-mb-2w')}>
                Si vos maquettes utilisent des éléments des fichiers ci-dessous, importez-les d’abord, sinon ces éléments ne pourront pas être reliés
                au DSFR.
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

      <h2 className={fr.cx('fr-h4', 'fr-mt-4w')}>2. Importer le résultat dans Penpot, sans l’ouvrir</h2>
      <p>
        Comme pour les fichiers DSFR, importez le fichier <code>.penpot</code> obtenu dans le projet de votre choix, dans la même équipe que vos
        bibliothèques DSFR.
      </p>
      <p>
        <strong>N’ouvrez pas encore ce fichier</strong> et passez directement à l’étape suivante : à la première ouverture, Penpot détache
        définitivement les composants dont il ne trouve pas la bibliothèque, ce qui est le cas de vos composants DSFR tant qu’ils ne sont pas reliés.
      </p>

      <h2 id="autres-bibliotheques" className={fr.cx('fr-h4', 'fr-mt-4w')}>
        Vos maquettes utilisent d’autres de vos fichiers Figma ?
      </h2>
      <p>
        Si votre fichier utilise aussi vos propres bibliothèques Figma (composants maison, maquettes partagées par une autre équipe…), elles
        apparaissent elles aussi dans la section <strong>External Libraries</strong> du plugin. Pour que le lien soit conservé, ces bibliothèques
        doivent déjà se trouver dans votre espace Penpot : transférez donc vos fichiers en commençant par ceux dont les autres dépendent.
      </p>
      <ol>
        <li>
          Commencez par les fichiers qui n’utilisent aucune autre de vos bibliothèques, seulement le DSFR : par exemple votre bibliothèque de
          composants maison.
        </li>
        <li>Exportez-le et importez-le comme ci-dessus, puis reliez-le au DSFR avec le script de l’étape suivante, toujours sans l’ouvrir avant.</li>
        <li>
          Faites ensuite un clic droit dessus dans le tableau de bord et choisissez <strong>Ajouter comme bibliothèque partagée</strong>.
        </li>
        <li>
          Passez aux fichiers qui l’utilisent, en collant dans le plugin l’adresse Penpot de cette bibliothèque (celle affichée dans la barre du
          navigateur une fois le fichier ouvert), et ainsi de suite jusqu’à vos maquettes finales.
        </li>
      </ol>
      <p className={fr.cx('fr-text--sm')} style={{ color: fr.colors.decisions.text.mention.grey.default }}>
        Les fichiers très volumineux peuvent prendre du temps à exporter : préférez l’application Figma pour ordinateur, ou demandez l’aide d’une
        personne disposant d’un poste plus puissant. En cas de blocage, <a href={`mailto:${supportEmail}`}>contactez-nous</a>.
      </p>
    </>
  );
}
