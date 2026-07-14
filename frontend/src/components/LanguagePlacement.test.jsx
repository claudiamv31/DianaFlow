import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header/Header';
import Settings from '../pages/Settings/Settings';
import Login from '../pages/Login/Login';
import SignUp from '../pages/SignUp/SignUp';
import { LocaleProvider } from '../i18n/LocaleContext';

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
      <LocaleProvider>{component}</LocaleProvider>
    </MemoryRouter>
  );

describe('language selector placement', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('is available from Settings', () => {
    renderWithAppContext(<Settings />);

    expect(screen.getByRole('combobox', { name: 'Language' })).toBeVisible();
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
