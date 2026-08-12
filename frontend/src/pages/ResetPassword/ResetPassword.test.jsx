import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ResetPassword from './ResetPassword';
import apiClient from '../../api/apiClient';
import { LocaleProvider } from '../../i18n/LocaleContext';
import { ThemeProvider } from '../../theme/ThemeContext';
import userEvent from '@testing-library/user-event';

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

test('toggles reset password fields independently and preserves visibility on error', async () => {
  apiClient.validatePasswordResetToken.mockResolvedValue({});
  apiClient.resetPassword.mockRejectedValue({
    response: { data: { field: 'newPassword', code: 'PASSWORD_WEAK' } }
  });

  render(
    <MemoryRouter initialEntries={['/reset-password?token=valid-token']}>
      <ThemeProvider>
        <LocaleProvider>
          <ResetPassword />
        </LocaleProvider>
      </ThemeProvider>
    </MemoryRouter>
  );

  const newPassword = await screen.findByLabelText(/^new password$/i);
  const confirmPassword = screen.getByLabelText(/^confirm new password$/i);
  await userEvent.type(newPassword, 'SecurePassword1');
  await userEvent.type(confirmPassword, 'SecurePassword1');

  const toggles = screen.getAllByRole('button', { name: 'Show password' });
  await userEvent.click(toggles[0]);

  expect(newPassword).toHaveAttribute('type', 'text');
  expect(confirmPassword).toHaveAttribute('type', 'password');

  await userEvent.click(
    screen.getByRole('button', { name: /update password/i })
  );

  expect(await screen.findByText(/uppercase, lowercase/i)).toBeInTheDocument();
  expect(newPassword).toHaveAttribute('type', 'text');
  expect(confirmPassword).toHaveAttribute('type', 'password');
});
