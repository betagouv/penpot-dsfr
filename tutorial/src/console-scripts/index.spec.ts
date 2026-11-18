import { Script } from 'node:vm';
import { describe, expect, it } from 'vitest';

import { assembleConsoleScript, relinkCopiesScript, relinkFontsScript } from './index';

describe('assembleConsoleScript()', () => {
  it('should replace a marker by the shared file, with its indentation', () => {
    expect(assembleConsoleScript('(() => {\n  // @include a.js\n})();', { 'a.js': 'const a = 1;\n\nconst b = 2;\n' })).toBe(
      '(() => {\n  const a = 1;\n\n  const b = 2;\n})();'
    );
  });

  it('should fail on an unknown shared file', () => {
    expect(() => assembleConsoleScript('// @include missing.js', {})).toThrow('missing.js');
  });

  it.each([
    ['relink-fonts', relinkFontsScript],
    ['relink-copies', relinkCopiesScript],
  ])('should produce a self-contained %s script', (_name, script) => {
    expect(script).not.toMatch(/^\s*\/\/ @include /m);
    expect(script).toContain('const toVerbose');
    expect(script).toContain('const relinkFonts');
    // Only compiled, not run
    expect(() => new Script(script)).not.toThrow();
  });
});
