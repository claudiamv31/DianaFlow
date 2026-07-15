import {
  calendarPhaseDayTranslationKey,
  phaseTranslationKey
} from './domainCodes';

describe('domain code translation keys', () => {
  test.each([
    ['Luteal', 'phase.luteal'],
    ['luteal', 'phase.luteal'],
    ['OVULATION', 'phase.ovulation']
  ])('normalizes the API phase code %s', (phase, expectedKey) => {
    expect(phaseTranslationKey(phase)).toBe(expectedKey);
  });

  test('normalizes a Calendar Day phase key from legacy API casing', () => {
    expect(calendarPhaseDayTranslationKey('Luteal')).toBe(
      'calendar.phaseDay.luteal'
    );
  });
});
