import { describe, expect, it } from 'vitest';

import { isPenpotSaasOrigin, parsePenpotUrl } from './penpot-url';

describe('parsePenpotUrl()', () => {
  it('should extract identifiers from a workspace URL', () => {
    expect(
      parsePenpotUrl(
        ' https://design.penpot.app/#/workspace?team-id=3D04E89B-bff0-8115-8004-bc137de720b4&file-id=8580c946-af19-8023-8008-17197d548299&page-id=019e6f71-1018-7447-ae08-c1a1ea99d419 '
      )
    ).toStrictEqual({
      success: true,
      fileId: '8580c946-af19-8023-8008-17197d548299',
      teamId: '3d04e89b-bff0-8115-8004-bc137de720b4',
      origin: 'https://design.penpot.app',
    });
  });

  it('should support self-hosted instances', () => {
    const result = parsePenpotUrl('http://localhost:9001/#/workspace?file-id=8580c946-af19-8023-8008-17197d548299');

    expect(result.success && result.origin).toBe('http://localhost:9001');
    expect(result.success && result.teamId).toBeNull();
  });

  it.each([
    ['', /renseigner/],
    ['design.penpot.app', /pas valide/],
    ['https://design.penpot.app/#/dashboard/recent?team-id=3d04e89b-bff0-8115-8004-bc137de720b4', /file-id/],
    ['https://design.penpot.app/#/workspace?file-id=not-a-uuid', /identifiant/],
  ])('should reject "%s"', (input, error) => {
    const result = parsePenpotUrl(input);

    expect(result.success).toBe(false);
    expect(!result.success && result.error).toMatch(error);
  });
});

describe('isPenpotSaasOrigin()', () => {
  it('should detect the SaaS', () => {
    expect(isPenpotSaasOrigin('https://design.penpot.app')).toBe(true);
    expect(isPenpotSaasOrigin('https://penpot.example.gouv.fr')).toBe(false);
  });
});
