import { phaseTranslationKey } from './domainCodes';

describe('domain code translation keys', () => {
  test.each([
    ['Luteal', 'phase.luteal'],
    ['luteal', 'phase.luteal'],
    ['OVULATION', 'phase.ovulation']
  ])('normalizes the API phase code %s', (phase, expectedKey) => {
    expect(phaseTranslationKey(phase)).toBe(expectedKey);
  });
});
