import { pseudoLocalize } from './pseudoLocale';

describe('development pseudo-locale', () => {
  test('expands visible text without corrupting interpolation variables', () => {
    const result = pseudoLocalize('Save {{count}} days');

    expect(result).toMatch(/^\[/);
    expect(result).toContain('{{count}}');
    expect(result.length).toBeGreaterThan('Save {{count}} days'.length);
  });
});
