// From this version, importing a `.penpot` file links its libraries to the shared files of the team having the same name
// (when there is exactly one), so the DSFR files only have to be imported in order, without any modification
export const minimumPenpotVersion = '2.19';

export const penpotUrl = 'https://penpot.app';
// Instance run by the SIG (the team managing the DSFR), proposed by default to administrations
export const penpotSigUrl = 'https://penpot.systeme-de-design.gouv.fr';
// Public instance of the Penpot editor, only for specific cases
export const penpotSaasUrl = 'https://design.penpot.app';
export const marianneFontUrl = 'https://www.info.gouv.fr/marque-de-letat/la-typographie';
export const figmaPluginUrl = 'https://www.figma.com/community/plugin/1219369440655168734/penpot-exporter';
export const figmaPluginSourceUrl = 'https://github.com/penpot/penpot-exporter-figma-plugin';
export const dsfrDocumentationUrl = 'https://www.systeme-de-design.gouv.fr/';
export const supportEmail = 'penpot-dsfr@beta.gouv.fr';
// Official guide explaining how to update the DSFR libraries on Figma and the files using them
// TODO: point to the exact page once the SIG confirms it
export const figmaLibraryUpdateGuideUrl = 'https://www.systeme-de-design.gouv.fr/';
