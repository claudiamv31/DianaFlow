import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PrivateRoute, PublicRoute } from './routesGuards';
import { checkUser } from '../../database/authService';

jest.mock('../../database/authService', () => ({
  checkUser: jest.fn()
}));

describe('route guards', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('PrivateRoute shows children when a user is authenticated', async () => {
    checkUser.mockImplementation((callback) => {
      callback({ id: '1', email: 'jane@example.com' });
      return jest.fn();
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <h1>Private content</h1>
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<h1>Login page</h1>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: /private content/i })).toBeInTheDocument();
  });

  test('PrivateRoute redirects to login when no user exists', async () => {
    checkUser.mockImplementation((callback) => {
      callback(null);
      return jest.fn();
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <h1>Private content</h1>
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<h1>Login page</h1>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: /login page/i })).toBeInTheDocument();
  });

  test('PublicRoute redirects authenticated users away from public pages', async () => {
    checkUser.mockImplementation((callback) => {
      callback({ id: '1', email: 'jane@example.com' });
      return jest.fn();
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <h1>Login page</h1>
              </PublicRoute>
            }
          />
          <Route path="/" element={<h1>Home page</h1>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /home page/i })).toBeInTheDocument();
    });
  });
});
