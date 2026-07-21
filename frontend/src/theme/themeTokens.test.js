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

test('the selected calendar day shares the primary action palette', () => {
  const calendarCss = readSource(
    '../pages/CalendarPage/CalendarView/CalendarView.css'
  );
  const buttonSource = readSource('../components/Button.jsx');
  const selectedRule = calendarCss.match(
    /\.calendar-view \.react-calendar__tile\.calendar-day-selected\s*\{([^}]*)\}/
  )[1];
  const selectedMarkerRule = calendarCss.match(
    /\.calendar-view \.react-calendar__tile\.calendar-day-selected::before\s*\{([^}]*)\}/
  )[1];

  expect(buttonSource).toContain('dark:bg-primary-container');
  expect(selectedRule).toContain('color: rgb(var(--color-on-primary));');
  expect(selectedMarkerRule).toContain(
    'background: rgb(var(--color-primary-container));'
  );

  const foreground = parseRgbToken(darkThemeCss, 'on-primary');
  const background = parseRgbToken(darkThemeCss, 'primary-container');
  expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
});

test('the Daily Focus card has a stable dark surface and readable copy', () => {
  const focusCardSource = readSource(
    '../pages/Home/YourPeriod/YourPeriodCard.jsx'
  );

  expect(focusCardSource).toContain('dark:bg-none dark:bg-accent-surface');
  expect(focusCardSource).toContain('dark:text-on-surface');

  const foreground = parseRgbToken(darkThemeCss, 'on-surface');
  const background = parseRgbToken(darkThemeCss, 'accent-surface');
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

test('dark surfaces use a lifted charcoal hierarchy instead of near-black', () => {
  const background = parseRgbToken(darkThemeCss, 'background');
  const lowestContainer = parseRgbToken(
    darkThemeCss,
    'surface-container-lowest'
  );
  const highContainer = parseRgbToken(darkThemeCss, 'surface-container-high');

  expect(relativeLuminance(background)).toBeGreaterThanOrEqual(0.01);
  expect(relativeLuminance(lowestContainer)).toBeGreaterThan(
    relativeLuminance(background)
  );
  expect(relativeLuminance(highContainer)).toBeGreaterThan(
    relativeLuminance(lowestContainer)
  );
});
