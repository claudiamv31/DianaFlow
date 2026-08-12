import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocaleProvider } from '../../../i18n/LocaleContext';
import ChangePasswordModal from './ChangePasswordModal';

const mockChangePassword = jest.fn();

jest.mock('../../../hooks/useProfileHooks', () => ({
  useChangePassword: () => ({
    isPending: false,
    mutateAsync: mockChangePassword
  })
}));

test('toggles fields independently, preserves errors, and resets visibility when reopened', async () => {
  mockChangePassword.mockRejectedValue({
    response: { data: { code: 'CURRENT_PASSWORD_INCORRECT' } }
  });
  const onClose = jest.fn();
  const view = render(
    <LocaleProvider>
      <ChangePasswordModal isOpen onClose={onClose} />
    </LocaleProvider>
  );

  const currentPassword = screen.getByLabelText(/^current password$/i);
  const newPassword = screen.getByLabelText(/^new password$/i);
  const confirmPassword = screen.getByLabelText(/^confirm new password$/i);
  await userEvent.type(currentPassword, 'CurrentPassword1');
  await userEvent.type(newPassword, 'NewPassword1');
  await userEvent.type(confirmPassword, 'NewPassword1');

  const toggles = screen.getAllByRole('button', { name: 'Show password' });
  await userEvent.click(toggles[1]);

  expect(currentPassword).toHaveAttribute('type', 'password');
  expect(newPassword).toHaveAttribute('type', 'text');
  expect(confirmPassword).toHaveAttribute('type', 'password');

  await userEvent.click(screen.getByRole('button', { name: 'Change' }));

  expect(
    await screen.findByText('The current password is incorrect.')
  ).toBeInTheDocument();
  expect(newPassword).toHaveAttribute('type', 'text');

  view.rerender(
    <LocaleProvider>
      <ChangePasswordModal isOpen={false} onClose={onClose} />
    </LocaleProvider>
  );
  view.rerender(
    <LocaleProvider>
      <ChangePasswordModal isOpen onClose={onClose} />
    </LocaleProvider>
  );

  expect(screen.getByLabelText(/^new password$/i)).toHaveAttribute(
    'type',
    'password'
  );
  expect(screen.getAllByRole('button', { name: 'Show password' })).toHaveLength(
    3
  );
});
