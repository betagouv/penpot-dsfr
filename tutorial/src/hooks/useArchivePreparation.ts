import { useCallback, useEffect, useRef, useState } from 'react';

import type { PatchArchiveMessage, PatchArchiveRequest } from '@tutorial/src/workers/patch-archive.worker';

export type ArchivePreparation =
  | { status: 'idle' }
  | { status: 'downloading'; progress: number | null }
  | { status: 'patching'; progress: number }
  | { status: 'ready'; downloadUrl: string; fileName: string; replacedReferences: number; linkedLibraries: number }
  | { status: 'error'; message: string };

export interface PrepareArchiveParams {
  url: string;
  fileName: string;
  fileIdReplacements: Record<string, string>;
  linkLibraries: boolean;
}

export function triggerBrowserDownload(url: string, fileName: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function useArchivePreparation() {
  const [preparation, setPreparation] = useState<ArchivePreparation>({ status: 'idle' });
  const workerRef = useRef<Worker | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const cleanUp = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  useEffect(() => cleanUp, [cleanUp]);

  const reset = useCallback(() => {
    cleanUp();
    setPreparation({ status: 'idle' });
  }, [cleanUp]);

  const prepare = useCallback(
    (params: PrepareArchiveParams) => {
      cleanUp();

      // Nothing to replace: the published file can be downloaded as it is
      if (Object.keys(params.fileIdReplacements).length === 0) {
        setPreparation({ status: 'ready', downloadUrl: params.url, fileName: params.fileName, replacedReferences: 0, linkedLibraries: 0 });
        triggerBrowserDownload(params.url, params.fileName);

        return;
      }

      setPreparation({ status: 'downloading', progress: null });

      const worker = new Worker(new URL('../workers/patch-archive.worker.ts', import.meta.url), { type: 'module' });
      workerRef.current = worker;

      worker.onmessage = (event: MessageEvent<PatchArchiveMessage>) => {
        const message = event.data;

        switch (message.type) {
          case 'download-progress':
            setPreparation({ status: 'downloading', progress: message.total ? message.loaded / message.total : null });
            break;
          case 'patch-progress':
            setPreparation({ status: 'patching', progress: message.processed / message.total });
            break;
          case 'done': {
            const objectUrl = URL.createObjectURL(message.archive);
            objectUrlRef.current = objectUrl;

            setPreparation({
              status: 'ready',
              downloadUrl: objectUrl,
              fileName: params.fileName,
              replacedReferences: Object.values(message.replacements).reduce((sum, count) => sum + count, 0),
              linkedLibraries: message.linkedLibraries.length,
            });
            triggerBrowserDownload(objectUrl, params.fileName);

            worker.terminate();
            workerRef.current = null;
            break;
          }
          case 'error':
            setPreparation({ status: 'error', message: message.message });
            worker.terminate();
            workerRef.current = null;
            break;
        }
      };

      worker.onerror = (event) => {
        setPreparation({ status: 'error', message: event.message || 'erreur inattendue' });
      };

      worker.postMessage({
        url: new URL(params.url, window.location.href).toString(),
        fileIdReplacements: params.fileIdReplacements,
        linkLibraries: params.linkLibraries,
      } satisfies PatchArchiveRequest);
    },
    [cleanUp]
  );

  return { preparation, prepare, reset };
}
