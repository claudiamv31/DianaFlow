import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { getErrorMessageKey } from '../../api/AppError';
import Button from '../../components/Button';
import { useLocale } from '../../i18n/LocaleContext';
import PasswordResetLayout, { ResetLinkFooter } from './PasswordResetLayout';
import { isStrongPassword } from '../../utils/passwordPolicy';
import PasswordInput from '../../components/PasswordInput';

function ResetPassword() {
  const { t } = useLocale();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token')?.trim() || '', [searchParams]);
  const [tokenState, setTokenState] = useState(token ? 'validating' : 'invalid');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenState('invalid');
      return undefined;
    }

    let active = true;
    setTokenState('validating');
    apiClient
      .validatePasswordResetToken(token)
      .then(() => active && setTokenState('valid'))
      .catch(() => active && setTokenState('invalid'));

    return () => {
      active = false;
    };
  }, [token]);

  const validate = () => {
    const errors = {};
    if (!newPassword) errors.newPassword = 'password.newRequired';
    else if (!isStrongPassword(newPassword))
      errors.newPassword = 'passwordReset.passwordRequirement';

    if (!confirmPassword) errors.confirmPassword = 'passwordReset.confirmRequired';
    else if (newPassword !== confirmPassword)
      errors.confirmPassword = 'password.noMatch';

    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      await apiClient.resetPassword({ token, newPassword, confirmPassword });
      setCompleted(true);
    } catch (error) {
      const field = error.response?.data?.field || 'form';
      const errorKey = getErrorMessageKey(error, 'passwordReset.updateFailed');
      if (field === 'token') setTokenState('invalid');
      else setFieldErrors({ [field]: errorKey });
    } finally {
      setLoading(false);
    }
  };

  const clearError = (field) =>
    setFieldErrors((current) => ({ ...current, [field]: '', form: '' }));

  let content;
  if (tokenState === 'validating') {
    content = (
      <p role="status" className="text-center text-sm text-on-surface-variant">
        {t('passwordReset.validating')}
      </p>
    );
  } else if (tokenState === 'invalid') {
    content = (
      <div className="flex flex-col gap-6 text-center">
        <div>
          <h2 className="text-2xl font-headline font-bold text-primary">
            {t('passwordReset.invalidTitle')}
          </h2>
          <p className="mt-3 text-sm leading-6 text-on-surface-variant">
            {t('passwordReset.invalidLink')}
          </p>
        </div>
        <Link
          to="/forgot-password"
          className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 font-headline font-semibold text-on-primary shadow-action transition hover:brightness-110"
        >
          {t('passwordReset.requestAnother')}
        </Link>
      </div>
    );
  } else if (completed) {
    content = (
      <div className="flex flex-col gap-6 text-center">
        <div>
          <h2 className="text-2xl font-headline font-bold text-primary">
            {t('passwordReset.updatedTitle')}
          </h2>
          <p className="mt-3 text-sm leading-6 text-on-surface-variant">
            {t('passwordReset.updatedBody')}
          </p>
        </div>
        <Link
          to="/login"
          className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 font-headline font-semibold text-on-primary shadow-action transition hover:brightness-110"
        >
          {t('auth.signIn')}
        </Link>
      </div>
    );
  } else {
    content = (
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="new-password" className="text-xs font-semibold text-primary uppercase tracking-wider px-1">
            {t('password.new')}
          </label>
          <PasswordInput
            id="new-password"
            autoComplete="new-password"
            placeholder={t('auth.placeholder.password')}
            value={newPassword}
            onChange={(event) => {
              setNewPassword(event.target.value);
              clearError('newPassword');
            }}
            aria-invalid={Boolean(fieldErrors.newPassword)}
            aria-describedby={fieldErrors.newPassword ? 'new-password-error' : undefined}
            className={`auth-input w-full rounded-full py-4 pl-6 text-sm text-on-surface placeholder:text-outline transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 ${fieldErrors.newPassword ? 'auth-input-error' : 'bg-surface-container-high/60'}`}
          />
          {fieldErrors.newPassword && (
            <p id="new-password-error" className="px-1 text-xs font-semibold text-error">
              {t(fieldErrors.newPassword)}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="confirm-password" className="text-xs font-semibold text-primary uppercase tracking-wider px-1">
            {t('password.confirm')}
          </label>
          <PasswordInput
            id="confirm-password"
            autoComplete="new-password"
            placeholder={t('auth.placeholder.password')}
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              clearError('confirmPassword');
            }}
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
            aria-describedby={fieldErrors.confirmPassword ? 'confirm-password-error' : undefined}
            className={`auth-input w-full rounded-full py-4 pl-6 text-sm text-on-surface placeholder:text-outline transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 ${fieldErrors.confirmPassword ? 'auth-input-error' : 'bg-surface-container-high/60'}`}
          />
          {fieldErrors.confirmPassword && (
            <p id="confirm-password-error" className="px-1 text-xs font-semibold text-error">
              {t(fieldErrors.confirmPassword)}
            </p>
          )}
        </div>
        {fieldErrors.form && (
          <p className="rounded-2xl border border-error/30 bg-error-container/10 px-4 py-3 text-center text-xs font-semibold text-error">
            {t(fieldErrors.form)}
          </p>
        )}
        <Button type="submit" disabled={loading} variant="primary">
          {t(loading ? 'passwordReset.updating' : 'passwordReset.update')}
        </Button>
      </form>
    );
  }

  return (
    <PasswordResetLayout
      subtitle={t('passwordReset.resetSubtitle')}
      footer={tokenState === 'valid' && !completed ? (
        <ResetLinkFooter
          promptKey="passwordReset.needAnother"
          linkKey="passwordReset.requestAnother"
          to="/forgot-password"
        />
      ) : null}
    >
      {content}
    </PasswordResetLayout>
  );
}

export default ResetPassword;
