import fs from 'fs';
import path from 'path';

const readSource = (relativePath) =>
  fs.readFileSync(path.join(__dirname, relativePath), 'utf8');

const parseRgbToken = (css, token) => {
  const match = css.match(
    new RegExp(`--color-${token}:\\s*(\\d+)\\s+(\\d+)\\s+(\\d+);`)
  );
  return match.slice(1).map(Number);
};

const relativeLuminance = ([red, green, blue]) => {
  const channels = [red, green, blue].map((channel) => {
    const value = channel / 255;
    return value <= 0.04045
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

const contrastRatio = (first, second) => {
  const lighter = Math.max(relativeLuminance(first), relativeLuminance(second));
  const darker = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (lighter + 0.05) / (darker + 0.05);
};

const themeCss = readSource('../styles/tokens.css');
const darkThemeCss = themeCss.match(
  /:root\[data-theme='dark'\]\s*\{([\s\S]*?)\n\}/
)[1];

test('the selected calendar day uses a readable semantic foreground', () => {
  const calendarCss = readSource(
    '../pages/CalendarPage/CalendarView/CalendarView.css'
  );
  const selectedRule = calendarCss.match(
    /\.calendar-view \.react-calendar__tile\.calendar-day-selected\s*\{([^}]*)\}/
  )[1];

  expect(selectedRule).toContain('color: rgb(var(--color-on-secondary));');

  const foreground = parseRgbToken(darkThemeCss, 'on-secondary');
  const background = parseRgbToken(darkThemeCss, 'secondary');
  expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
});

test('the dark primary palette stays muted and readable', () => {
  const primary = parseRgbToken(darkThemeCss, 'primary');
  const background = parseRgbToken(darkThemeCss, 'background');
  const primaryContainer = parseRgbToken(darkThemeCss, 'primary-container');
  const onPrimary = parseRgbToken(darkThemeCss, 'on-primary');

  expect(relativeLuminance(primary)).toBeLessThanOrEqual(0.45);
  expect(contrastRatio(primary, background)).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio(onPrimary, primaryContainer)).toBeGreaterThanOrEqual(4.5);
});
