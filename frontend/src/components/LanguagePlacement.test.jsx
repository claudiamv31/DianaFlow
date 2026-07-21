import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header/Header';
import Settings from '../pages/Settings/Settings';
import Login from '../pages/Login/Login';
import SignUp from '../pages/SignUp/SignUp';
import { LocaleProvider } from '../i18n/LocaleContext';
import { ThemeProvider } from '../theme/ThemeContext';

jest.mock('../database/authService', () => ({
  checkUser: (callback) => {
    callback(null);
    return jest.fn();
  },
  logout: jest.fn()
}));

jest.mock('../api/apiClient', () => ({
  __esModule: true,
  default: {
    login: jest.fn(),
    checkUser: jest.fn(),
    post: jest.fn()
  }
}));

jest.mock('../hooks/useProfileHooks', () => ({
  useGetProfile: () => ({ data: null, isLoading: false }),
  useUpdateProfile: () => ({ isPending: false, mutateAsync: jest.fn() }),
  useChangePassword: () => ({ isPending: false, mutateAsync: jest.fn() })
}));

const renderWithAppContext = (component) =>
  render(
    <MemoryRouter>
      <ThemeProvider>
        <LocaleProvider>{component}</LocaleProvider>
      </ThemeProvider>
    </MemoryRouter>
  );

describe('language selector placement', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('is available from Settings', () => {
    renderWithAppContext(<Settings />);

    const languageSelector = screen.getByRole('combobox', { name: 'Language' });
    expect(languageSelector).toBeVisible();
    expect(screen.getByRole('combobox', { name: 'Theme' })).toBeVisible();

    const languageIcon = screen.getByTestId('language-setting-icon');
    expect(languageIcon).toHaveClass('text-primary');
    expect(screen.getByTestId('language-setting-icon-container')).toHaveClass(
      'bg-primary-container/20'
    );

    const settingsQuote = screen.getByText(/Embrace the shifting tides/);
    expect(settingsQuote).toHaveClass('bg-surface-container-high');
    expect(settingsQuote).toHaveClass('text-on-surface-variant');
  });

  test('is not displayed in the authenticated header', () => {
    renderWithAppContext(<Header />);

    expect(
      screen.queryByRole('combobox', { name: 'Language' })
    ).not.toBeInTheDocument();
  });

  test('remains available on Login and Sign Up', () => {
    const { unmount } = renderWithAppContext(<Login />);

    expect(screen.getByRole('combobox', { name: 'Language' })).toBeVisible();
    unmount();

    renderWithAppContext(<SignUp />);

    expect(screen.getByRole('combobox', { name: 'Language' })).toBeVisible();
  });
});
