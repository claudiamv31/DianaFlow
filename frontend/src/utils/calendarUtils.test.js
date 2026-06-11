import {
  formatDateLocal,
  formatDateMexican,
  parseLocalDate,
  formatLongDate,
  formatMonthDay,
  formatDateShort,
  formatDateDayMonthYear
} from './calendarUtils';

describe('calendarUtils', () => {
  test('formats dates for API and Mexican display formats', () => {
    const date = new Date(2026, 5, 10);

    expect(formatDateLocal(date)).toBe('2026-06-10');
    expect(formatDateMexican(date)).toBe('10/06/2026');
  });

  test('parses yyyy-mm-dd strings as local dates', () => {
    const date = parseLocalDate('2026-06-10');

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(5);
    expect(date.getDate()).toBe(10);
  });

  test('parses unix timestamps in seconds using the UTC date parts', () => {
    const date = parseLocalDate(1781222400);

    expect(formatDateLocal(date)).toBe('2026-06-12');
  });

  test('returns null for empty date values', () => {
    expect(parseLocalDate('')).toBeNull();
    expect(parseLocalDate(null)).toBeNull();
  });

  test('formats readable English dates', () => {
    expect(formatLongDate('2026-06-10')).toBe('Wednesday, June 10, 2026');
    expect(formatMonthDay('2026-06-10')).toBe('June 10');
    expect(formatDateShort('2026-06-10')).toBe('Jun 10');
    expect(formatDateDayMonthYear('2026-06-10')).toBe('Jun 10, 2026');
  });
});
