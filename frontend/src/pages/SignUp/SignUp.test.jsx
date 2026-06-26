import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SignUp from './SignUp';

describe('SignUp', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
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
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('submits the expected payload and navigates to period setup', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'jwt-token' })
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

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5039/api/users/sign-up',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Name: 'Jane',
          LastName: 'Doe',
          Email: 'jane@example.com',
          Password: 'secure-password'
        })
      })
    );
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5039/api/users/login',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'jane@example.com',
          password: 'secure-password'
        })
      })
    );
  });

  test('shows the backend error message when sign up fails', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'The email is alredy in use.' })
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
      await screen.findByText('The email is alredy in use.')
    ).toBeInTheDocument();
  });
});
