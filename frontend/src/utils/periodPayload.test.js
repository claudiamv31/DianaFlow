import { buildPeriodPayload } from './periodPayload';

describe('buildPeriodPayload', () => {
  test('builds selected days from the period start and duration', () => {
    expect(buildPeriodPayload('2026-01-30', 3)).toEqual({
      selectedDays: [
        { date: '2026-01-30', flow: 2 },
        { date: '2026-01-31', flow: 2 },
        { date: '2026-02-01', flow: 2 }
      ]
    });
  });

  test('returns no selected days for invalid setup input', () => {
    expect(buildPeriodPayload('', 5)).toEqual({ selectedDays: [] });
    expect(buildPeriodPayload('2026-01-30', 0)).toEqual({ selectedDays: [] });
  });
});
