import { fireEvent, render, screen } from '@testing-library/react';
import { LocaleProvider } from '../i18n/LocaleContext';
import { ThemeProvider } from '../theme/ThemeContext';
import { THEME_STORAGE_KEY } from '../theme/theme';
import ThemeSelector from './ThemeSelector';

describe('ThemeSelector', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.matchMedia = jest.fn(() => ({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    }));
  });

  test('offers System, Light, and Dark and remembers the selection', () => {
    render(
      <ThemeProvider>
        <LocaleProvider>
          <ThemeSelector />
        </LocaleProvider>
      </ThemeProvider>
    );

    const selector = screen.getByRole('combobox', { name: 'Theme' });
    expect(selector).toHaveValue('system');
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      'System',
      'Light',
      'Dark'
    ]);

    fireEvent.change(selector, { target: { value: 'dark' } });

    expect(selector).toHaveValue('dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });
});
