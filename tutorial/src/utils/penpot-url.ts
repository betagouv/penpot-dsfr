// Penpot workspace URLs look like `https://design.penpot.app/#/workspace?team-id=...&file-id=...&page-id=...`
// (parameters are inside the hash since Penpot is a single page application). The logic is aligned with the one
// of `penpot-exporter-figma-plugin` so a URL accepted here is also accepted by the plugin
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type PenpotUrlParseResult = { success: true; fileId: string; teamId: string | null; origin: string } | { success: false; error: string };

export function parsePenpotUrl(input: string): PenpotUrlParseResult {
  const trimmed = input.trim();

  if (trimmed === '') {
    return { success: false, error: 'Veuillez renseigner l’adresse du fichier Penpot.' };
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return {
      success: false,
      error: 'L’adresse n’est pas valide, elle doit commencer par https:// (exemple : https://design.penpot.app/#/workspace?...).',
    };
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return { success: false, error: 'L’adresse doit commencer par https://.' };
  }

  const hashParams = new URLSearchParams(url.hash.split('?')[1] || '');
  const fileId = hashParams.get('file-id') || url.searchParams.get('file-id');
  const teamId = hashParams.get('team-id') || url.searchParams.get('team-id');

  if (!fileId) {
    return {
      success: false,
      error:
        'L’adresse ne contient pas d’identifiant de fichier (paramètre « file-id »). Ouvrez le fichier dans Penpot puis copiez l’adresse de la page.',
    };
  }

  if (!UUID_REGEX.test(fileId)) {
    return { success: false, error: 'L’identifiant de fichier contenu dans l’adresse n’est pas valide.' };
  }

  return {
    success: true,
    fileId: fileId.toLowerCase(),
    teamId: teamId && UUID_REGEX.test(teamId) ? teamId.toLowerCase() : null,
    origin: url.origin,
  };
}

export function isPenpotSaasOrigin(origin: string): boolean {
  try {
    const hostname = new URL(origin).hostname;

    return hostname === 'penpot.app' || hostname.endsWith('.penpot.app');
  } catch {
    return false;
  }
}
