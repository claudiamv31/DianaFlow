import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Login from './Login';
import apiClient from '../../api/apiClient';
import { LocaleProvider } from '../../i18n/LocaleContext';

jest.mock('../../api/apiClient', () => ({
  __esModule: true,
  default: {
    login: jest.fn(),
    checkUser: jest.fn()
  }
}));

describe('Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  const renderLogin = () =>
    render(
      <MemoryRouter initialEntries={['/login']}>
        <LocaleProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<h2>Home page</h2>} />
          </Routes>
        </LocaleProvider>
      </MemoryRouter>
    );

  test('marks missing email and password inside the inputs', async () => {
    renderLogin();

    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getAllByText('Required')).toHaveLength(2);
    expect(screen.getByPlaceholderText(/name@example.com/i)).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(screen.getByPlaceholderText('Enter your password')).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(apiClient.login).not.toHaveBeenCalled();
  });

  test('updates visible validation messages after changing language', async () => {
    renderLogin();

    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(screen.getAllByText('Required')).toHaveLength(2);

    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Language' }),
      'es-MX'
    );

    expect(screen.getAllByText('Obligatorio')).toHaveLength(2);
  });

  test('shows wrong password message on the password field', async () => {
    apiClient.login.mockRejectedValue({
      response: {
        status: 401,
        data: {
          field: 'password',
          code: 'INVALID_CREDENTIALS'
        }
      }
    });
    renderLogin();

    await userEvent.type(
      screen.getByPlaceholderText(/name@example.com/i),
      'jane@example.com'
    );
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'wrong-password');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(
      await screen.findByText('The password does not match this account.')
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toHaveAttribute(
      'aria-invalid',
      'true'
    );
  });

  test('navigates home after a successful login and user check', async () => {
    apiClient.login.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token'
    });
    apiClient.checkUser.mockResolvedValue({ id: '1', email: 'jane@example.com' });
    renderLogin();

    await userEvent.type(
      screen.getByPlaceholderText(/name@example.com/i),
      'jane@example.com'
    );
    await userEvent.type(
      screen.getByPlaceholderText('Enter your password'),
      'correct-password'
    );
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /home page/i })
      ).toBeInTheDocument();
    });
  });
});
