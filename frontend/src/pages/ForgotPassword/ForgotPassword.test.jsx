import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ForgotPassword from './ForgotPassword';
import apiClient from '../../api/apiClient';
import { LocaleProvider } from '../../i18n/LocaleContext';
import { ThemeProvider } from '../../theme/ThemeContext';

jest.mock('../../api/apiClient', () => ({
  __esModule: true,
  default: { requestPasswordReset: jest.fn() }
}));

test('requests a password reset in the selected locale', async () => {
  window.localStorage.setItem('dianaFlowLocale', 'es-MX');
  apiClient.requestPasswordReset.mockResolvedValue({});

  render(
    <MemoryRouter>
      <ThemeProvider>
        <LocaleProvider>
          <ForgotPassword />
        </LocaleProvider>
      </ThemeProvider>
    </MemoryRouter>
  );

  await userEvent.type(
    screen.getByRole('textbox', { name: /correo electrónico/i }),
    'Diana@Example.com'
  );
  await userEvent.click(
    screen.getByRole('button', { name: /enviar enlace/i })
  );

  expect(apiClient.requestPasswordReset).toHaveBeenCalledWith(
    'Diana@Example.com',
    'es-MX'
  );
  expect(await screen.findByText(/revisa tu correo/i)).toBeInTheDocument();
});
