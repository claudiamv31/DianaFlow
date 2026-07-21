import { act, fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';
import { THEME_STORAGE_KEY } from './theme';

const ThemeProbe = () => {
  const { themePreference, resolvedTheme, setThemePreference } = useTheme();
  return (
    <>
      <span>{`${themePreference}:${resolvedTheme}`}</span>
      <button onClick={() => setThemePreference('light')}>Use light</button>
    </>
  );
};

describe('theme preference', () => {
  let systemThemeListener;
  let systemPrefersDark;

  beforeEach(() => {
    window.localStorage.clear();
    systemPrefersDark = true;
    systemThemeListener = undefined;
    window.matchMedia = jest.fn(() => ({
      get matches() {
        return systemPrefersDark;
      },
      addEventListener: (_event, listener) => {
        systemThemeListener = listener;
      },
      removeEventListener: jest.fn()
    }));
  });

  test('defaults to System and follows live device changes', () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    expect(screen.getByText('system:dark')).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');

    systemPrefersDark = false;
    act(() => systemThemeListener());

    expect(screen.getByText('system:light')).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  });

  test('persists a manual override', () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Use light' }));

    expect(screen.getByText('light:light')).toBeInTheDocument();
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(document.documentElement).toHaveAttribute(
      'data-theme-preference',
      'light'
    );
  });
});
