import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ResetPassword from './ResetPassword';
import apiClient from '../../api/apiClient';
import { LocaleProvider } from '../../i18n/LocaleContext';
import { ThemeProvider } from '../../theme/ThemeContext';

jest.mock('../../api/apiClient', () => ({
  __esModule: true,
  default: {
    validatePasswordResetToken: jest.fn(),
    resetPassword: jest.fn()
  }
}));

test('shows the password form only after the emailed token is validated', async () => {
  apiClient.validatePasswordResetToken.mockResolvedValue({});

  render(
    <MemoryRouter initialEntries={['/reset-password?token=valid-token']}>
      <ThemeProvider>
        <LocaleProvider>
          <ResetPassword />
        </LocaleProvider>
      </ThemeProvider>
    </MemoryRouter>
  );

  expect(screen.queryByLabelText(/^new password$/i)).not.toBeInTheDocument();
  expect(await screen.findByLabelText(/^new password$/i)).toBeInTheDocument();
  expect(apiClient.validatePasswordResetToken).toHaveBeenCalledWith(
    'valid-token'
  );
  expect(screen.getByRole('combobox', { name: /theme/i })).toBeInTheDocument();
});

test('shows an invalid-link state instead of the password form', async () => {
  apiClient.validatePasswordResetToken.mockRejectedValue({
    response: { data: { code: 'PASSWORD_RESET_TOKEN_INVALID' } }
  });

  render(
    <MemoryRouter initialEntries={['/reset-password?token=expired-token']}>
      <ThemeProvider>
        <LocaleProvider>
          <ResetPassword />
        </LocaleProvider>
      </ThemeProvider>
    </MemoryRouter>
  );

  expect(
    await screen.findByRole('heading', { name: /link cannot be used/i })
  ).toBeInTheDocument();
  expect(screen.queryByLabelText(/^new password$/i)).not.toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: /request another link/i })
  ).toHaveAttribute('href', '/forgot-password');
});
