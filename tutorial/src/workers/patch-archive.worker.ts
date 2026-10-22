import { patchPenpotArchive } from '@tutorial/src/utils/penpot-archive';

// Downloading and rewriting a ~100 MB archive would freeze the interface, so it is done in a worker

export interface PatchArchiveRequest {
  url: string;
  fileIdReplacements: Record<string, string>;
  linkLibraries: boolean;
}

export type PatchArchiveMessage =
  | { type: 'download-progress'; loaded: number; total: number | null }
  | { type: 'patch-progress'; processed: number; total: number }
  | { type: 'done'; archive: Blob; replacements: Record<string, number>; linkedLibraries: string[] }
  | { type: 'error'; message: string };

const post = (message: PatchArchiveMessage) => self.postMessage(message);

async function download(url: string): Promise<Uint8Array> {
  const response = await fetch(url);

  if (!response.ok || !response.body) {
    throw new Error(`le téléchargement a échoué (${response.status} ${response.statusText})`);
  }

  const contentLength = response.headers.get('Content-Length');
  const total = contentLength ? parseInt(contentLength, 10) : null;
  const chunks: Uint8Array[] = [];
  const reader = response.body.getReader();
  let loaded = 0;
  let lastNotification = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    chunks.push(value);
    loaded += value.length;

    if (loaded - lastNotification > 512 * 1024) {
      lastNotification = loaded;
      post({ type: 'download-progress', loaded, total });
    }
  }

  post({ type: 'download-progress', loaded, total: total ?? loaded });

  const archive = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) {
    archive.set(chunk, offset);
    offset += chunk.length;
  }

  return archive;
}

self.onmessage = async (event: MessageEvent<PatchArchiveRequest>) => {
  try {
    const archive = await download(event.data.url);

    const result = patchPenpotArchive(archive, {
      fileIdReplacements: event.data.fileIdReplacements,
      linkLibraries: event.data.linkLibraries,
      onProgress: (processed, total) => post({ type: 'patch-progress', processed, total }),
    });

    post({ type: 'done', archive: result.archive, replacements: result.replacements, linkedLibraries: result.linkedLibraries });
  } catch (error) {
    post({ type: 'error', message: error instanceof Error ? error.message : String(error) });
  }
};
