import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocaleProvider } from '../i18n/LocaleContext';
import PasswordInput from './PasswordInput';
import LanguageSelector from './LanguageSelector';

const renderPasswordInput = (props = {}) =>
  render(
    <LocaleProvider>
      <PasswordInput
        aria-label="Password"
        value="Secret123"
        onChange={() => {}}
        {...props}
      />
    </LocaleProvider>
  );

test('reveals and hides its value without changing it', async () => {
  const { unmount } = renderPasswordInput();
  const input = screen.getByLabelText('Password');
  const toggle = screen.getByRole('button', { name: 'Show password' });

  expect(input).toHaveAttribute('type', 'password');
  expect(toggle).toHaveAttribute('aria-pressed', 'false');
  expect(toggle).toHaveTextContent('visibility');

  await userEvent.click(toggle);

  expect(input).toHaveAttribute('type', 'text');
  expect(input).toHaveValue('Secret123');
  expect(
    screen.getByRole('button', { name: 'Hide password' })
  ).toHaveAttribute('aria-pressed', 'true');
  expect(
    screen.getByRole('button', { name: 'Hide password' })
  ).toHaveTextContent('visibility_off');

  await userEvent.click(
    screen.getByRole('button', { name: 'Hide password' })
  );
  expect(
    screen.getByRole('button', { name: 'Show password' })
  ).toHaveTextContent('visibility');

  unmount();
  renderPasswordInput();

  expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
});

test('keeps the toggle available for an empty password', () => {
  renderPasswordInput({ value: '' });

  expect(
    screen.getByRole('button', { name: 'Show password' })
  ).toBeInTheDocument();
});

test('updates the toggle label when the locale changes', async () => {
  window.localStorage.clear();
  render(
    <LocaleProvider>
      <LanguageSelector />
      <PasswordInput aria-label="Password" value="" onChange={() => {}} />
    </LocaleProvider>
  );

  await userEvent.selectOptions(
    screen.getByRole('combobox', { name: 'Language' }),
    'es-MX'
  );

  expect(
    screen.getByRole('button', { name: 'Mostrar contraseña' })
  ).toBeInTheDocument();
});
