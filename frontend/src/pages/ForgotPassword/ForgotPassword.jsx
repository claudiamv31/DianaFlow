import { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import Button from '../../components/Button';
import { useLocale } from '../../i18n/LocaleContext';
import PasswordResetLayout, {
  ResetLinkFooter
} from '../ResetPassword/PasswordResetLayout';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ForgotPassword() {
  const { t, locale } = useLocale();
  const [email, setEmail] = useState('');
  const [errorKey, setErrorKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorKey('auth.validation.email');
      return;
    }
    if (!emailPattern.test(trimmedEmail)) {
      setErrorKey('passwordReset.emailInvalid');
      return;
    }

    setLoading(true);
    setErrorKey('');
    try {
      await apiClient.requestPasswordReset(trimmedEmail, locale);
      setSubmitted(true);
    } catch {
      setErrorKey('passwordReset.requestFailed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PasswordResetLayout
      subtitle={t('passwordReset.forgotSubtitle')}
      footer={
        <ResetLinkFooter
          promptKey="passwordReset.remembered"
          linkKey="auth.signIn"
          to="/login"
        />
      }
    >
      {submitted ? (
        <div className="flex flex-col gap-6 text-center">
          <div>
            <h2 className="text-2xl font-headline font-bold text-primary">
              {t('passwordReset.checkEmail')}
            </h2>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">
              {t('passwordReset.genericAcknowledgement')}{' '}
              {t('passwordReset.expires')}
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 font-headline font-semibold text-on-primary shadow-action transition hover:brightness-110"
          >
            {t('passwordReset.backToSignIn')}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="forgot-password-email"
              className="text-xs font-semibold text-primary uppercase tracking-wider px-1"
            >
              {t('auth.emailAddress')}
            </label>
            <input
              id="forgot-password-email"
              type="email"
              placeholder={t('auth.placeholder.email')}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setErrorKey('');
              }}
              aria-invalid={Boolean(errorKey)}
              aria-describedby={errorKey ? 'forgot-email-error' : undefined}
              className={`auth-input w-full rounded-full py-4 px-6 text-sm text-on-surface placeholder:text-outline transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                errorKey
                  ? 'auth-input-error'
                  : 'bg-surface-container-high/60'
              }`}
            />
            {errorKey && (
              <p id="forgot-email-error" className="px-1 text-xs font-semibold text-error">
                {t(errorKey)}
              </p>
            )}
          </div>
          <Button type="submit" disabled={loading} variant="primary">
            {t(loading ? 'passwordReset.sending' : 'passwordReset.sendLink')}
          </Button>
        </form>
      )}
    </PasswordResetLayout>
  );
}

export default ForgotPassword;
