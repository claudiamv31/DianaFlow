import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SignUp from './SignUp';
import apiClient from '../../api/apiClient';

jest.mock('../../api/apiClient', () => ({
  post: jest.fn(),
  login: jest.fn()
}));

jest.mock('../../utils/timeZone', () => ({
  getClientTimeZone: () => 'America/Mazatlan'
}));

describe('SignUp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderSignUp = () =>
    render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<SignUp />} />
          <Route path="/period-setup" element={<h2>Period setup</h2>} />
        </Routes>
      </MemoryRouter>
    );

  test('marks every missing field inside the input', async () => {
    renderSignUp();

    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(screen.getAllByText('Required')).toHaveLength(4);
    expect(screen.getByPlaceholderText('Jane')).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(screen.getByPlaceholderText('Doe')).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(screen.getByPlaceholderText(/jane@sanctuary.com/i)).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(screen.getByPlaceholderText('••••••••')).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  test('submits the expected payload and navigates to period setup', async () => {
    apiClient.post.mockResolvedValueOnce({});
    apiClient.login.mockResolvedValueOnce({
      accessToken: 'access-token',
      refreshToken: 'refresh-token'
    });
    renderSignUp();

    await userEvent.type(screen.getByPlaceholderText('Jane'), 'Jane');
    await userEvent.type(screen.getByPlaceholderText('Doe'), 'Doe');
    await userEvent.type(
      screen.getByPlaceholderText(/jane@sanctuary.com/i),
      'jane@example.com'
    );
    await userEvent.type(
      screen.getByPlaceholderText('••••••••'),
      'secure-password'
    );
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /period setup/i })
      ).toBeInTheDocument();
    });

    expect(apiClient.post).toHaveBeenCalledWith('/users/sign-up', {
      Name: 'Jane',
      LastName: 'Doe',
      Email: 'jane@example.com',
      Password: 'secure-password',
      TimeZone: 'America/Mazatlan'
    });
    expect(apiClient.login).toHaveBeenCalledWith(
      'jane@example.com',
      'secure-password'
    );
  });

  test('shows a localized fallback when sign up fails', async () => {
    apiClient.post.mockRejectedValue({
      code: 'ERR_BAD_REQUEST',
      response: {
        data: {
          message: 'The email is alredy in use.'
        }
      }
    });
    renderSignUp();

    await userEvent.type(screen.getByPlaceholderText('Jane'), 'Jane');
    await userEvent.type(screen.getByPlaceholderText('Doe'), 'Doe');
    await userEvent.type(
      screen.getByPlaceholderText(/jane@sanctuary.com/i),
      'jane@example.com'
    );
    await userEvent.type(
      screen.getByPlaceholderText('••••••••'),
      'secure-password'
    );
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(
      await screen.findByText('Error creating account')
    ).toBeInTheDocument();
  });
});
