// When enabled, the patched `.penpot` file declares its libraries in the manifest `relations` so Penpot connects them
// at import time (no need to go through "Manage libraries"). It requires the libraries to exist with the provided IDs,
// otherwise the import fails, that's why the user has to give the URL of an already imported file
export const linkLibrariesAtImport = true;

export const penpotSaasUrl = 'https://design.penpot.app';
export const marianneFontUrl = 'https://www.info.gouv.fr/marque-de-letat/la-typographie';
export const figmaPluginUrl = 'https://www.figma.com/community/plugin/1219369440655168734/penpot-exporter';
export const dsfrDocumentationUrl = 'https://www.systeme-de-design.gouv.fr/';
export const supportEmail = 'penpot-dsfr@beta.gouv.fr';
// Official guide explaining how to update the DSFR libraries on Figma and the files using them
// TODO: point to the exact page once the SIG confirms it
export const figmaLibraryUpdateGuideUrl = 'https://www.systeme-de-design.gouv.fr/';
