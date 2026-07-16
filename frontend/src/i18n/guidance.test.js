import i18n from './instance';
import { translateGuidance } from './guidance';

describe('localized guidance contract', () => {
  test('translates a known backend guidance key', () => {
    expect(
      translateGuidance(
        i18n.t.bind(i18n),
        'guidance.insight.menstruation.restore',
        'insight'
      )
    ).toBe('Your energy may feel lower today. Consider making room for rest.');
  });

  test('uses a translated safe fallback for an unknown backend key', () => {
    expect(
      translateGuidance(i18n.t.bind(i18n), 'unknown.backend.key', 'focus')
    ).toBe('Let your own experience guide what you need today.');
  });
});
