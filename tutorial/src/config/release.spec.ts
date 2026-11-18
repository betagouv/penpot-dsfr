import { describe, expect, it } from 'vitest';

import { getPreviousMinorVersions } from './release';

describe('getPreviousMinorVersions()', () => {
  it('should list previous minor versions of the same major', () => {
    expect(getPreviousMinorVersions('1.14', 3)).toStrictEqual(['1.13', '1.12', '1.11']);
    expect(getPreviousMinorVersions('1.14.2', 2)).toStrictEqual(['1.13', '1.12']);
    expect(getPreviousMinorVersions('2.1', 10)).toStrictEqual(['2.0']);
  });
});
