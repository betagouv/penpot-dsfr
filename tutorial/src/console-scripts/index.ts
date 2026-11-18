import relinkCopiesSource from '@tutorial/src/console-scripts/relink-copies.js?raw';
import relinkFontsSource from '@tutorial/src/console-scripts/relink-fonts.js?raw';
import apiSource from '@tutorial/src/console-scripts/shared/api.js?raw';
import fontsSource from '@tutorial/src/console-scripts/shared/fonts.js?raw';

// Code shared by the scripts, kept once in the repository. A script pasted into the browser console must be a single
// self-contained block, so each `// @include <path>` line is replaced by the shared file, indented like the marker.
const sharedSources: Record<string, string> = {
  'shared/api.js': apiSource,
  'shared/fonts.js': fontsSource,
};

export function assembleConsoleScript(source: string, shared: Record<string, string> = sharedSources): string {
  return source.replace(/^([ \t]*)\/\/ @include (\S+)[ \t]*$/gm, (_marker, indent: string, path: string) => {
    const content = shared[path];
    if (content === undefined) {
      throw new Error(`Unknown shared console script "${path}"`);
    }

    return content
      .trimEnd()
      .split('\n')
      .map((line) => (line ? indent + line : line))
      .join('\n');
  });
}

export const relinkFontsScript = assembleConsoleScript(relinkFontsSource);
export const relinkCopiesScript = assembleConsoleScript(relinkCopiesSource);
